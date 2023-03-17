/*********************************************************************************
* WEB322 – Assignment 03
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
var exphbs = require('express-handlebars');

// File hosting
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

var app = express();

// Handling HTML files that are formatted using handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        // Helper for identifying 'active' navbar
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
           },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');

// Port will be opened at 8080
var HTTP_PORT = process.env.PORT || 8080;

// Server message
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// File hosting configuration
cloudinary.config({
    cloud_name: 'dh1ziyhvn',
    api_key: '631625477225192',
    api_secret: 'nr79pXNOD0nk8yil_i7XYGBHf48',
    secure: true
});

const upload = multer();

// Middleware to handle the 'active' items in navbar
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
   });

// For static files
app.use('*/public', express.static(path.join(__dirname, "public")));

// Initialize globals
blog.initialize()
    .then(app.listen(HTTP_PORT, onHttpStart))
    .catch((err) => { res.send("message: " + err) });

// Initial page redirected to /about
app.get("/", (req, res) => {
    res.redirect("/about");
});

// About page
app.get("/about", (req, res) => {
    res.render('about');
});

// Blog page
app.get("/blog", (req, res) => {
    blog.getPublishedPosts()
        .then((data) => res.send(data))
        .catch((err) => { res.send("message: " + err) });
});

// Posts page
app.get("/posts", (req, res) => {
    var category = req.query.category;
    var minDate = req.query.minDate;
    // /posts?category=value
    if (category) {
        blog.getPostByCategory(category)
            .then((data) => res.send(data))
            .catch((err) => { res.send("message: " + err) });
    }
    // /posts?minDate=value
    else if (minDate) {
        blog.getPostsByMinDate(minDate)
            .then((data) => res.send(data))
            .catch((err) => { res.send("message: " + err) });
    }
    // All posts
    else {
        blog.getAllPosts()
            .then((data) => res.send(data))
            .catch((err) => { res.send("message: " + err) });
    }
});

// Categories page
app.get("/categories", (req, res) => {
    blog.getCategories()
        .then((data) => res.send(data))
        .catch((err) => { res.send("message: " + err) });
});

// Add posts
app.get("/posts/add", (req, res) => {
    res.render('addPost');
});


// Post a new post
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        let newPost = {
            id: 0,
            body: req.body.body,
            title: req.body.title,
            postDate: new Date().toISOString().split('T')[0],
            category: req.body.category,
            featureImage: imageUrl,
            published: req.body.published
        }
        blog.addPost(newPost)
            .then(() => res.redirect("/posts"))
            .catch((err) => { res.send("message: " + err) });
    }
});

// Value route
app.get("/posts/:value", (req, res) => {
    var id = req.params.value;

    blog.getPostById(id)
        .then((data) => res.send(data))
        .catch((err) => { res.send("message: " + err); });
});

// If requested page not found
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "/views/404_NotFound.html"));
});