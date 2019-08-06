$('#logout').on('click', (e) => {

    e.preventDefault();

    $.ajax({
        method: 'POST',
        url: '/logout',
        headers: {
            'Content-Type': 'application/json'
        },
        dataType: 'json',
        success: function(data) {
            window.location.href = data.redirect;
        },
        error: function(err) {
            alert('Logout failed!');
        }
    });

});