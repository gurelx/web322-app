/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Gurel Sezgin__ Student ID: 174331215 Date: 02/03/2023
*
* Cyclic Web App URL: https://cyan-friendly-lovebird.cyclic.app_
*
* GitHub Repository URL: https://github.com/gurelx/web322-app
*
********************************************************************************/

var blog = require("./blog-service.js");
var express = require("express");
var path = require("path");

var app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

blog.initialize()
    .then(app.listen(HTTP_PORT, onHttpStart))
    .catch((err) => { console.log("message: " + err) });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});


app.get("/blog", (req, res) => {
    blog.getPublishedPosts()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

app.get("/posts", (req, res) => {
    blog.getAllPosts()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

app.get("/categories", (req, res) => {
    blog.getCategories()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

app.use((req, res) => {
    res.status(404).send("Oops! These are not the pages you are looking for!");
});

