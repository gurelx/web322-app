const fs = require("fs");

// Globals
var posts = [];
var categories = [];

// Initialize 
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        // Read posts.json
        fs.readFile('data/posts.json', 'utf8', (err, data) => {
            if (err) reject("unable to read posts file")
            else {
                // If successful assign it to posts
                posts = JSON.parse(data);
                // Then read categories.json
                fs.readFile('data/categories.json', 'utf8', (err, data) => {
                    if (err) reject("unable to read categories file")
                    else {
                        // If successful assign it to categories
                        categories = JSON.parse(data);
                        resolve(); // If both reads/assigns are succesful, resolve
                    }
                });
            }
        });
    });
}

// Get all posts
module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) reject("no results returned")
        else resolve(posts);
    });
}

// Get only the published posts
module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) reject("no results returned")
        else {
            let published = []; // temp to assign only published objects
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].published == true) {
                    published[i] = posts[i];
                }
            }
            resolve(published);
        }
    });
}

// Get categories
module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) reject("no results returned")
        else resolve(categories);
    });
}

// Add a new post
module.exports.addPost = (postData) => {
    return new Promise ((resolve,reject) => {
        postData.published == undefined ? postData.published = false : postData.published = true;
        postData.id = posts.length + 1;
        posts.push(postData);
        resolve(postData);
    });
}