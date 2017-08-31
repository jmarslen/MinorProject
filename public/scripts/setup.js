function createPost(name, msg) {
    var date = new Date().toLocaleString();
    return '<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
  '<h1>' + name + '</h1>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border">' +
'  <p>' + msg + '</p>' +
'</div>' +
'<footer class="w3-container w3-border">' +
    '<h5 style="float: left">Like |</h5>' +
    '<h5>| Comment</h5>' +
'</footer>' +
'</div>'
}

function initiatePosts(name, msg, date) {
    $('#messages').append('<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
  '<h1>' + name + '</h1>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border">' +
'  <p>' + msg + '</p>' +
'</div>' +
'<footer class="w3-container w3-border">' +
    '<h5 style="float: left">Like |</h5>' +
    '<h5>| Comment</h5>' +
'</footer>' +
'</div>')
}

function loadPosts(){
    var list = userfollowlist().then(function(resolve){
        userList = resolve.value.following;
    });
    list.then(function(){
      getPosts(userList);
    })
}

function compare(a,b) {
    if (a.value.date < b.value.date)
        return -1;
    if (a.value.date > b.value.date)
        return 1;
    return 0;
}

function getPosts(userList) {
    $('#messages').html('');
    $.ajax({
        url: '/post/getPost',
        type: 'get',
        data: {},
        success: function (data) {
            var posts = data.rows;
            posts.sort(compare).reverse();
           $.each(posts, function(i, post){
               var usr = post.value.username;
               var msg = post.value.post.message;
               var date = post.value.date;
               $.each(userList, function(n, user){
                   if (user.username === usr){
                     initiatePosts(usr, msg, date)
                   }
               })
           })
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}

function getUsername() {
    var user = $.cookie('marzuser');
    if (user !== undefined) {
        $('#user').html(user);
         return user;
    } else {
        window.location = 'index.html';
    }
}

function writeNewPostToDB(usr, message) {
    var date = new Date().toLocaleString();
        $.ajax({
        url: '/post/newPost',
        type: 'get',
        data: {
            pUsername: usr,
            pMessage: message,
            pDate: date
        },
        success: function (data) {
            console.log('Posted');
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}
