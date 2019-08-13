$('.timeline').on('click', '.like', function(e) {

    e.preventDefault();

    const likeButton = $(this);

    const heartButton = likeButton.find('.heart');

    const cssPropertyToChange = 'background-position';

    const tweetId = likeButton.parents().eq(2).attr('id');

    const likeCountField = likeButton.find('.like-count');

    $.ajax({
        method: 'POST',
        url: '/tweet/like',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ tweet: tweetId }),
        dataType: 'json',
        success: function(data) {

            likeCountField.html(data.likes);

            if (!heartButton.hasClass('liked')) heartButton.toggleClass('is-animating');

            heartButton.toggleClass('liked');

        },
        error: function(err) {
            alert('Like failed due to some reason.');
        }
    });

});


$('.timeline').on('animationend', '.like', function(e) {

    $(this).find('.heart').toggleClass('is-animating');

});