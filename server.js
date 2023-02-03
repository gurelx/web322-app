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

