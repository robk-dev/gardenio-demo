const app = require('express')();
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const request = require('request-promise');

const memoryStore = new session.MemoryStore();
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

const backendServiceEndpoint = `http://backend/hello-backend`;
const keycloakServiceEndpoint = `http://keycloak-http`;

const config = {
    clientId: 'node-microservice',
    bearerOnly: true,
    serverUrl: keycloakServiceEndpoint + '/auth',
    realm: 'rypock'
};
const keycloak = new Keycloak({ store: memoryStore }, config);
app.use(keycloak.middleware({}));

app.get('/user', keycloak.protect('user'), function (_req, res) {
    res.send("Hello User");
});

app.get('/admin', keycloak.protect('admin'), function (_req, res) {
    res.send("Hello Admin");
});

app.get('/all-user', keycloak.protect(['user', 'admin']), function (_req, res) {
    res.send("Hello All User");
});

app.get('/hello', (_req, res) => res.send('Hello from the frontend!'));

app.get('/call-keycloak', async (_req, res) => {
    try {
        const tokens = await request.post({
            url: keycloakServiceEndpoint + '/auth/realms/master/protocol/openid-connect/token',
            form: {
                "client_id": "admin-cli",
                "username": "admin",
                "password": "admin",
                "grant_type": "password"
            }
        });

        const { access_token } = JSON.parse(tokens);
        const getMasterRealm = await request.get({
            url: keycloakServiceEndpoint + '/auth/admin/realms/master',
            headers: { Authorization: `Bearer ${access_token}` }
        });

        console.log({ getMasterRealm });
        res.send({ access_token, getMasterRealm });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/call-backend', (_req, res) => {
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
