var database = {
  url : "<url>"
};
//Declare variables and setup app server
var host = "localhost";
var port = 5984;
database.url = "http://" + host + ":" + port;
var express = require('express'),
app = express();
var nano = require('nano')(database.url);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use('/', express.static(path.join(__dirname, 'public')));
var user = require('./routes/users');
var post = require('./routes/post');
const fileUpload = require('express-fileupload');
var marz = nano.db.use('db'); //DB was called MARZ as i thought I would name the app this initially
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());


//Set the index page as the landing page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

//listen for new connections and send 'new post' back to connected users
io.on('connection', function(socket){
  socket.on('new post', function(msg, usr, name, image){
    io.emit('new post', msg, usr, name, image);
  });
  
});

//Get profile of user from DB
function updateProfilePic(filename, username) {
  var promise = new Promise(function(resolve, reject) {
      marz.get('_design/profile/_view/profile?key="' + username + '"', function(err, body) {
          if (!err && body.rows.length > 0) {
              resolve(body.rows);
          } else {
              reject(err);
              console.log(err + " Profile picture upload failed");
          }
      });
  })
  //Write profile picture back with new image
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
//Gets uploaded file details
app.post('/upload', function(req, res) {
  if (!req.files)
    //If there are no files return an error
    return res.status(400).send('No files were uploaded.');
    //Using let to keep variable contained (Experimenting with ES6)
  let proPic = req.files.proPic;
  var i = proPic.name.split('.')
  // mv the file to the server and rename to username
  proPic.mv(__dirname + '/public/Profile/' + req.body.username + '.' + i[1], function(err) {
    if (err)
      //If an error then send internal server error
      return res.status(500).send(err);
    //create the new filename
    let filename = req.body.username + "." + i[1];    
    updateProfilePic(filename, req.body.username);
    res.send('File uploaded!');
  });
});
//Declares which routing files to use
app.use('/user', user);
app.use('/post', post);
//setup http sever to listen on the specified port
http.listen(port, function(){
  console.log('listening on the *:' + port);
});
