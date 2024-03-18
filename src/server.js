require('dotenv').config();
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const {google} = require('googleapis');
const axios = require('axios');

const app = express();
const port = 3001;

app.use(session({
  secret: 'A0255806Y', // Change this to a random secret string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }
}));

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true, 
  }));

const clientId = '517714427371-36n7qq9d4vgj1q1qhj5qmtul9n9qgkjp.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:3001/oauth2callback';

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

  res.redirect('http://localhost:3000/home')
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
