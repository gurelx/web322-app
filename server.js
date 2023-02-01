var blog = require("./blog-service");
var express = require("express");
var path = require("path");

var app = express();

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
    res.sendFile(path.join(__dirname, "data/posts.json?published=true"));
});

app.get("/posts", (req, res) => {
    res.sendFile(path.join(__dirname, "data/posts.json"));
});

app.get("/categories", (req, res) => {
    res.sendFile(path.join(__dirname, "data/categories.json"));
});

app.use((req, res) => {
    res.status(404).send("Oops! These are not the pages you are looking for!");
});

app.listen(HTTP_PORT, onHttpStart);