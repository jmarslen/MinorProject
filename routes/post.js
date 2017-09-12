var cloudant = {
   url : "<url>"
};
var host = "localhost";
var port = 5984;
cloudant.url = "http://" + host + ":" + port;
var express = require('express');
var nano = require('nano')(cloudant.url);
var path = require('path');
var marz = nano.db.use('db');
var router = express.Router();

router.get('/getPost', function (req, res) {
    console.log('post');
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

module.exports = router;