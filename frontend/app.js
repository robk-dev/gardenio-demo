const express = require('express');
const request = require('request-promise')
const app = express();

const backendServiceEndpoint = `http://backend/hello-backend`

app.get('/hello-frontend', (req, res) => res.send('Hello from the frontend!'));

app.get('/call-keycloak', async (_req, res) => {
  try {
    const tokens = await request.post({
      url: 'http://keycloak-http:80/auth/realms/master/protocol/openid-connect/token',
      form: {
        "client_id": "admin-cli",
        "username": "admin",
        "password": "admin",
        "grant_type": "password"
      }
    });

    const { access_token } = JSON.parse(tokens);
    const getMasterRealm = await request.get({
      url: 'http://keycloak-http:80/auth/admin/realms/master',
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log({ getMasterRealm });
    res.send({ access_token, getMasterRealm });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/call-backend', (req, res) => {
  // Query the backend and return the response
  request.get(backendServiceEndpoint)
    .then(message => {
      message = `Backend says: '${message}'`
      res.json({
        message,
      })
    })
    .catch(err => {
      res.statusCode = 500
      res.json({
        error: err,
        message: "Unable to reach service at " + backendServiceEndpoint,
      })
    });
});

module.exports = { app }
