$('#editProfile').on('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: 'get',
        url: '/profileDetails',
        headers: {
            'Content-Type': 'application/json'
        },
        dataType: 'json',
        success: function (data) {
            $('#name').val(data.name);
            $('#email').val(data.email);
            $('#handle').val(data.handle);
            $('#bio').val(data.bio);
            $('#DOB').val(data.DOB);
        },
        error: function (err) {
            alert('Unable to edit profile');
        }
    });
});

$('#saveChanges').on('click', (e) => {
    e.preventDefault();
    const profileData = {};
    $('#profileForm').serializeArray().forEach(element => {
        if (element.value) {
            profileData[element.name] = element.value;
        }   
    });
    $.ajax({
        method: 'PATCH',
        url: '/profile',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(profileData),
        dataType: 'json',
        success: function (data) {
            location.reload();
        },
        error: function (err) {
            alert('Changes could not be saved!');
        }
    });
});