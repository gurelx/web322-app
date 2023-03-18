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
var stripJs = require('strip-js');

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
            return '<li style="list-style: none;"' +
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
        },
        safeHTML: function(context) {
            return stripJs(context);
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
    res.redirect("/blog");
});

// About page
app.get("/about", (req, res) => {
    res.render('about');
});

// Blog page
app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try {
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        // get the latest post from the front of the list (element 0)
        let post = posts[0];
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "No results...";
    }
    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "No results...";
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});


// Blog with a specific id
app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    }catch(err){
        viewData.message = "No results...";
    }
    try{
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    }catch(err){
        viewData.message = "No results..."; 
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "No results...";
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

// Posts page
app.get("/posts", (req, res) => {
    var category = req.query.category;
    var minDate = req.query.minDate;
    // /posts?category=value
    if (category) {
        blog.getPostByCategory(category)
            .then((data) => {res.render("posts", { posts: data })})
            .catch((err) => {res.render("posts", { message: "no results" })});
    }
    // /posts?minDate=value
    else if (minDate) {
        blog.getPostsByMinDate(minDate)
            .then((data) => {res.render("posts", { posts: data })})
            .catch((err) => {res.render("posts", { message: "no results" })});
    }
    // All posts
    else {
        blog.getAllPosts()
            .then((data) => {res.render("posts", { posts: data })})
            .catch((err) => {res.render("posts", { message: "no results" })});
    }
});

// Categories page
app.get("/categories", (req, res) => {
    blog.getCategories()
        .then((data) => { res.render("categories", {categories: data});})
        .catch((err) => { res.render("categories", {message: "no results"}); });
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