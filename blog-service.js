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

// Get published posts of s specific category
module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        if (categories.length == 0) reject("no results returned")
        else {
            let published = []; // temp to assign only published objects
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].published == true && posts[i].category == category) {
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
        if (categories.length == 0)
            reject("no results returned");
        else 
            resolve(categories);
    });
}

// Add a new post
module.exports.addPost = (postData) => {
    return new Promise ((resolve,reject) => {
        postData.published == undefined ? postData.published = false : postData.published = true;
        postData.id = posts.length + 1;
        // Add a timestamp
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        postData.postDate = `${year}-${month}-${day}`;
        posts.push(postData);
        resolve(postData);
    });
}

// Get the posts by post id
module.exports.getPostByCategory = (category) => {
    return new Promise ((resolve,reject) => {
        let postQueries = []; // local array to store matching posts

    if(!isNaN(category)) // validate category is a number
    {
        // If post category matches push post to local array
        for(let i = 0; i < posts.length; i++)
        {
            if(posts[i].category == category)
                postQueries.push(posts[i]);
        }
    }
        if(postQueries.length == 0)
            reject('No posts found with the specified id.');
        else
            resolve(postQueries);
        });
}

// Get posts by date by gap
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise ((resolve,reject) => {
        let postQueries = []; // local array to store matching posts

        let date = new Date(minDateStr); // Create a new date instance 

        if(date instanceof Date && !isNaN(date)) // validate date
        {
            // If post id matches push post to local array
            for(let i = 0; i < posts.length; i++)
            {
            if(new Date(posts[i].postDate) >= date)
                postQueries.push(posts[i]);
            }
        }

        if(postQueries.length == 0)
                reject('No posts found older than specified date.');
            else
                resolve(postQueries);
        });
}

// Get post by id
module.exports.getPostById = (id) => {
    return new Promise ((resolve,reject) => {
        let postQueries; // local variable to store matching post

        if(!isNaN(id)) // validate id is a number
        {
            // If post id matches set the local variable
            for(let i = 0; i < posts.length; i++)
            {
                if(posts[i].id == id)
                    postQueries = posts[i];
            }
        }
        
        if(!postQueries)
            reject('No posts found with the specified id.');
        else 
            resolve(postQueries);
        });
}

