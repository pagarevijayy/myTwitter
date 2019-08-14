const socket = io();


$(function() {
    $.ajax({
        method: 'GET',
        url: '/handles',
        dataType: 'json',
        success: function(data) {

            $('#search').autocomplete({
                source: data,
                autoFocus: true
            });

        }
    });
});

$('#search').keypress(function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        console.log($('#search').val());
        $.ajax({
            method: 'GET',
            url: `/search?handle=${$('#search').val()}`,
            dataType: 'json',
            success: function(data) {
                console.log(data);
                $('#search').trigger('reset');
                window.location.href = `/user/${data.handle}`;
            },
            error: function(err) {
                alert('This handle does not exist!');
            }
        });
    }
});



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

const submitTweet = (src) => {
    $.ajax({
        method: 'POST',
        url: '/tweet',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(src),
        dataType: 'json',
        success: function(data) {
            $(function() {
                $('#tweetModal').modal('toggle');
                location.reload();
                socket.emit('tweet', data);
            });
        },

        error: function(err) {
            alert('tweet unsuccessful!');
        }
    });
}

$('#tweetSubmit').on('click', (e) => {
    e.preventDefault();
    submitTweet({
        text: $('#tweetText').val()
    });
});

$('#tweetModal').on('hidden.bs.modal', function() {
    $('#tweet').trigger('reset');
})

$('#tweetSubmitHome').on('click', (e) => {
    e.preventDefault();
    submitTweet({
        text: $('#tweetTextHome').val()
    });
});

socket.on('newTweet', (data) => {
    const found = data.followerList.includes($.cookie('user_id'));
    if (found) {
        $('#noFollowing').html('');

        $('.timeline').prepend(`
        <div id="${data._id}" class="media border-bottom mt-4 real-time">

        <img src="https://previews.123rf.com/images/pandavector/pandavector1704/pandavector170400314/75968328-avatar-of-a-man-in-a-shirt-avatar-and-face-single-icon-in-cartoon-style-vector-symbol-stock-illustra.jpg"
            height="50px" width="50px" class="mr-3" alt="avatar">
        <div class="media-body">
            <h5 class="mt-0 d-inline-flex"><a class="link-rm-defaults text-body"
                    href="/user/${data.handle}"> ${data.name} </a></h5>
            <span class="d-inline-flex text-muted small">
                <h6 class="font-weight-normal">@${data.handle}</h6>
            </span>
            <span class="d-inline-flex text-muted small"> | ${data.createdAt}</span>
            <p class="mb-2">
                ${data.text}
            </p>
            <div class="mt-2 mb-1 pl-2">

                <a href="#" class="link-rm-defaults text-muted ">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="fa fa-comment-o"></i></h6> ${data.replyCount}
                    </span>
                </a>

                <a href="#" class="link-rm-defaults text-muted retweet">
                    <span class="mr-3">
                        <img class="retweet-icon mr-3 mb-1" src="/img/retweet.png" alt="">
                        <span class="retweet-count">${data.retweetCount}</span>
                    </span>
                </a>

                <a href="#" class="link-rm-defaults text-muted like">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="heart"></i></h6>
                        <span class="like-count">${data.likeCount}</span>
                    </span>
                </a>
            </div>
        </div>
    </div>`);
    }
})

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

            const retweets = data.retweetCount;

            retweetCountField.html(retweets);

            if (retweetIcon.hasClass('retweeted')) {

                retweetIcon.attr('src', '/img/retweet.png');
                retweetIcon.toggleClass('retweeted');
                return;

            }

            retweetIcon.attr('src', '/img/retweeted.png');
            retweetIcon.toggleClass('retweeted');

            socket.emit('retweet', data);

        },
        error: function(err) {
            alert('Retweet failed due to some reason.');
        }
    });
});

socket.on('newRetweet', (data) => {
    const found = data.followerList.includes($.cookie('user_id'));
    if (found) {
        $('#noFollowing').html('');

        $('.timeline').prepend(`
        <div class="real-time">
        <div>
        <small class="ml-5"> <i class="fa fa-retweet text-muted"></i> <a class=" text-body text-muted"
                href="/user/${data.retweetUserHandle}"> ${data.retweetUserName} Retweeted</a></small>
        </div>
    <div id="${data._id}" class="media border-bottom mt-2">
        <img src="https://previews.123rf.com/images/pandavector/pandavector1704/pandavector170400314/75968328-avatar-of-a-man-in-a-shirt-avatar-and-face-single-icon-in-cartoon-style-vector-symbol-stock-illustra.jpg"
            height="50px" width="50px" class="mr-3" alt="avatar">
        <div class="media-body">
            <h5 class="mt-0 d-inline-flex "><a class="link-rm-defaults text-body"
                    href="/user/${data.handle}">${data.name}</a></h5>
            <span class="d-inline-flex text-muted small">
                <h6 class="font-weight-normal">@${data.handle}</h6>
            </span>
            <span class="d-inline-flex text-muted small"> | ${data.createdAt}</span>
            <p class="mb-2">
                ${data.text}
            </p>
            <div class="mt-2 mb-1 pl-2">

                <a href="#" class="link-rm-defaults text-muted ">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="fa fa-comment-o"></i></h6> ${data.replyCount}
                    </span>
                </a>

                <a href="#" class="link-rm-defaults text-muted retweet">

                    <span class="mr-3">
                        <img class="retweet-icon mr-3 mb-1" src="/img/retweet.png" alt="">
                        <span class="retweet-count">${data.retweetCount}</span>
                    </span>

                </a>

                <a href="#" class="link-rm-defaults text-muted like">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="heart"></i></h6>
                        <span class="like-count">${data.likeCount}</span>
                    </span>
                </a>
            </div>
        </div>
    </div>
    </div>`);
    }
})