require('dotenv').config();
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const {google} = require('googleapis');
const axios = require('axios');
const path = require('path');
const app = express();

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use(session({
  secret: process.env.SESSION_SECRET, // Change this to a random secret string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

app.use(cors({
    origin: [process.env.CORS_ORIGIN],
    credentials: true, 
  }));

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = /*'https://untangled-server.render.com/oauth2callback'*/
process.env.GOOGLE_REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

app.get('/login', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly', 
    'https://www.googleapis.com/auth/userinfo.profile'],
  });
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  // Store the tokens in the session
  req.session.tokens = tokens;
const redirectHoho = /*'https://untangled-frontend.render.com/home'*/
process.env.REDIRECT_HOME
  res.redirect(redirectHoho)
});

app.get('/user-info', async (req, res) => {
  if (!req.session.tokens || !req.session.tokens.access_token) {
    return res.status(401).send('User not authenticated');
  }

  oAuth2Client.setCredentials(req.session.tokens);

  const peopleService = google.people({version: 'v1', auth: oAuth2Client});
  try {
    const me = await peopleService.people.get({
      resourceName: 'people/me',
      personFields: 'names,photos',
    });


    const userInfo = {
      name: me.data.names[0].displayName,
      photo: me.data.photos[0].url,
    };

    res.json(userInfo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user info');
  }
});

app.get('/fetch-calendar-events', async (req, res) => {
  if (!req.session.tokens || !req.session.tokens.access_token) {
    return res.status(401).send('User not authenticated');
  }

  try {
    const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: {
        Authorization: `Bearer ${req.session.tokens.access_token}`,
      },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching calendar events');
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
