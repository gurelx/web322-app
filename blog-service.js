const Sequelize = require('sequelize');

var sequelize = new Sequelize('vfsqgnvd', 'vfsqgnvd', 'naO5tdKtC6tNsjZwMbnTh-MCZKbOxxvS', {
    host: 'isilo.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Data models
var Post = sequelize.define('Post', {
    body : Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate : Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published : Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category : {
        type: Sequelize.STRING,
        allowNull: true
}
});

// Data relationship
Post.belongsTo(Category, {foreignKey: 'category'});

// Initialize 
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve("success to sync the database")
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
};

// Get all posts
module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find all posts
            Post.findAll({
            }).then((data) => {
                resolve(data);
            // If posts cannot be found
            }).catch(() => {
                reject("no results returned");
            });
        // If the database cannot be synched
        }) .catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Get only the published posts
module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find all posts where the category matches
            Post.findAll({
                where: {
                    published: true
                }
            }).then((data) => {
                resolve(data);
            // If posts cannot be found
            }).catch(() => {
                reject("no results returned");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Get published posts of s specific category
module.exports.getPublishedPostsByCategory = (category) => {
    return sequelize.sync()
        .then(() => {
            // Find all posts where the category matches
            return Post.findAll({
                where: {
                    published: true,
                    category: category
                }
            });
        })
        .catch((err) => {
            console.error("Error syncing the database:", err);
            throw err; // rethrow the error to the caller of the function
        });
}
// Get categories
module.exports.getCategories = function () {
    return sequelize.sync().then(function () {
        // Find all categories
        return Category.findAll();
    }).catch((err) => {
        console.error("unable to sync the database", err);
        throw err; // rethrow the error to the caller of the function
    });
}

// Add a new post
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        // Set the published property
        postData.published = (postData.published) ? true : false;
        
        // Check for empty attributes and set them to null
        for (let attr in postData) {
            if (postData.hasOwnProperty(attr)) {
              if (postData[attr] === "")
                    postData[attr] = null;
            }
          };
        
        // Set the date
        postData.postDate = new Date();
        
        sequelize.sync().then(() => {
            // Create a new post
            Post.create({
                body: postData.body,
                title: postData.title,
                postDate: postData.postDate,
                featureImage: postData.featureImage,
                published: postData.published,
                category: postData.category
            }).then((data) => {
                resolve("new post added");
            // If post cannot be created
            }).catch(() => {
                reject("unable to create post");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Get the posts by post id
module.exports.getPostByCategory = (category) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find all posts where the category matches
            Post.findAll({
                where: {
                    category: category
                }
            }).then((data) => {
                resolve(data);
            // If posts cannot be found
            }).catch(() => {
                reject("no results returned");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Get posts by date by gap
module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        sequelize.sync().then(() => {
            // Find all posts where the date is greater or equal
            Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            }).then((data) => {
                resolve(data);
                // If posts cannot be found
            }).catch(() => {
                reject("no results returned");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Get post by id
module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find the post where the id matches
            Post.findAll({
                where: {
                    id: id
                }
            }).then((data) => {
                resolve(data[0]);
            // If post cannot be found
            }).catch(() => {
                reject("no results returned");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Add a category
module.exports.addCategory = (categoryData) => {
     // Check for empty attributes and set them to null
          if (categoryData.category === "")
            categoryData.category = null;

      return new Promise((resolve, reject) => {
      sequelize.sync().then(() => {
        // Create a new category
        Category.create({
            category: categoryData,
        }).then(() => {
            resolve("new category added");
        // If category cannot be created
        }).catch((err) => {
            reject('Error creating category:', err);
        });
        // If the database cannot be synched
    }).catch(() => {
        reject("unable to sync the database");
    });
}) }

// Delete category
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find the category where the id matches and delete
            Category.destroy({
                where: {
                    id: id
                }
            }).then((data) => {
                resolve("Category deleted.");
            // If post cannot be found
            }).catch(() => {
                reject("Unable to delete category.");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}

// Delete post
module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            // Find the post where the id matches and delete
            Post.destroy({
                where: {
                    id: id
                }
            }).then((data) => {
                resolve("Post deleted.");
            // If post cannot be found
            }).catch(() => {
                reject("Unable to delete post.");
            });
            // If the database cannot be synched
        }).catch(() => {
            reject("unable to sync the database");
        });
    });
}