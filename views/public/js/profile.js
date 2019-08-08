$('#follow').on('click', function(e) {

    e.preventDefault();

    const followButton = $(this);

    const data = { handle: followButton.data('handle') };

    const follows = followButton.attr('data-follows') === 'true' ? true : false;

    const action = follows ? "unfollow" : "follow";

    $.ajax({
        method: 'POST',
        url: '/friendships',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: function(data) {

            if (follows) {

                followButton.attr('data-follows', 'false');
                followButton.html('Follow');
                followButton.removeClass('btn-primary').addClass('btn-outline-primary');
                return;

            }

            followButton.attr('data-follows', 'true');
            followButton.html('Following');
            followButton.removeClass('btn-outline-primary').addClass('btn-primary');

        },
        error: function(err) {
            console.log(err);
            alert(`${action} failed!`);
        }

    });

});