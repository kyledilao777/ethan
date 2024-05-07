require("dotenv").config();
const cors = require("cors");
const url = require("url");
const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const MongoStore = require("connect-mongo");
const { google } = require("googleapis");
const axios = require("axios");
const port = process.env.PORT;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

let userCredential = null;
async function main() {
  const app = express();

  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      // saveUninitialized: true,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        path: "/",
        domain: ".untangled-ai.com",
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(
    cors({
      origin: [
        "https://main.untangled-ai.com",
        "https://backend.untangled-ai.com",
        "https://untangled-ai.com",
        "https://www.untangled-ai.com",
      ],
      credentials: true,
      methods: "GET,POST,OPTIONS,PUT,DELETE",
      allowedHeaders:
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    })
  );

  app.use((req, res, next) => {
    console.log("Session ID:", req.sessionID);
    console.log("Session State:", req.session);
    next();
  });

  // app.use((req, res, next) => {
  //   const allowedOrigins = [
  //     "https://main.untangled-ai.com",
  //     "https://backend.untangled-ai.com",
  //     "https://untangled-ai.com",
  //     "https://www.untangled-ai.com",
  //   ];
  //   const origin = req.headers.origin;
  //   if (allowedOrigins.includes(origin)) {
  //     res.header("Access-Control-Allow-Origin", origin);
  //   }

  //   res.header("Access-Control-Allow-Credentials", "true");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  //   );
  //   res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  //   next();
  // });

  app.get("/login", (req, res) => {
    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString("hex");
    // Store state in the session
    req.session.state = state;

    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      // Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes: true,
      // Include the state parameter to reduce the risk of CSRF attacks.
      state: state,
    });
    res.redirect(url);
  });

  app.get("/oauth2callback", async (req, res) => {
    let q = url.parse(req.url, true).query;

    if (q.error) {
      console.log("Error:" + q.error);
      return res.status(400).send("Authentication error");
    } else if (q.state !== req.session.state) {
      console.log("State mismatch. Possible CSRF attack");
      return res.status(400).send("State mismatch. Possible CSRF attack");
    } else {
      let { tokens } = await oAuth2Client.getToken(q.code);
      oAuth2Client.setCredentials(tokens);
      req.session.tokens = tokens;
      delete req.session.state;

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).send("Failed to save session");
        }

        const redirectUrl = `${process.env.REDIRECT_HOME}`;
        res.redirect(redirectUrl);
      });
    }

    // try {
    //   const { tokens } = await oAuth2Client.getToken(code);
    //   if (!tokens) {
    //     console.error("Failed to retrieve tokens");
    //     return res.status(500).send("Failed to authenticate");
    //   }

    //   oAuth2Client.setCredentials(tokens);

    //   // Store the tokens in the session
    //   req.session.tokens = tokens; // Storing the entire tokens object

    //   console.log("Tokens stored in session:", req.session.tokens);

    //   // Save the session explicitly, if needed, then redirect
    //   req.session.save((err) => {
    //     if (err) {
    //       console.error("Session save error:", err);
    //       return res.status(500).send("Failed to save session");
    //     }

    //     console.log("Session saved successfully with tokens");
    //     const redirectUrl = `${process.env.REDIRECT_HOME}` /*||  "http://localhost:3000/home?auth=success"*/;
    //     res.redirect(redirectUrl);
    //   });
    // } catch (error) {
    //   console.error("Error during OAuth2 callback", error);
    //   res.status(500).send("Authentication error");
    // }
  });

  app.get("/auth-check", async (req, res) => {
    console.log("auth-check Session:", req.session);
    if (!req.session.tokens || !req.session.tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }

    // // Extract user info from the session
    // const { tokens } = req.session;
    // oAuth2Client.setCredentials(tokens);

    try {
      // Validate the token
      await oAuth2Client.getTokenInfo(tokens.access_token);
      console.log("auth check", tokens.access_token);
      return res.json({ isAuthenticated: true });
    } catch (error) {
      console.error("Invalid or expired token:", error);
      return res
        .status(401)
        .json({ isAuthenticated: false, error: "Invalid or expired token" });
    }
  });

  app.options("/user-info", (req, res) => {
    res.sendStatus(204);
  });

  app.get("/user-info", async (req, res) => {
    console.log("user-info Session:", req.session);
    if (!req.session.tokens || !req.session.tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }

    // // Extract user info from the session
    // const { tokens } = req.session;
    // oAuth2Client.setCredentials(tokens);

    const peopleService = google.people({ version: "v1", auth: oAuth2Client });
    try {
      const me = await peopleService.people.get({
        resourceName: "people/me",
        personFields: "names,photos",
      });

      const userInfo = {
        name: me.data.names[0].displayName,
        photo: me.data.photos[0].url,
      };

      res.json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching user info");
    }
  });

  app.get("/fetch-calendar-events", async (req, res) => {
    console.log("fetch-calendar-events Session:", req.session);
    const { tokens } = req.session;
    if (!tokens || !tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }

    oAuth2Client.setCredentials(tokens);
    console.log("fetch events", tokens.access_token);

    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      res.json(response.data.items);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching calendar events");
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}
main().catch(console.error);
