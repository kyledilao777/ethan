require("dotenv").config();
const cors = require("cors");
const url = require("url");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const axios = require("axios");
const port = process.env.PORT || 3001;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI /*|| "http://localhost:3001/oauth2callback"*/;
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tokens: { type: Object, required: true },
});

const Token = mongoose.model("Token", tokenSchema);
const { v4: uuidv4 } = require("uuid");

async function connectToMongo() {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 5000; // milliseconds

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB successfully.");
      return;
    } catch (err) {
      console.error(
        `Attempt ${attempt} - Could not connect to MongoDB: ${err}`
      );
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw new Error("Max retries reached. Could not connect to MongoDB.");
      }
    }
  }
}

async function main() {
  await connectToMongo();

  const app = express();

  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collection: "sessions",
  });
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        domain: ".untangled-ai.com",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
        "https://agent.untangled-ai.com",
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

  app.get("/get-tokens", async (req, res) => {
    try {
      const email = req.query.email;
      const tokenRecord = await Token.findOne({ email: email });
      console.log("Token Record:", tokenRecord)
      if (!tokenRecord) {
        return res.status(404).send("Tokens not found");
      }
      res.json(tokenRecord.tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/update-tokens", async (req, res) => {
    try {
      const { email, tokens } = req.body;
      const tokenRecord = await Token.findOneAndUpdate(
        { email: email },
        { tokens: tokens },
        { upsert: true, new: true }
      );
      res.json(tokenRecord);
    } catch (error) {
      console.error("Error updating tokens:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/login", (req, res) => {
    const state = uuidv4(); // Generate a unique state value
    req.session.state = state;
    console.log("Login - Generated state:", state);
    console.log("Login - Session state:", req.session.state);
    
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/user.emails.read",
      ],
      include_granted_scopes: true,
      state: state,
    });
    res.redirect(url);
  });

  app.get("/oauth2callback", async (req, res) => {
    let q = url.parse(req.url, true).query;
    console.log("Callback state:", q.state); // Log state in callback
    console.log("Session state:", req.session.state); // Log session state
    console.log("Callback:", q);
    console.log("Session state q:", req.session);

    if (q.error) {
      console.log("Error:" + q.error);
      return res.status(400).send("Authentication error");
    } else if (q.state !== req.session.state) {
      console.log("State mismatch. Possible CSRF attack");
      return res.status(400).send("State mismatch. Possible CSRF attack");
    } else {
      try {
        const { tokens } = await oAuth2Client.getToken(q.code);
        oAuth2Client.setCredentials(tokens);
        req.session.tokens = tokens;
        delete req.session.state;

        // Fetch user profile information
        const peopleService = google.people({ version: 'v1', auth: oAuth2Client });
        const me = await peopleService.people.get({
          resourceName: 'people/me',
          personFields: 'emailAddresses',
        });

        const email = me.data.emailAddresses[0].value

        await Token.findOneAndUpdate(
          { email: email },
          { tokens: tokens },
          { upsert: true, new: true }
        );

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).send("Failed to save session");
          }

          const redirectUrl =
            `${process.env.REDIRECT_HOME}` /*||
            "http://localhost:3000/home?auth=success"*/;
          res.redirect(redirectUrl);
        });
      } catch (error) {
        console.error("Error during OAuth2 callback", error);
        return res.status(500).send("Authentication error");
      }
    }
  });

  app.get("/auth-check", async (req, res) => {
    console.log("auth-check Session:", req.session.tokens);
    const tokens = req.session.tokens; // Corrected line

    if (!tokens || !tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }

    try {
      // Set the credentials to ensure the oAuth2Client is using the correct tokens
      oAuth2Client.setCredentials(tokens);

      // Verify the access token
      await oAuth2Client.getTokenInfo(tokens.access_token);
      console.log("auth check", tokens.access_token);
      return res.json({ isAuthenticated: true });
    } catch (error) {
      console.error("Invalid or expired token:", error);

      // If the token is expired, attempt to refresh it
      if (error.message.includes("invalid_token")) {
        if (tokens.refresh_token) {
          try {
            const newTokens = await oAuth2Client.refreshAccessToken();
            req.session.tokens = newTokens.credentials;
            await req.session.save();
            console.log("Token refreshed:", newTokens.credentials.access_token);
            return res.json({ isAuthenticated: true });
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            return res
              .status(401)
              .json({ isAuthenticated: false, error: "Token refresh failed" });
          }
        } else {
          console.error("No refresh token available");
        }
      }
      return res
        .status(401)
        .json({ isAuthenticated: false, error: "Invalid or expired token" });
    }
  });

  app.options("/user-info", (req, res) => {
    res.sendStatus(204);
  });

  app.get("/user-info", async (req, res) => {
    //console.log("user-info Session:", req.session.tokens);
    const tokens = req.session.tokens;
    if (!tokens || !tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }
    // // Extract user info from the session
    // const { tokens } = req.session;
    // oAuth2Client.setCredentials(tokens);

    const peopleService = google.people({ version: "v1", auth: oAuth2Client });
    const calendarService = google.calendar({ version: 'v3', auth: oAuth2Client });
    try {
      const me = await peopleService.people.get({
        resourceName: "people/me",
        personFields: "names,photos,emailAddresses",
      });

     // console.log("me: ", me.data)

      const userInfo = {
        name: me.data.names[0].displayName,
        photo: me.data.photos[0].url,
        email: me.data.emailAddresses[0].value,
      };

      const calendarList = await calendarService.calendarList.list();
      const primaryCalendar = calendarList.data.items.find(calendar => calendar.primary);

      userInfo.calendarId = primaryCalendar ? primaryCalendar.id : 'No primary calendar found';

      res.json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching user info");
    }
  });

  app.get("/fetch-calendar-events", async (req, res) => {
    console.log("fetch-calendar-events Session:", req.session.tokens);
    const tokens = req.session.tokens; // Corrected line

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
      console.error("Error fetching calendar events:", error);
      res.status(500).send("Error fetching calendar events");
    }
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}
main().catch(console.error);