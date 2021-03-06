//View logged in users profile
function viewProfile() {
    var username = $.cookie('marzuser');
        $.ajax({
            url: '/user/userProfile',
            type: 'get',
            data: {
                username: username
            },
            success: function (data) {
                $('#username').val(data.value.username);
                $('#fullname').val(data.value.fullname);
                document.getElementById('profile').style.display='block';
            },
            error: function (err) {
                console.log(err);
            }
        })

} 
//Get the list of users following
function viewFollowing() {
        var username = $.cookie('marzuser');
        return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/user/userProfile',
            type: 'get',
            data: {
                username: username
            },
            success: function (data) {
                resolve(data.value.following);
            },
            error: function (err) {
                console.log(err);
            }
        })
        })
}
//Display a list of users following
function displayFollowing() {
    var userList;
    var list = viewFollowing().then(function(resolve){
            userList = resolve;
        }); 
    list.then(function(){
    $("#followingContent").html("");
        $.each(userList, function(n, user){
            $('#followingContent').append('<input class="w3-check w3-padding" type="checkbox"/><button class="w3-button" onclick="viewFollowingProfile(&#39' + user.username + '&#39)"> ' + user.username +' </button><br />');
        })
        document.getElementById('following').style.display='block';
    })

}
//Get list of users to unfollow
function getRemoveFollowData() {
    var data = {followers: []};
    var promise =  new Promise(function(reject,resolve){
        return $('#followingContent').find('input[type="checkbox"]:checked').each(function () {
            data.followers.push({
            "username": $(this).next().text().trim()
        })
        })})
        promise.then(removeFollowing(data));
}
//remove following from the user profile
function removeFollowing(info){
    var user = $.cookie('marzuser');
    $.ajax({
        url: '/user/removeFollowing',
        type: 'put',
        data: {
            user: user,
            following: info
        },
        success: function (data) {
            document.getElementById('following').style.display='none';
            loadPosts();
            swal({
                title: "Success!",
                text: "Users Removed!",
                type: "success",
                confirmButtonText: "WooHoo..."
              });
        },
        error: function (err) {
            $('#successText').text("Following failed");
        }
    })

}
//Get the selected users to unfollow
function getFollowingData(){
    var data = {followers: []};
    var promise =  new Promise(function(reject,resolve){
        return $('#findContent').find('input[type="checkbox"]:checked').each(function () {
            data.followers.push({
            "username": $(this).next().text().trim()
        })
        })})

        promise.then(addFollowing(data));
}
//Add new followed user
function addFollowing(info) {
    var user = $.cookie('marzuser');
    $.ajax({
        url: '/user/addFollowing',
        type: 'put',
        data: {
            user: user,
            following: info
        },
        success: function (data) {
            document.getElementById('find').style.display='none';
            loadPosts();
            swal({
                title: "Success!",
                text: "Users Added!",
                type: "success",
                confirmButtonText: "WooHoo..."
              });
        },
        error: function (err) {
            $('#successText').text("Following failed");
        }
    })
}
//Search for a user
var searchList;
function performSearch(value) {
    $('#findContent').html('');
    $.each(searchList, function(n, user){
        if (user.value.indexOf(value) != -1){
            $('#findContent').append('<input class="w3-check w3-padding" type="checkbox"><label> ' + user.value+' </label><br />');
        } 
    })
}
//Get list of all users
function viewUsers() {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/user/userList',
            type: 'get',
            data: {},
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                console.log('Failed');
            }
        })
    })
}
//Display the list of users
function getUserList() {
    var list = viewUsers().then(function(resolve){
            searchList = resolve;
        }); 
    list.then(function(){
    $("#findContent").html("");
        $.each(searchList, function(n, user){
            $('#findContent').append('<input class="w3-check w3-padding" type="checkbox"><label> ' + user.value+' </label><br />');
        })
        document.getElementById('find').style.display='block';
    })
}
//View posts from a particular followed user
function appendFollowPosts(name, msg, date, fullname, image){
    $('#viewFollowPosts').append('<div class="w3-card-4 w3-margin">' + 
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
//Gets the data to display the followed users posts
function viewFollowingProfile(username) {
    console.log(username);
    $("#followingUsername").val('');
    $("#followingFullname").val('');
    $("#viewFollowPosts").html("");
    $.ajax({
        url: '/post/followingProfile',
        type: 'get',
        data: {
            user: username
        },
        success: function (data) {
            var posts = data.rows;
            posts.sort(compare).reverse();
            $("#followingUsername").val(posts[0].value.username);
            $("#followingFullname").val(posts[0].value.fullname);
           $.each(posts, function(i, post){
               var usr = post.value.username;
               var msg = post.value.post.message;
               var date = post.value.date;
               var fullname = post.value.fullname;
               var image = post.value.profileImage;
               appendFollowPosts(usr, msg, date, fullname, image)

           })
           document.getElementById('viewFollowing').style.display='block';
        },
        error: function (err) {
           
        }
    })
}

