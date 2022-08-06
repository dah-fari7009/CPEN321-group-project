const app = require("./server");
const port = 8081;

var server = app.listen(port, (req, res) => {
    var host = server.address().address;
    var serverPort = server.address().port;
    console.log("running at http://%s:%s", host, serverPort);
    console.log(server.address())
})