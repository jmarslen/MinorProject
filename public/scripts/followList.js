function userfollowlist() {
        var username = $.cookie('marzuser');
        var returnData;
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: '/user/userProfile',
                type: 'get',
                dataType: 'json',
                data: {
                    username: username
                },
                success: function (data) {
                        resolve(data);
                },
                error: function (err) {
                    console.log(err);
                }
            })
        })
}