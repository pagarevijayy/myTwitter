const loginForm = document.getElementById("loginForm");

loginForm.addEventListener('submit', (e) => {

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
            console.log(data);
            // window.location.href = data.redirect;
        },
        error: function(err) {
            alert('Authentication failed. Please provide correct credentials.');
        }
    });

});