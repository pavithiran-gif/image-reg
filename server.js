var express = require("express");
var app = express();
const http = require('http');



var path = require("path");
var bodyParser = require("body-parser");
var imagemod = require('./imagemod');
// test
//Access-Control-Allow-Headers
//After lots of googling I decided to npm install express and add

app.set("port", 5000);

/* var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
}); */

app.set("superSecret", process.env.secret); // secret variable


app.use(function (err, req, res, next) {
  res.header("Content-type: application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, session, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

  if (err.name === "UnauthorizedError") {
    return res.status(403).send({
      success: false,
      message: "No token provided.",
    });
  }

  next();
});
//View Engine
app.set("views", path.join(__dirname, "views"));


// Set Static Folder
app.use(express.static(path.join(__dirname, "client")));

// Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/imagemod", imagemod);







app.listen(app.get("port"), async function () {
    console.log("server started in  port ..."+app.get("port"))
    });

//run().catch(console.dir);

module.exports = app;
