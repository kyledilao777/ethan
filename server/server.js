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
const redirectUri =
  /*process.env.GOOGLE_REDIRECT_URI || */ "http://localhost:3001/oauth2callback";
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  tokens: { type: Object, required: true },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photo: { type: Object, required: true },
  newName: { type: String, required: true },
  newPhoto: { type: String, required: true },
  calendarId: { type: String, required: true },
  occupation: { type: [String] },
  comment: { type: String },
  reason: { type: [String] },
  tier: { type: String }
});

const Token = mongoose.model("Token", tokenSchema);
const User = mongoose.model("User", userSchema);

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
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.use(
    cors({
      origin: [
        // "https://main.untangled-ai.com",
        // "https://backend.untangled-ai.com",
        // "https://untangled-ai.com",
        // "https://www.untangled-ai.com",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5001",
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

  app.use(express.json({ limit: "50mb" }));

  app.get("/get-tokens", async (req, res) => {
    try {
      const email = req.query.email;
      const tokenRecord = await Token.findOne({ email: email });

      if (!tokenRecord) {
        return res.status(404).send("Tokens not found");
      }
      res.json(tokenRecord.tokens);
      console.error("Tokens retrieved successfully");
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
      req.session.tokens = tokens;
      console.error("Tokens updated successfully");
    } catch (error) {
      console.error("Error updating tokens:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/login", (req, res) => {
    console.log(req.session.email, "this is user email");
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
        // Log the tokens to verify their structure
        console.log("Tokens received:", tokens);

        req.session.regenerate(async (err) => {
          req.session.tokens = tokens;
          delete req.session.state;

          // Fetch user profile information
          const peopleService = google.people({
            version: "v1",
            auth: oAuth2Client,
          });
          const me = await peopleService.people.get({
            resourceName: "people/me",
            personFields: "names,photos,emailAddresses",
          });

          const calendarService = google.calendar({
            version: "v3",
            auth: oAuth2Client,
          });

          const email = me.data.emailAddresses[0].value;

          await Token.findOneAndUpdate(
            { email: email },
            { tokens: tokens },
            { upsert: true, new: true }
          );

          const existingUser = await User.findOne({ email: email });
          let redirectUrl;

          if (!existingUser) {
            const calendarList = await calendarService.calendarList.list();
            const primaryCalendar = calendarList.data.items.find(
              (calendar) => calendar.primary
            );
            await User.create({
              email: email,
              name: me.data.names[0].displayName,
              photo: me.data.photos[0].url,
              newName: me.data.names[0].displayName,
              newPhoto: me.data.photos[0].url,
              calendarId: primaryCalendar.id, 
              tier: '',// Assuming you set this later or modify it
            });

            redirectUrl = "http://localhost:3000/userinfo";
          } else {
            redirectUrl = "http://localhost:3000/home?auth=success";
          }

          req.session.email = email;

          console.log("Email here: ", req.session.email);

          console.log("Set up: ", req.session.setup);

          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).send("Failed to save session");
            }

            res.redirect(redirectUrl);
          });
        });
      } catch (error) {
        console.error("Error during OAuth2 callback", error);
        return res.status(500).send("Authentication error");
      }
    }
  });

  app.get("/check-refresh-token", async (req, res) => {
    try {
      const tokenRecord = req.session.tokens;

      const params = {
        grant_type: "refresh_token",
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokenRecord.refresh_token,
      };

      const response = await axios.post(process.env.TOKEN_URI, params);
      res.json({ ...response.data, error: "None" });
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Respond with an appropriate HTTP status code and error message
      res
        .status(500)
        .json({ error: "Failed to refresh token", message: error.message });
    }
  });

  app.get("/auth-check", async (req, res) => {
    const tokens = req.session.tokens; // Corrected line
    console.log(tokens);
    if (!tokens || !tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.json({ isAuthenticated: false });
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
            return res.json({
              isAuthenticated: false,
              error: "Token refresh failed",
            });
          }
        } else {
          console.error("No refresh token available");
        }
      }
      return res.json({
        isAuthenticated: false,
        error: "Invalid or expired token",
      });
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
    const calendarService = google.calendar({
      version: "v3",
      auth: oAuth2Client,
    });
    try {
      const me = await peopleService.people.get({
        resourceName: "people/me",
        personFields: "names,photos,emailAddresses",
      });

      const email = req.session.email;

      console.log("User info: ", email);

      // console.log("me: ", me.data)
      const user = await User.findOne({ email: email });
      console.log("this is user: ", user.tier);
      const userInfo = {
        name: user.name,
        photo: user.photo,
        newName: user.newName,
        newPhoto: user.newPhoto,
        email: user.email,
        calendarId: user.calendarId,
        occupation: user.occupation,
        tier: user.tier,
      };

      console.log("User Info:", userInfo);

      // const calendarList = await calendarService.calendarList.list();
      // const primaryCalendar = calendarList.data.items.find(
      //   (calendar) => calendar.primary
      // );

      // userInfo.calendarId = primaryCalendar
      //   ? primaryCalendar.id
      //   : "No primary calendar found";

      res.json(userInfo);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching user info");
    }
  });

  app.post("/update-freemium", async (req, res) => {
    const data = req.body;
    const email = req.session.email;
    req.session.tier = data.tier;
    console.log("Email update profile: ", email);
    console.log("Data ", data);

    if (!email) {
      return res.status(400).json({ message: "No email found in session." });
    }

    tokens = req.session.tokens;

    try {
      await User.findOneAndUpdate(
        { email: email }, // Query to find the document to update
        {
          tier: data.tier,
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Ensure validation is run on update
        }
      );
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({
        message: "Failed to update profile.",
        error: error.toString(),
      });
    }
  });

  app.post("/update-profile", async (req, res) => {
    const data = req.body;
    const email = req.session.email;
    console.log("Email update profile: ", email);

    console.log("Comment: ", data.comment);
    console.log("Reason: ", data.reason);
    console.log("Occupation: ", data.occupation);

    if (!email) {
      return res.status(400).json({ message: "No email found in session." });
    }

    // Process custom "Others" values
    const occupation = data.occupation.includes("Others")
      ? [
          ...data.occupation.filter((item) => item !== "Others"),
          data.customOccupation,
        ]
      : data.occupation;
    const reason = data.reason.includes("Others")
      ? [...data.reason.filter((item) => item !== "Others"), data.customReason]
      : data.reason;

    try {
      if (data.name !== "" && data.imageSrc !== "logo.jpeg") {
        console.log("not here 1");
        await User.findOneAndUpdate(
          { email: email }, // Query to find the document to update
          {
            newName: data.name, // Update the name
            newPhoto: data.imageSrc, // Update the photo
            comment: data.comment,
            reason: reason,
            occupation: occupation,
          },
          {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is run on update
          }
        );
      } else if (data.name !== "" && data.imageSrc === "logo.jpeg") {
        console.log("not here 2");
        await User.findOneAndUpdate(
          { email: email }, // Query to find the document to update
          {
            newName: data.name, // Update the name
            comment: data.comment,
            reason: reason,
            occupation: occupation,
          },
          {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is run on update
          }
        );
      } else if (data.name === "" && data.imageSrc !== "logo.jpeg") {
        console.log("should be here");
        await User.findOneAndUpdate(
          { email: email }, // Query to find the document to update
          {
            newPhoto: data.imageSrc, // Update the photo
            comment: data.comment,
            reason: reason,
            occupation: occupation,
          },
          {
            new: true, // Return the updated document
            runValidators: true, // Ensure validation is run on update
          }
        );
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({
        message: "Failed to update profile.",
        error: error.toString(),
      });
    }
  });

  app.get("/logout", async (req, res) => {
    const tokens = req.session.tokens;

    if (tokens && tokens.access_token) {
      try {
        // Revoke the token
        await axios.post(
          `https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`,
          {},
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
      } catch (error) {
        console.error("Error revoking token:", error);
      }
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Failed to clear session");
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
    });
  });

  app.get("/fetch-calendar-events", async (req, res) => {
    const tokens = req.session.tokens; // Corrected line

    if (!tokens || !tokens.access_token) {
      console.log("Token issue or not authenticated");
      return res.status(401).send("User not authenticated");
    }

    oAuth2Client.setCredentials(tokens);

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
