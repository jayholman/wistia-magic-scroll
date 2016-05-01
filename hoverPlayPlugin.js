Wistia.plugin("hover-play", function(video, options) {
    //Current options Available to Change:
    // video hashed_id -required
    // src: "/experiments/magicScrollPlugin.js" - required

    //Early Defined Variables
    var videoHashedId = video.hashedId();
    //Grab the video container
    var videoContainer = document.getElementsByClassName("wistia_async_" + videoHashedId)[0];

    document.onmousemove = function() {

        var videoLocationInViewport = videoContainer.getBoundingClientRect();

        var mouseX = event.clientX;
        var mouseY = event.clientY;

        if ((mouseX < videoLocationInViewport.right && mouseX > videoLocationInViewport.left) && (mouseY < videoLocationInViewport.bottom && mouseY > videoLocationInViewport.top)) {
            video.play();
        } else {
            video.pause();
        }

    };
});
