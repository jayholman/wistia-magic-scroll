Wistia.plugin("magic-scroll", function(video, options) {
    //Current options Available to Change:
    // video hashed_id -required
    // containingDivId: String - required
    // animationWrapperId: String - required
    // placeHolderDivId: String -required
    // src: "/experiments/magicScrollPlugin.js" - required
    // originalHeight: Integer
    // originalWidth: Integer
    // popoutHeight: Integer
    // popoutWidth: Integer
    // popoutLocation: String
    // popoutOffsetX: Integer
    // popoutOffsetY: Integer
    // responsive: Boolean
    // percentVideoPassed: Decimal that equates to Percentage of Video Height;
    //animationSpeed: Decimal of the Seconds

    //Early Defined Variables
    var aspectRatio = video.aspect();
    //Original Sizing
    var originalHeight = 540;
    var originalWidth = 960;
    //Popout Sizing and Location
    var popoutHeight = 224;
    var popoutWidth = 400;
    var popoutLocation = 3;
    var popoutOffsetX = 0;
    var popoutOffsetY = 0;
    var screenSizePopoutHeight = popoutHeight;
    var screenSizePopoutWidth = popoutWidth;
    //When does the video shift
    var percentVideoPassed = 1;
    var animationSpeed = 1;
    //What exists and doesn't exist
    var poppedOut = false;
    //How to grab the video container and the animation wrapper
    var originalVidContainer = document.getElementById(options.containingDivId);
    var animationWrapper = document.getElementById(options.animationWrapperId);
    var placeHolder = document.getElementById(options.placeHolderId);

    //Do we want to alter percentVideoPassed and animationSpeed
    if (options.percentVideoPassed) {
        percentVideoPassed = options.percentVideoPassed;
    }
    if (options.animationSpeed) {
      //Divide animationSpeed by 2 if it's selected
        animationSpeed = options.animationSpeed / 2;
    }

    //Function for converting to Pixel Strings
    var pixelConverter = function(size) {
        var number = size.toString();
        var pixeled = number + "px";
        return pixeled;
    };

    //Original Video Sizing Calculations
    if (options.responsive) {
        //Original height responsive
        originalHeight = "100%";
        //Original width responsive
        originalWidth = "100%";
    } else if (options.originalWidth && !options.originalHeight) {
        originalWidth = options.originalWidth;
        originalHeight = options.originalWidth / aspectRatio;
    } else if (!options.originalWidth && options.originalHeight) {
        originalHeight = options.originalHeight;
        originalWidth = options.originalHeight * aspectRatio;
    } else if (options.originalWidth && options.originalHeight) {
        //Original height static
        var originalHeight = options.originalHeight;
        //Original width static
        var originalWidth = options.originalWidth;
    }

    if (!options.responsive) {
        originalWidth = pixelConverter(originalWidth);
        originalHeight = pixelConverter(originalHeight);
    }

    //Popout Video Sizing Calculations
    if (options.popoutHeight && options.popoutWidth) {
        //Popout height
        popoutHeight = options.popoutHeight;
        //Popout width
        popoutWidth = options.popoutWidth;
    } else if (options.popoutWidth && !options.popoutHeight) {
        popoutWidth = options.popoutlWidth;
        popoutHeight = options.popoutWidth / aspectRatio;
    } else if (!options.originalWidth && options.originalHeight) {
        popoutHeight = options.popoutHeight;
        popoutWidth = options.popoutHeight * aspectRatio;
    }

    screenSizePopoutHeight = popoutHeight;
    screenSizePopoutWidth = popoutWidth;

    popoutHeight = pixelConverter(popoutHeight);
    popoutWidth = pixelConverter(popoutWidth);
    //Determine if offset is needed
    if (options.popoutOffsetY) {
        popoutOffsetY = options.popoutOffsetY;
    }
    if (options.popoutOffsetX) {
        popoutOffsetX = options.popoutOffsetX;
    }

    //Popout Locations Calculations
    if (options.popoutLocation === "topLeft") {
        popoutLocation = 0;
        popoutLocationY = "top: " + popoutOffsetY + ";";
        popoutLocationX = "left: " + popoutOffsetX + ";";
    } else if (options.popoutLocation === "bottomLeft") {
        popoutLocation = 1;
        popoutLocationY = "bottom: " + popoutOffsetY + ";";
        popoutLocationX = "left: " + popoutOffsetX + ";";
    } else if (options.popoutLocation === "topRight") {
        popoutLocation = 2;
        popoutLocationY = "top: " + popoutOffsetY + ";";
        popoutLocationX = "right: " + popoutOffsetX + ";";
    } else {
        popoutLocation = 3;
        popoutLocationY = "bottom: " + popoutOffsetY + ";";
        popoutLocationX = "right: " + popoutOffsetX + ";";
    }

    //Determine class sizes for the two video container states
    var originalSize = '.originalSize { height: ' + originalHeight + '; width: ' + originalWidth + '; position: relative; } ';

    var popoutSize = '.popoutSize { ' + 'height: ' + popoutHeight + '; width: ' + popoutWidth + '; position: fixed; z-index: 1000; ' + popoutLocationY + ' ' + popoutLocationX + ' border: 2px solid dodgerblue;}';

    //Create Animation Styles
    var createPopoutAnimation = ".popoutCreationAnimation { animation-duration: " + animationSpeed + "s; animation-name: poppingOut; animation-iteration-count: 1; position: fixed; z-index: 1000; border: 2px solid dodgerblue; overflow-x: hidden; overflow-y: hidden;" + popoutLocationX + popoutLocationY + "} @keyframes poppingOut { 0% {height: 0px; width: 0px;}  100% { height: " + popoutHeight + "; width: " + popoutWidth + ";} }";

    var destroyPopoutAnimation = ".popoutDestructionAnimation { animation-duration: " + animationSpeed + "s; animation-name: revertingToOriginal; animation-iteration-count: 1; position: fixed; z-index: 1000; border: 2px solid dodgerblue; overflow-x: hidden; overflow-y: hidden;" + popoutLocationX + popoutLocationY + "} @keyframes revertingToOriginal { 0% {height: " + popoutHeight + "; width: " + popoutWidth + ";}  100% { height: 0px; width: 0px;} }";

    var recreateOriginalAnimation = ".originalReconstructionAnimation { animation-duration: " + animationSpeed + "s; animation-name: reconstruction; animation-iteration-count: 1; z-index: 1000; border: 2px solid dodgerblue; overflow-x: hidden; overflow-y: hidden;} @keyframes reconstruction { 0% {height: 0px; width: 0px;}  100% { height: " + originalHeight + "; width: " + originalWidth + ";} }";

    var destroyOriginalAnimation = ".originalDestructionAnimation { animation-duration: " + animationSpeed + "s; animation-name: destruction; animation-iteration-count: 1; z-index: 1000; border: 2px solid dodgerblue; overflow-x: hidden; overflow-y: hidden;} @keyframes destruction { 0% { height: " + originalHeight + "; width: " + originalWidth + ";} 100% {height: 0px; width: 0px;}}";

    //Create CSS styling for the two Classes in the head of the document
    var head = document.getElementsByTagName('head')[0];
    var styleNode = document.createElement("style");
    styleNode.setAttribute("id", "magicScrollPluginCss");
    var magicStyles = document.createTextNode(originalSize + popoutSize + createPopoutAnimation + destroyPopoutAnimation + recreateOriginalAnimation + destroyOriginalAnimation);
    styleNode.appendChild(magicStyles);
    head.appendChild(styleNode);

    //Function for applying a class to the video container
    var setVideoClass = function(theClass, theThing) {
        theThing.setAttribute("class", theClass);
    };

    //Set the orignal video state class on the video
    setVideoClass("originalSize", originalVidContainer);

    //Set the orignal video state class on the placeholder
    setVideoClass("originalSize", placeHolder);

    //animationSpeed Conversion for Timeouts
    animationSpeed = (animationSpeed * 1000);

    //Animation Transitioner Functions
    var originalToPopoutTransitioner = function() {
        if (!poppedOut) {
            setVideoClass("originalDestructionAnimation", animationWrapper);
            //timeouts
            setTimeout(function() {
                setVideoClass("popoutCreationAnimation", animationWrapper);
                setVideoClass("popoutSize", originalVidContainer);
                poppedOut = true;
                setTimeout(function() {
                    //move the video after x timeout
                    setVideoClass("popoutSize", animationWrapper);
                }, animationSpeed);
            }, animationSpeed);
        } else {
            setVideoClass("popoutSize", originalVidContainer);
        }
    };

    var popoutToOriginalTransitioner = function() {
        if (poppedOut) {
            setVideoClass("popoutDestructionAnimation", animationWrapper);
            //timeouts
            setTimeout(function() {
                //move the video after x timeout
                setVideoClass("originalSize", originalVidContainer);
                setVideoClass("originalReconstructionAnimation", animationWrapper);
                poppedOut = false;
                setTimeout(function() {
                    setVideoClass("originalSize", animationWrapper);
                }, animationSpeed);
            }, animationSpeed);
        } else {
            setVideoClass("originalSize", originalVidContainer);
        }
    };

    //Create the Locator Function for the Original Video on the page
    var skynetLocator = function(john) {
        //Locate the video on the page
        var videoLocation = john.getBoundingClientRect();
        //Discover the page's overall dimensions
        var documentLocation = document.body.getBoundingClientRect();
        //Dimensions of the video
        var redeterminedVidHeight = videoLocation.height;
        var redeterminedVidWidth = videoLocation.width;
        //Location of the video
        //Question, Should I add another 8 to the top, or is that unique to my test document?
        var universalLocationTop = Math.abs(documentLocation.top - videoLocation.top);
        var universalLocationBottom = Math.abs(documentLocation.top - videoLocation.bottom);
        var universalLocationLeft = Math.abs(documentLocation.left - videoLocation.left);
        var universalLocationRight = Math.abs(documentLocation.left - videoLocation.right);
        //New object for original video location and dimensions
        var refactoredRect = {
            top: universalLocationTop,
            bottom: universalLocationBottom,
            left: universalLocationLeft,
            right: universalLocationRight,
            height: redeterminedVidHeight,
            width: redeterminedVidWidth
        };
        return refactoredRect;
    };

    //Locate the Original Video's placement on the page
    var locationDimension = skynetLocator(originalVidContainer);

    //Function for setting up whether Video Container is visible
    var screenCheck = function() {
        //Dimensions for the video
        var videoTop = locationDimension.top + (locationDimension.height * percentVideoPassed);
        var videoBottom = locationDimension.bottom - (locationDimension.height * percentVideoPassed);
        var videoLeft = locationDimension.left + (locationDimension.width * percentVideoPassed);
        var videoRight = locationDimension.right - (locationDimension.width * percentVideoPassed);
        //Location of the top left of window
        var currentTop = window.scrollY;
        var currentBottom = currentTop + window.innerHeight;
        var currentLeft = window.scrollX;
        var currentRight = window.scrollX + window.innerWidth;
        //Is the Video Above the Scroll Top
        if (videoTop > currentTop && videoBottom < currentBottom && videoLeft > currentLeft && videoRight < currentRight) {
            return true;
        } else {
            return false;
        }
    };

    //Determine if the size of the screen can accept magic-scroll
    var screenLargeEnough = function() {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        if (windowWidth > (screenSizePopoutWidth * 1.5) && windowHeight > (screenSizePopoutHeight * 1.5)) {
            return true
        } else {
            return false
        }
    };

    //Function for logging into the console to see if everything is working properly
    var magicSystemCheck = function() {
        console.log(locationDimension);
        console.log("Is the video visible: " + screenCheck());
        console.log("Is the screen large enough: " + screenLargeEnough());
    };

    //Function for determining if viewer has scrolled past a certain point
    var magicCheck = function() {
        console.log("The original video zone is visible: " + screenCheck());
        if (!screenCheck() && video.state() === "playing" && screenLargeEnough()) {
            //Set Size for permanent-ish Popout Position div
            originalToPopoutTransitioner();
        } else if (!screenCheck() && poppedOut && video.state() === "paused" && screenLargeEnough()) {
            //Don't disappear if the video is paused
            setVideoClass("popoutSize", originalVidContainer);
            poppedOut = true;
        } else if (!screenLargeEnough() && !screenCheck()) {
            //Set Size for permanent-ish Original Position div
            popoutToOriginalTransitioner();
            video.pause();
        } else {
            //Set Size for permanent-ish Original Position div
            popoutToOriginalTransitioner();
        }
    };

    //Run the final function when the visitor scrolls or resizes the window
    window.onscroll = function() {
        magicSystemCheck();
        magicCheck();
    };
    window.onresize = function() {
        //Probably should Add Animation Controllers here
        magicSystemCheck();
        magicCheck();
    };
});
