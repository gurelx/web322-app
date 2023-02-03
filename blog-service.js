const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('data/posts.json', 'utf8', (err, data) => {
            if (err) reject("unable to read posts file")
            else {
                posts = JSON.parse(data);
                fs.readFile('data/categories.json', 'utf8', (err, data) => {
                    if (err) reject("unable to read categories file")
                    else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if (posts.length == 0) reject("no results returned")
        else resolve(posts);
    });
}

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) reject("no results returned")
        else {
            let published = [];
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].published == true) {
                    published[i] = posts[i];
                }
            }
            resolve(published);
        }
    });
}

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) reject("no results returned")
        else resolve(categories);
    });
}