const sendFriendshipRequest = (followData) => {

    const action = followData.follow ? "follow" : "unfollow";

    $.ajax({
        method: 'POST',
        url: '/friendships',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(followData),
        success: function(data) {

            if (followData.follow) {

                $('#follow').css('display', 'none');
                $('#following').css('display', 'inline');


            } else {

                $('#following').css('display', 'none');
                $('#follow').css('display', 'inline');

            }

        },
        error: function(err) {
            console.log(err);
            alert(`${action} failed!`);
        }

    });

};

$('#following').on('click', function(e) {

    e.preventDefault();

    sendFriendshipRequest({
        handle: $(this).data('handle'),
        follow: false
    });

});

$('#follow').on('click', function(e) {

    e.preventDefault();

    sendFriendshipRequest({
        handle: $(this).data('handle'),
        follow: true
    });

});