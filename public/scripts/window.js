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

function displayFollowing() {
    var userList;
    var list = viewFollowing().then(function(resolve){
            userList = resolve;
        }); 
    list.then(function(){
    $("#followingContent").html("");
        $.each(userList, function(n, user){
            $('#followingContent').append('<input class="w3-check w3-padding" type="checkbox"><label> ' + user.username+' </label><br />');
        })
        document.getElementById('following').style.display='block';
    })

}

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

var searchList;
function performSearch(value) {
    $.each(searchList, function(n, user){
        if (user.value.indexOf(value) != -1 && value.length > 2){
            $('#findContent').html('');
            $('#findContent').append('<input class="w3-check w3-padding" type="checkbox"><label> ' + user.value+' </label><br />');
        } 
    })
}


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



