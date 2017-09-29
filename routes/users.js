var database = {
   url : "<url>"
};
//Setup database
var host = "localhost";
var port = 5984;
database.url = "http://" + host + ":" + port;
var express = require('express');
var nano = require('nano')(database.url);
var path = require('path');
var marz = nano.db.use('db');
var CryptoJS = require("crypto-js");
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");
const fileUpload = require('express-fileupload');

//Encrypt password using AES encryption
var encrypt = function(string) {
    var pwd = string;
    var myEncryptionString = "tryAndCrackThis";
    var encryptedPWD = CryptoJS.AES.encrypt(pwd, myEncryptionString).toString();
    return encryptedPWD;
}
//Decrypt password
var decrypt = function(string) {
    var pwd = string;
    var myEncryptionString = "tryAndCrackThis";
    var decrypted = CryptoJS.AES.decrypt(pwd, myEncryptionString).toString(CryptoJS.enc.Utf8);
    return decrypted;
}
//Write new profile to the database
var createNewProfile = function(username, fullname){
   return new Promise(function(resolve, reject){
        marz.insert({
        "type": "profile",
        "username": username,
        "fullname": fullname,
        "myposts": [],
        "following": [{"username": username}],
        "followers": []
}, null, function (err, body) {
        if (err) {
            reject();
            console.log(err);
        } else {
            resolve();
        }
    })
   })
}
//Check the user credentials
router.get('/user', function (req, res) {
    marz.get('_design/user/_view/users?key="' + req.query.username + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                var runDecrypt = decrypt(body.rows[0].value.password);
                if (req.query.password === runDecrypt) {
                     res.send(body.rows[0]); 
                } else {
                res.status(404);
                res.send({success: false});
            }
 
            } else {
                res.status(404);
                res.send({success: false});
            }

    });
});
//Check if the user exists in the database
router.get('/userExists', function (req, res) {
    marz.get('_design/user/_view/users?key="' + req.query.username + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                res.status(404);
                res.send({success: false});
 
            } else {
                res.status(200);
                res.send({success: true});
            }

    });
});
//Add user to the database, ensuring the password is encrypted
router.get('/addUser', function (req, res) {
    var encryptedPWD = encrypt(req.query.password);
    marz.insert({
        "type": "credentials",
        "username": req.query.username,
        "password": encryptedPWD,
        "fullname": req.query.fullname
}, null, function (err, body) {
        if (err) {
            console.log(err);
            res.status(404);
            res.end();
        } else {
            var createProfile = createNewProfile(req.query.username, req.query.fullname).then(function(resove){
                res.status(200);
                res.end();
            });
        }
    })
});
//Get the users profile
router.get('/userProfile', function (req, res) {
    marz.get('_design/profile/_view/profile?key="' + req.query.username + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                res.send(body.rows[0]);  
            } else {
                res.status(404);
                res.send({success: false});
                console.log(err);
            }

    });
});
//Get the a list of users someone is following
router.get('/following', function (req, res) {
    marz.get('_design/profile/_view/following?key="' + req.query.username + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                res.send(body.rows);  
            } else {
                res.status(404);
                res.send({success: false});
                console.log(err);
            }

    });
});
//Add following to the users profile
router.put('/addFollowing', function (req, res){
    var followData = req.body.following.followers;
    var promise = new Promise(function(resolve, reject) {
        marz.get('_design/profile/_view/profile?key="' + req.body.user + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                resolve(body.rows[0]);
            } else {
                res.status(404);
                res.send({success: false});
                reject(err);
                console.log(err);
            }
        });
    })
    promise.then(function(resolve){
        for (let i = 0; i < resolve.value.following.length; i++){
            followData.push(resolve.value.following[i]);
        }
        var data = {
            "_rev": resolve.value._rev,
            "type": "profile",
            "username": resolve.value.username,
            "fullname": resolve.value.fullname,
            "profileImage": resolve.value.profileImage,
            "myposts": [],
            "following":
                followData
            ,
            "followers": []
          }
          marz.insert(data, resolve.value._id, function(err, body, header){
              if (err){
                  console.log(err);
                  res.status(404);
                  res.send({success: false});
              } else {
                  res.status(200);
                  res.end();
              }
          });
    })
})
//Remove someone a user is following
router.put('/removeFollowing', function(req, res){
    var followData = req.body.following.followers;
    var promise = new Promise(function(resolve, reject) {
        marz.get('_design/profile/_view/profile?key="' + req.body.user + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                resolve(body.rows[0]);
            } else {
                res.status(404);
                res.send({success: false});
                reject(err);
                console.log(err);
            }
        });
    })
    promise.then(function(resolve){
        var currentData = resolve.value.following;
        followData.forEach(function(value){
            for (let i = 0; i < currentData.length; i++){
                if (value.username === currentData[i].username){
                    currentData.splice(i,1);
                }
            }
        }) 

        var data = {
            "_rev": resolve.value._rev,
            "type": "profile",
            "username": resolve.value.username,
            "fullname": resolve.value.fullname,
            "myposts": [],
            "following":
                currentData
            ,
            "followers": []
          }
          //Insert into database
          marz.insert(data, resolve.value._id, function(err, body, header){
              if (err){
                  console.log(err);
                  res.status(404);
                  res.send({success: false});
              } else {
                  res.status(200);
                  res.end();
              }
          });
    })
})
//Gets a list of people the user is following
router.get('/userList', function (req, res) {
    marz.get('_design/profile/_view/users', function(err, body) {
            if (!err && body.rows.length > 0) {
                res.send(body.rows);  
            } else {
                res.status(404);
                res.send({success: false});
                console.log(err);
            }

    });
});



module.exports = router;