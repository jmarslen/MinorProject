var express = require('express'),
app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
app.use('/', express.static(path.join(__dirname, 'public')));
var user = require('./routes/users');
var post = require('./routes/post');
const fileUpload = require('express-fileupload');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, usr){
    io.emit('chat message', msg, usr);
  });
  
});

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
 
    res.send('File uploaded!');
  });
});

app.use('/user', user);
app.use('/post', post);

http.listen(port, function(){
  console.log('listening on the *:' + port);
});
