//Writes post to the top of the page when new posts are submitted
function createPost(name, msg, fullname, image) {
    var date = new Date().toLocaleString();
    return '<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
'<img src="Profile/' + image + '" alt="Avatar" class="w3-left w3-circle w3-margin" style="width: 80px; height: 80px;">' +
  '<h3 class="w3-margin">' + fullname + '</h3>' +
  '<p class="w3-tiny w3-left">' + name + '</p>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border w3-light-gray">' +
'  <h2>' + msg + '</h2>' +
'</div>' +
'<footer class="w3-container w3-border" style="height: 20px">' +
'</footer>' +
'</div>'
}
//Used to display posts on page load
function initiatePosts(name, msg, date, fullname, image) {
    $('#messages').append('<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
'<img src="Profile/' + image + '" alt="Avatar" class="w3-left w3-circle w3-margin" style="width: 80px; height: 80px;">' +
  '<h3 class="w3-margin">' + fullname + '</h3>' +
  '<p class="w3-tiny w3-left">' + name + '</p>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border w3-light-gray">' +
'  <h2>' + msg + '</h2>' +
'</div>' +
'<footer class="w3-container w3-border" style="height: 20px">' +
'</footer>' +
'</div>')
}
//Loads posts on page load
function loadPosts(){
    var list = userfollowlist().then(function(resolve){
        userList = resolve.value.following;
    });
    list.then(function(){
      getPosts(userList);
    })
}
//Date comparison function to sort the posts by date
function compare(a,b) {
    var dateA = new Date(a.value.date).getTime();
    var dateB = new Date(b.value.date).getTime();
    if (dateA < dateB)
        return -1;
    if (dateA > dateB)
        return 1;
    return 0;
}
//Gets posts from the database
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
               var fullname = post.value.fullname;
               var image = post.value.profileImage;
               $.each(userList, function(n, user){
                   if (user.username === usr){
                     initiatePosts(usr, msg, date, fullname, image)
                   }
               })
           })
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}
//Gets the username of the user
function getUsername() {
    var user = $.cookie('marzuser');
    if (user !== undefined) {
         return user;
    } else {
        window.location = 'index.html';
    }
}
//Gets the name of the user
function getName() {
    let name = $.cookie('marzname');
    if (name !== undefined){
        return name;
    } else {
        return window.location = 'index.html'
    }
}
//Get the profile picture of the logged in user
function getProfilePic() {
    var username = $.cookie('marzuser');
    return new Promise(function(resolve, reject) {
    $.ajax({
        url: '/user/userProfile',
        type: 'get',
        data: {
            username: username
        },
        success: function (data) {
            console.log(data);
            resolve(data.value.profileImage);
        },
        error: function (err) {
            console.log(err);
        }
    })
})
}
//Get the full name of the user
function getFullName() {
    var username = $.cookie('marzuser');
    $.ajax({
        url: '/user/userProfile',
        type: 'get',
        data: {
            username: username
        },
        success: function (data) {
            $('#user').html(data.value.fullname);
            return data.value.fullname;
        },
        error: function (err) {
            console.log(err);
        }
    })
}
//Write new posts to the database
function writeNewPostToDB(usr, message, name, image) {
    var date = new Date().toLocaleString();
        $.ajax({
        url: '/post/newPost',
        type: 'get',
        data: {
            pUsername: usr,
            pMessage: message,
            pDate: date,
            pName: name,
            pImage: image
        },
        success: function (data) {
            console.log('Posted');
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}

//Logout removes all cookies and returns user to login screen
function logout() {
    $.removeCookie('marzuser');
    $.removeCookie('marzname');
    window.location = 'index.html';
}
//Displays new post button when a user submits a post
function newPost() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    $("#newPosts").hide();
    return false;
}
//Upload profile photo
function uploadFile() {
    var user = $.cookie('marzuser');
    var data = new FormData($('#uploadForm')[0]);
    data.append('username', $('#username').val());
    $.ajax({
        url: '/upload',
        type: 'POST',
        encType: 'multipart/form-data',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function() {
            $('#profile').hide();
            swal({
                title: "Success!",
                text: "Profile Pic Added!",
                type: "success",
                confirmButtonText: "WooHoo..."
              });
        },
        error: function() {

        }
    });
}