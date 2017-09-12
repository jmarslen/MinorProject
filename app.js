var cloudant = {
  url : "<url>"
};
var host = "localhost";
var port = 5984;
cloudant.url = "http://" + host + ":" + port;
var express = require('express'),
app = express();
var nano = require('nano')(cloudant.url);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use('/', express.static(path.join(__dirname, 'public')));
var user = require('./routes/users');
var post = require('./routes/post');
const fileUpload = require('express-fileupload');
var marz = nano.db.use('db');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, usr, name, image){
    io.emit('chat message', msg, usr, name, image);
  });
  
});

function updateProfilePic(filename, username) {
  var promise = new Promise(function(resolve, reject) {
    console.log(username);
      marz.get('_design/profile/_view/profile?key="' + username + '"', function(err, body) {
          if (!err && body.rows.length > 0) {
              resolve(body.rows);
          } else {
            
              //res.status(404);
              //res.send({success: false});
              reject(err);
              console.log(err);
          }
      });
  })
  promise.then(function(resolve){
      var data = {
          "_rev": resolve[0].value._rev,
          "type": "profile",
          "username": resolve[0].value.username,
          "fullname": resolve[0].value.fullname,
          "profileImage": filename,
          "myposts": [],
          "following":
              resolve[0].value.following
          ,
          "followers": []
        }
        marz.insert(data, resolve[0].value._id, function(err, body, header){
            if (err){
              console.log(err);
            } else {
              console.log('success');
            }
        });
  })
}

app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  var i = sampleFile.name.split('.')
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(__dirname + '/public/Profile/' + req.body.username + '.' + i[1], function(err) {
    if (err)
      return res.status(500).send(err);
 
    let filename = req.body.username + "." + i[1];    
    updateProfilePic(filename, req.body.username);
    res.send('File uploaded!');
  });
});

app.use('/user', user);
app.use('/post', post);

http.listen(port, function(){
  console.log('listening on the *:' + port);
});
