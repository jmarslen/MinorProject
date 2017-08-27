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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg, usr){
    io.emit('chat message', msg, usr);
  });
  
});

app.use('/user', user);
app.use('/post', post);

http.listen(port, function(){
  console.log('listening on the *:' + port);
});
