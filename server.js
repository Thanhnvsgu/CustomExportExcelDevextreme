const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const port = 8000;

let routes = require('./api/route') //importing route
routes(app);

//setting middleware
app.use(express.static(__dirname + '/resource')); //Serves resources from public folder
console.log(__dirname);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.listen(port, () => {
    console.log("We are live on " + port);
});