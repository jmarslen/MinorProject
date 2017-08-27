var userCheck = function (username, password) {
    $.ajax({
        url: '/user/user',
        type: 'get',
        data: {
            username: username,
            password: password
        },
        success: function (data) {
            if ($.cookie('marzuser') === undefined){
                $.cookie('marzuser', data.value.username, { expires: 7, path: '/' });
                window.location = 'container.html';
            } else if ($.cookie('marzuser') === data.value.username) {
                window.location = 'container.html';
            } else {
                $.removeCookie('marzuser');
                $.cookie('marzuser', data.value.username, { expires: 7, path: '/' });
                window.location = 'container.html';
            }
        },
        error: function (err) {
            $('#successText').text("Login failed");
        }
    })
}
var displaySignup = function(){
    document.getElementById('createProfile').style.display='block';
}

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

var createUser = function() {
    var username = $('#newusername').val();
    var fullname = $('#newfullname').val();
    var password = $('#newpassword').val();
    var exists;
    if (username.length > 2 && fullname.length > 2 && password.length > 3){
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
