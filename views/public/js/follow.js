$('.friendship').on('click', '.user', function(e) {

    const handle = $(this).find("h6").html().substring(1);

    window.location.href = `/user/${handle}`;

});