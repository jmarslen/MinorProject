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
var CryptoJS = require("crypto-js");
var router = express.Router();
//bottom of page

var encrypt = function(string) {
    var pwd = string;
    var myEncryptionString = "tryAndCrackThis";
    var encryptedPWD = CryptoJS.AES.encrypt(pwd, myEncryptionString).toString();
    return encryptedPWD;
}

var decrypt = function(string) {
    var pwd = string;
    var myEncryptionString = "tryAndCrackThis";
    var decrypted = CryptoJS.AES.decrypt(pwd, myEncryptionString).toString(CryptoJS.enc.Utf8);
    return decrypted;
}

var createNewProfile = function(username, fullname){
    marz.insert({
        "type": "profile",
        "username": username,
        "fullname": fullname,
        "myposts": [],
        "following": [{"username": username}],
        "followers": []
}, null, function (err, body) {
        if (err) {
            console.log(err);
        } else {
            
        }
    })
}

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
            createNewProfile(req.query.username, req.query.fullname);
            res.status(200);
            res.end();
        }
    })
});

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

router.get('/addFollowing', function (req, res){
    var addFollowing = Promise(function(resolve, reject) { 
        marz.get('_design/profile/_view/profile?key="' + req.query.username + '"', function(err, body) {
            if (!err && body.rows.length > 0) {
                resolve(body.rows);  
            } else {
                res.status(404);
                res.send({success: false});
                console.log(err);
            }
        });
    })
    addFollowing.then(function(resolve){
        console.log(resolve);
    })

})

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