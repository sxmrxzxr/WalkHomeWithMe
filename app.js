var express = require("express");
var bodyParser = require("body-parser")
var app = express();
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hackprinceton',
    database: 'hackprinceton'
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendfile("index.html");
});

app.get('/currentRoutes', function (req, res) {
    connection.query('SELECT * FROM myRoutes', function (error, results, fields) {
        if (error) throw error;
        res.send(results[0]);
    });
})

app.post('/insertRoute', function (req, res) {
    console.log(req.body.startLoc);
    console.log(req.body.endLoc);
    
    var startLoc = JSON.parse(req.body.startLoc);
    var endLoc = JSON.parse(req.body.endLoc);
    
    console.log(startLoc.lat);
    console.log(endLoc.lat);
    
    var q = "INSERT INTO myRoutes(startLoc, endLoc) VALUES('" + startLoc.lat + "', '" + endLoc.lat +"');";
    console.log(q);
    
    connection.query(q, function(error, req, res) {
        if (error) throw error;
        console.log('valid');
    })
});

app.listen(3000, function () {
    console.log("listening on port 3000");
});