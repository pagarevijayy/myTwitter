const socket = io();

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
                socket.emit('tweet',data)
            });
        },
        error: function (err) {

            alert('tweet unsuccessful!');
        }
    });
});

socket.on('newTweet', (data) => {
    $('#socketTweets').append(`
    <div class="media border-bottom mt-4">
        <img src="https://previews.123rf.com/images/pandavector/pandavector1704/pandavector170400314/75968328-avatar-of-a-man-in-a-shirt-avatar-and-face-single-icon-in-cartoon-style-vector-symbol-stock-illustra.jpg"
            height="50px" width="50px" class="mr-3" alt="avatar">
        <div class="media-body">
            <h5 class="mt-0 d-inline-flex ">${data.name}</h5>
            <span class="d-inline-flex text-muted small">
                <h6 class="font-weight-normal">${data.handle}</h6>
            </span>
            <span class="d-inline-flex text-muted small"> | ${data.createdAt}</span>
            <p class="mb-2">
                ${data.text}
            </p>
            <div class="mb-1 pl-2">
                <a href="#" class="link-rm-defaults text-muted">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="fa fa-heart-o"></i></h6> ${data.likeCount}
                    </span>
                </a>

                <a href="#" class="link-rm-defaults text-muted ">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="fa fa-comment-o"></i></h6> ${data.replyCount}
                    </span>
                </a>

                <a href="#" class="link-rm-defaults text-muted">
                    <span class="mr-5">
                        <h6 class="d-inline-flex"><i class="fa fa-retweet"></i></h6> ${data.retweetCount}
                    </span>
                </a>
            </div>
        </div>
    </div>`) 
})