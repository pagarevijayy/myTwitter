$('#logout').on('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/logout',
        headers: {
            'Content-Type': 'application/json'
        },
        dataType: 'json',
        success: function (data) {
            window.location.href = data.redirect;
        },
        error: function (err) {
            alert('Logout failed!');
        }
    });
});

$('#tweetSubmit').on('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/tweet',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ text: $('#tweetText').val() }),
        dataType: 'json',
        success: function (data) {
            $(function () {
                $('#tweetModal').modal('toggle');
            });
        },
        error: function (err) {
            alert('tweet unsuccessful!');
        }
    });
});