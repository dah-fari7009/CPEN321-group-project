const express = require("express");
const router = require('./router/router')
require('./db/connection')

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.text({ type: "text/plain" }))
app.use('/api', router);

app.get("/", (req, res) => {
    res.send("Hello World");
})

module.exports = app;

