var bcrypt = require('bcryptjs');

// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

let pass1 = encodeURIComponent("A9YZ1h"); 

// define the user schema
var userSchema = new Schema({
    "userName":  {
        "type": String,
        "unique" : true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
      "dateTime": Date,
      "userAgent": String
    }]
  });

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(`mongodb+srv://gurelx:${pass1}@cluster0.bpq4ct6.mongodb.net/?retryWrites=true&w=majority`);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (UserData) {
    return new Promise(function (resolve, reject) {

        if (UserData.password != UserData.password2) {
            reject("Passwords do not match");
        }
        else {
            // Hash the password entered
            bcrypt.hash(UserData.password, 10).then(hash=>{ 
                    UserData.password = hash;
                    // Create the new user 
                    let newUser = new User(UserData);
                    // Save it to the database
                    newUser.save().then(() => {
                        resolve();
                    // Reject if there is an error
                    }).catch(err => {
                        console.log(err);
                        if (err.code == 11000) {
                            // Duplicate key error
                            reject('User Name already taken');
                        } else {
                            // Other error
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
               })
               // Reject if the password cannot be hashed
               .catch(err=>{
                reject(`There was an error encrypting the password: ${err}`);
               });
        };
    });
};

module.exports.checkUser = (userData) => {
    return new Promise(function (resolve, reject) {
    // Find the user from database
    User.find({userName: userData.userName}).exec()
    .then((users) => {
        bcrypt.compare(userData.password, users[0].password).then((result) => {
            // If the passwords do not match
            if(!result)
                reject(`Incorrect Password for user: ${userData.userName}`);
            else {
                // Add a new login to login history
                users[0].loginHistory.push({
                    dateTime: (new Date()).toString(), userAgent: userData.userAgent
                });
                User.updateOne({userName: users[0].userName}, 
                    {$set : {loginHistory: users[0].loginHistory}}).exec()
                .then(() => {
                    resolve(users[0]);
                })
                // If the login history cannot be added
                .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                });
            };
           });
    })
    // If the user cannot be found
    .catch(() => {
        reject(`Unable to find user: ${userData.userName}`);
    });
});
};



