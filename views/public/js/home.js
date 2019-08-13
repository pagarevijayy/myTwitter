$('.timeline').on('click', '.like', function(e) {

    e.preventDefault();

    const likeButton = $(this);

    const heartButton = likeButton.find('.heart');

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


$('.timeline').on('click', '.retweet', function(e) {

    e.preventDefault();

    const retweetButton = $(this);

    const retweetIcon = retweetButton.find('.retweet-icon');

    const tweetId = retweetButton.parents().eq(2).attr('id');

    const retweetCountField = retweetButton.find('.retweet-count');

    $.ajax({
        method: 'POST',
        url: '/retweet',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ tweet: tweetId }),
        dataType: 'json',
        success: function(data) {

            retweetCountField.html(data.retweets);

            if (retweetIcon.hasClass('retweeted')) {

                retweetIcon.attr('src', '/img/retweet.png');
                retweetIcon.toggleClass('retweeted');
                return;

            }

            retweetIcon.attr('src', '/img/retweeted.png');
            retweetIcon.toggleClass('retweeted');

        },
        error: function(err) {
            alert('Retweet failed due to some reason.');
        }
    });



});