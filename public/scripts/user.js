//Validates the users credentials
var userCheck = function (username, password) {
    $.ajax({
        url: '/user/user',
        type: 'get',
        data: {
            username: username,
            password: password
        },
        success: function (data) {
            //Determine if Cookies have been set
            if ($.cookie('marzuser') === undefined){
                $.cookie('marzuser', data.value.username, { expires: 7, path: '/' });
                $.cookie('marzname', data.value.fullname, { expires: 7, path: '/'});
                window.location = 'container.html';
            } else if ($.cookie('marzuser') === data.value.username && $.cookie('marzname') === data.value.fullname) {
                window.location = 'container.html';
            } else {
                $.removeCookie('marzuser');
                $.removeCookie('marzname');
                $.cookie('marzuser', data.value.username, { expires: 7, path: '/' });
                $.cookie('marzname', data.value.fullname, { expires: 7, path: '/'});
                window.location = 'container.html';
            }
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}
//Displays the signup modal
var displaySignup = function(){
    document.getElementById('createProfile').style.display='block';
}
//Checks to see if user exists
var validateNewUser = function(username, password) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            url: '/user/userExists',
            type: 'get',
            data: {
                username: username
            },
            success: function (data) {
                resolve(false);
            },
            error: function (err) {
                resolve(true);
            }
        })
        })
}

function usernameValidation(username) {
    //Regex to validate if email address used for username
    var regex = /^[\w\.]+\@[\w\.]+\.[\w\.]+/;
    return regex.test(username);
}
//Setup the create user, validate the fields, check if user exists
var createUser = function() {
    var username = $('#newusername').val();
    var fullname = $('#newfullname').val();
    var password = $('#newpassword').val();
    var validusr = usernameValidation(username);
    var image = $('#proPic').val();
    var exists;
    
    if (validusr && image.length > 0 && username.length > 2 && fullname.length > 2 && password.length > 3){
        var check = validateNewUser(username, password).then(function(resolve){
            exists = resolve;
        });
        check.then(function(){
            if (exists) {
                swal({
                    title: "Error!",
                    text: "Username already exists!",
                    type: "error",
                    confirmButtonText: "Damn..."
                  });
            } else {
                addUserToDB(username, fullname, password);
            }
        })
    } else {
        swal({
            title: "Error!",
            text: "The data you have entered does not meet our criteria!",
            type: "error",
            confirmButtonText: "Damn..."
          });
    }
}
//Upload profile picture
function uploadFilePic(user) {
    var data = new FormData($('#newForm')[0]);
    data.append('username', user);
    $.ajax({
        url: '/upload',
        type: 'POST',
        encType: 'multipart/form-data',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function() {
            console.log('Profile Pic uploaded');
        },
        error: function() {

        }
    });
}
//Add new user to the database
var addUserToDB = function(username, fullname, password){
        $.ajax({
        url: '/user/addUser',
        type: 'get',
        data: {
            username: username,
            fullname: fullname,
            password: password
        },
        success: function (data) {
            uploadFilePic($('#newusername').val());
            $('#newusername').val('');
            $('#newfullname').val('');
            $('#newpassword').val('');
            document.getElementById('createProfile').style.display='none';
            swal("Success!", "Your account has been created!", "success")
        },
        error: function (err) {
            $('#successText').text("Creation Failed");
            swal({
                title: "Error!",
                text: "Account creation failed!",
                type: "error",
                confirmButtonText: "Damn..."
              });
        }
    })
}
