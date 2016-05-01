Wistia.plugin("hover-play", function(video, options) {
    //Current options Available to Change:
    // video hashed_id -required
    // src: "/experiments/magicScrollPlugin.js" - required

    //Early Defined Variables
    var aspectRatio = video.aspect();
    var videoHashedId = video.hashedId();
    //Grab the video container
    var videoContainer = document.getElementsByClassName("wistia_async_" + videoHashedId)[0];
    //Video Dimensions
    var videoHeight = video.height();
    var videoWidth = video.width();
    //Is the video playing
    var videoPlaying = false;
    videoContainer.onmouseover = function() {
        video.play();
        videoPlaying = true;
    };
    videoContainer.onmouseout = function() {
        video.pause();
        videoPlaying = false;
    };

});
