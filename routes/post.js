var database = {
   url : "<url>"
};
//Setup database functions
var host = "localhost";
var port = 5984;
database.url = "http://" + host + ":" + port;
var express = require('express');
var nano = require('nano')(database.url);
var path = require('path');
var marz = nano.db.use('db');
var router = express.Router();
//Get posts from the database
router.get('/getPost', function (req, res) {
    marz.get('_design/post/_view/post', function(err, body) {
        if (!err) {
            res.send(body);  
        } else {
            res.status(404);
            res.send({success: false});
            console.log(err);
        }
    });
});
//insert new posts into database
router.get('/newPost', function (req, res) {
    marz.insert({
    "type": "post",
    "username": req.query.pUsername,
    "fullname": req.query.pName,
    "profileImage": req.query.pImage,
    "date": req.query.pDate,
    "post": {
        "message": req.query.pMessage,
        "likes": "",
        "comments": [
        {
            "user": "",
            "comment": ""
        }
        ]
    }
}, null, function (err, body) {
        if (err) {
            console.log(err);
            res.status(404);
            res.end();
        } else {
            res.status(200);
            res.end();
        }
    })
});
//Get the profile of someone user is following
router.get('/followingProfile', function (req, res){
    marz.get('_design/post/_view/post?key="' + req.query.user + '"', function(err, body) {
        if (!err) {
            res.send(body);  
        } else {
            res.status(404);
            res.send({success: false});
            console.log(err);
        }
    });
})
module.exports = router;