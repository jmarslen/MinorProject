function createPost(name, msg, fullname, image) {
    var date = new Date().toLocaleString();
    var messg = messageValidation(msg);
    return '<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
'<img src="Profile/' + image + '" alt="Avatar" class="w3-left w3-circle w3-margin" style="width: 80px; height: 80px;">' +
  '<h3 class="w3-margin">' + fullname + '</h3>' +
  '<p class="w3-tiny w3-left">' + name + '</p>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border w3-light-gray">' +
'  <h2>' + messg + '</h2>' +
'</div>' +
'<footer class="w3-container w3-border" style="height: 20px">' +
/*     '<h5 style="float: left">Like |</h5>' +
    '<h5>| Comment</h5>' + */
'</footer>' +
'</div>'
}

function initiatePosts(name, msg, date, fullname, image) {
    var messg = messageValidation(msg);
    $('#messages').append('<div class="w3-card-4 w3-margin">' + 
'<header class="w3-container w3-border">' +
'<img src="Profile/' + image + '" alt="Avatar" class="w3-left w3-circle w3-margin" style="width: 80px; height: 80px;">' +
  '<h3 class="w3-margin">' + fullname + '</h3>' +
  '<p class="w3-tiny w3-left">' + name + '</p>' +
  '<p class="w3-tiny w3-right">' + date + '</p>' +
'</header>' +
'<div class="w3-container w3-border w3-light-gray">' +
'  <h2>' + messg + '</h2>' +
'</div>' +
'<footer class="w3-container w3-border" style="height: 20px">' +
/*     '<h5 style="float: left">Like |</h5>' +
    '<h5>| Comment</h5>' + */
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
    var dateA = new Date(a.value.date).getTime();
    var dateB = new Date(b.value.date).getTime();
    if (dateA < dateB)
        return -1;
    if (dateA > dateB)
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

function getUsername() {
    var user = $.cookie('marzuser');
    if (user !== undefined) {
        //$('#user').html(user);
         return user;
    } else {
        window.location = 'index.html';
    }
}

function getName() {
    let name = $.cookie('marzname');
    if (name !== undefined){
        return name;
    } else {
        return window.location = 'index.html'
    }
}

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

function getFullName() {
    var username = $.cookie('marzuser');
    $.ajax({
        url: '/user/userProfile',
        type: 'get',
        data: {
            username: username
        },
        success: function (data) {
            console.log(data);

            $('#user').html(data.value.fullname);
            //$('#fullname').val(data.value.fullname);
            //document.getElementById('profile').style.display='block';
            return data.value.fullname;
        },
        error: function (err) {
            console.log(err);
        }
    })
}

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
function messageValidation(msg){
    //May need to reference this as it is not my regex
    var urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp|file|rdp|ftp|Ftp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
    return msg.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
}
function logout() {
    $.removeCookie('marzuser');
    window.location = 'index.html';
}
function newPost() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    $("#newPosts").hide();
    return false;
}

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