require("dotenv").config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const LokiStore = require("connect-loki")(session);
const { google } = require("googleapis");
const axios = require("axios");
const { apikeys } = require("googleapis/build/src/apis/apikeys");

const app = express();
const port = process.env.PORT /* || 3001*/;

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Change this to a random secret string
    store: new LokiStore({
      path: "./sessions.json", // The file path to store sessions (optional, defaults to './sessions.json')
      logErrors: true, // Whether to log errors (optional)
    }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: "none" },
    //cookie: { secure: false, sameSite: "lax" }, only for local development
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN /*|| 'http://localhost:3000'*/,
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://untangled-v2-main.onrender.com"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.use((req, res, next) => {
//   // Change the allowed origin to localhost for local development
//   res.header("Access-Control-Allow-Origin", "http://localhost:3001");
//   // Ensure credentials are supported for CORS requests
//   res.header("Access-Control-Allow-Credentials", "true");
//   // The rest remains the same
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

app.use((req, res, next) => {
  console.log("Session State:", req.session);
  next();
});


const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI /*|| "http://localhost:3001/oauth2callback"*/;
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

app.get("/login", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    if (!tokens) {
      console.error("Failed to retrieve tokens");
      return res.status(500).send("Failed to authenticate");
    }

    oAuth2Client.setCredentials(tokens);

    // Store the tokens in the session
    req.session.tokens = tokens; // Storing the entire tokens object

    console.log("Tokens stored in session:", req.session.tokens);

    // Save the session explicitly, if needed, then redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Failed to save session");
      }

      console.log("Session saved successfully with tokens");
      // Redirect with auth=success query parameter
      const redirectUrl = `${process.env.REDIRECT_HOME}?auth=success` /*|| "http://localhost:3000/home?auth=success"*/;
      res.redirect(redirectUrl);
    });
  } catch (error) {
    console.error("Error during OAuth2 callback", error);
    res.status(500).send("Authentication errorr");
  }
});

app.get("/auth-check", async (req, res) => {
  // if (!req.session.tokens || !req.session.tokens.access_token) {
  //   console.log("Token issue or not authenticated");
  //   return res.status(401).send("User not authenticated");
  // }

  // Extract user info from the session
  const { tokens } = req.session;
  oAuth2Client.setCredentials(tokens);

  console.log("auth check", tokens.access_token);

  if (req.session.tokens && req.session.tokens.access_token) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/user-info", async (req, res) => {
  // if (!req.session.tokens || !req.session.tokens.access_token) {
  //   console.log("Token issue or not authenticated");
  //   return res.status(401).send("User not authenticated");
  // }

  // Extract user info from the session
  const { tokens } = req.session;
  oAuth2Client.setCredentials(tokens);

  console.log("user info", tokens.access_token);

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
  // Extract user info from the session
  const { tokens } = req.session;
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
