$('#loginForm').on('submit', (e) => {
    e.preventDefault();
    $.ajax({
        method: 'POST',
        url: '/login',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ email: $('#loginEmail').val(), password: $('#loginPassword').val() }),
        dataType: 'json',
        success: function(data) {
            window.location.href = data.redirect;
        },
        error: function(err) {
            alert('Authentication failed. Please provide correct credentials.');
        }
    });

});

$('#signupForm').on('submit', function(e) {
    e.preventDefault();
    const signupData = {};
    $('#signupForm').serializeArray().forEach(element => {
        signupData[element.name] = element.value;
    });

    $.ajax({
        method: 'POST',
        url: '/signup',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(signupData),
        dataType: 'json',
        success: function(data) {
            window.location.href = data.redirect;
        },
        error: function(err) {
            alert('Signup failed!');
        }
    });
});