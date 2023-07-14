const express = require("express");
const session = require('express-session');


const {createRestApi} = require('./backend/api.js');
const {createViewApi} = require('./frontend/api.js');

const path = require("path");
const app = express();
const PORT = 4000 || process.env.NODE_ENV;

app.use(express.json());
app.set('view engine', 'ejs');
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(
    session({
        name: 'PD_SESSION',      // cookie name stored in the web browser
        secret: 'qwertyuio',     // helps to protect session
        cookie: {
            maxAge: 30 * 86400000, // 30 * (24 * 60 * 60 * 1000) = 30 * 86400000 => session is stored 30 days
        }
    })
);
app.use(express.static(path.join(__dirname, 'static')));

createRestApi(app);
createViewApi(app);

app.listen(PORT, () => console.log(`Connected to Port: ${PORT}`));