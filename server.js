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

// Port will be opened at 8080
var HTTP_PORT = process.env.PORT || 8081;

// Server message
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// For static files
app.use(express.static("static"));

// Initialize globals
blog.initialize()
    .then(app.listen(HTTP_PORT, onHttpStart))
    .catch((err) => { console.log("message: " + err) });

// Initial page redirected to /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

// About page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Blog page
app.get("/blog", (req, res) => {
    blog.getPublishedPosts()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

// Posts page
app.get("/posts", (req, res) => {
    blog.getAllPosts()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

// Categories page
app.get("/categories", (req, res) => {
    blog.getCategories()
        .then((data) => res.send(data))
        .catch((err) => { console.log("message: " + err) });
});

// Add posts
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

// If requested page not found
app.use((req, res) => {
    res.status(404).send("Oops! These are not the pages you are looking for!");
});

