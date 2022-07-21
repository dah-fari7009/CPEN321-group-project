const express = require("express");
const router = require('./router/router')
require('./db/connection')

const app = express();
const port = 8081;

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.text({ type: "text/plain" }))
app.use('/api', router);

app.get("/", (req, res) => {
    res.send("Hello World");
})

var server = app.listen(port, (req, res) => {
    var host = server.address().address;
    var serverPort = server.address().port;
    console.log("running at http://%s:%s", host, serverPort);
    console.log(server.address())
})
