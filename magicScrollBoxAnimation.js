Wistia.plugin("magic-scroll", function(video, options) {
    //Current options Available to Change:
    // video hashed_id -required
    // containingDivId: String - required
    // originalHeight: Integer
    // originalWidth: Integer
    // popoutHeight: Integer
    // popoutWidth: Integer
    // popoutLocation: String
    // responsive: Boolean
    // src: "/experiments/magicScrollPlugin.js" - required

    //Early Defined Variables
    var aspectRatio = video.aspect();
    //Original Sizing
    var originalHeight = 540;
    var originalWidth = 960;
    //Popout Sizing and Location
    var popoutHeight = 224;
    var popoutWidth = 400;
    var popoutLocation = 3;
    var popoutLocationY = 'bottom: 0;';
    var popoutLocationX = 'right: 0;'
    var screenSizePopoutHeight = popoutHeight;
    var screenSizePopoutWidth = popoutWidth;
    //What exists and doesn't exist
    var poppedOut = false;
    var placeHolderExists = false;
    //How to grab the video container
    var originalVidContainer = document.getElementById(options.containingDivId);

    //Animation Information
    var numPopHeight = popoutHeight;
    var numPopWidth = popoutWidth;
    var animationDivExists = false;
    //Grid Number
    var location = 1;
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

    //Popout Locations Calculations
    if (options.popoutLocation === "topLeft") {
        popoutLocation = 0;
        popoutLocationY = "top: 0;"
        popoutLocationX = "left: 0;"
    } else if (options.popoutLocation === "bottomLeft") {
        popoutLocation = 1;
        popoutLocationY = "bottom: 0;"
        popoutLocationX = "left: 0;"
    } else if (options.popoutLocation === "topRight") {
        popoutLocation = 2;
        popoutLocationY = "top: 0;"
        popoutLocationX = "right: 0;"
    }

    //Determine class sizes for the two video container states
    var originalSize = '.originalSize { height: ' + originalHeight + '; width: ' + originalWidth + '; position: relative; } ';

    var popoutSize = '.popoutSize { ' + 'height: ' + popoutHeight + '; width: ' + popoutWidth + '; position: fixed; z-index: 1000; ' + popoutLocationY + ' ' + popoutLocationX + '}';

    //Create CSS styling for the two Classes in the head of the document
    var head = document.getElementsByTagName('head')[0];
    var styleNode = document.createElement("style");
    styleNode.setAttribute("id", "magic-scroll-plugin-css");
    var magicStyles = document.createTextNode(originalSize + popoutSize);
    styleNode.appendChild(magicStyles);
    head.appendChild(styleNode);

    //Function for applying a class to the video container
    var setVideoClass = function(theClass) {
        originalVidContainer.setAttribute("class", theClass);
    };

    //Set the orignal video state class on the video
    setVideoClass("originalSize");

    //Function to create placeholder div
    var createPlaceholder = function() {
        var placeHolder = document.createElement("div");
        placeHolder.setAttribute("id", "sweetPlaceHolder");
        placeHolder.setAttribute("class", "originalSize")
        var parentDiv = originalVidContainer.parentElement;
        parentDiv.insertBefore(placeHolder, originalVidContainer);
        placeHolderExists = true;
    };

    //Function to remove placeholder div
    var destroyPlaceholder = function() {
        var placeHolder = document.getElementById("sweetPlaceHolder");
        var parentDiv = placeHolder.parentElement;
        parentDiv.removeChild(placeHolder);
        placeHolderExists = false;
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
        var videoTop = locationDimension.top + (locationDimension.height);
        var videoBottom = locationDimension.bottom - (locationDimension.height);
        var videoLeft = locationDimension.left + (locationDimension.width);
        var videoRight = locationDimension.right - (locationDimension.width);
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

    //Giant Animation Block

    //Animation Addition Function
    var animationCreation = function(origLocX, origLocY, horus) {
        //Set up the Variables
        var originalY = origLocY;
        var originalX = origLocX;
        var top = 0;
        var left = 0;
        var bottom = window.innerHeight - numPopHeight;
        var right = window.innerWidth - numPopWidth;
        var popoutTop = bottom;
        var popoutLeft = right;
        var animationDecision = horus;
        if (popoutLocation === 0) {
            popoutTop = top;
            popoutLeft = left;
        } else if (popoutLocation === 1) {
            popoutLeft = left;
        } else if (popoutLocation === 2) {
            popoutTop = top;
        }

        //Set up the style
        var popoutAnimatedNode = document.createElement("style");
        popoutAnimatedNode.setAttribute("id", "popoutAnimationCss");
        head.appendChild(popoutAnimatedNode);
        var popoutStyleTag = document.getElementById("popoutAnimationCss");

        var originalAnimatedNode = document.createElement("style");
        originalAnimatedNode.setAttribute("id", "originalAnimationCss");
        head.appendChild(originalAnimatedNode);
        var originalStyleTag = document.getElementById("originalAnimationCss");

        //Popout Animation
        var popoutAnimationNode = document.createTextNode(".magicScrollPopoutAnimation { animation-duration: .75s; animation-name: poppingOut; animation-iteration-count: 1; position: fixed; z-index: 1000;} @keyframes poppingOut { 0% { top: " + originalY + "; left: " + originalX + "; height: " + locationDimension.height + "px; width: " + locationDimension.width + "px;}  100% { top: " + popoutTop + "; left: " + popoutLeft + "; height: " + popoutHeight + "; width: " + popoutWidth + ";} }");

        //Original Animation
        var originalAnimationNode = document.createTextNode(".magicScrollOriginalAnimation { animation-duration: .75s; animation-name: poppingBack; animation-iteration-count: 1; position: fixed; z-index: 1000;} @keyframes poppingBack { 0% { top: " + popoutTop + "; left: " + popoutLeft + "; height: " + popoutHeight + "; width: " + popoutWidth + ";}  100% {  top: " + originalY + ";  left: " + originalX + "; height: " + locationDimension.height + "px; width: " + locationDimension.width + "px;} }");

        if (animationDecision === "initial" || animationDecision === "popout") {
            popoutStyleTag.appendChild(popoutAnimationNode);
        }
        if (animationDecision === "initial" || animationDecision === "original") {
            originalStyleTag.appendChild(originalAnimationNode);
        }
    };

    animationCreation(locationDimension.left, locationDimension.top, "initial");

    //Function to remove placeholder div
    var destroyAnimation = function(animationNode) {
        var animationStyle = document.getElementById(animationNode);
        if (animationStyle) {
            var parentDiv = animationStyle.parentElement;
            parentDiv.removeChild(animationStyle);
        }
    };

    //Calculate User position within the light grid
    var animationInitializer = function() {

        //Current Scroll Top Location
        var currentTop = window.scrollY;
        //Top Line
        var topLine = locationDimension.top - 50;
        //Bottom Line
        var bottomLine = locationDimension.bottom + 50;
        //Inner Top Line
        var innerTopLine = locationDimension.top + 10;
        //Inner Bottom Line
        var innerBottomLine = locationDimension.bottom - 10;

        if (location != 1 && currentTop < topLine) {
            //Downward Return Animation
            location = 1;
            destroyAnimation(originalAnimationCss);
            animationCreation((skynetLocator(originalVidContainer).left), window.innerHeight, "original");
            return 1;
        } else if (location != 2 && currentTop > bottomLine) {
            //Upward Return Animation
            location = 2;
            destroyAnimation(originalAnimationCss);
            animationCreation((skynetLocator(originalVidContainer).left), (0 - locationDimension.height), "original");
            return 2;
        } else if (location != 3 && currentTop > locationDimension.top && currentTop < innerTopLine) {
            //Upper Popout Animation
            location = 3;
            destroyAnimation(popoutAnimationCss);
            animationCreation((skynetLocator(originalVidContainer).left), (skynetLocator(originalVidContainer).top), "popout");
            return 3;
        } else if (location != 4 && currentTop < locationDimension.bottom && currentTop > innerBottomLine) {
            //Lower Popout Animation
            location = 4;
            destroyAnimation(popoutAnimationCss);
            animationCreation((skynetLocator(originalVidContainer).left), (skynetLocator(originalVidContainer).top), "popout");
            return 4;
        }
    };

    var animationCheck = function() {
        console.log("Current Grid Location: " + location);
    };

    //Transitioners
    var createAnimationDiv = function(origOrPop) {
        var animationDiv = document.createElement("div");
        animationDiv.setAttribute("id", "animationDiv");
        animationDiv.setAttribute("class", origOrPop);
        animationDiv.setAttribute("style", "border: 2px solid dodgerblue; z-index: 1001;");
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(animationDiv);
        animationDivExists = true;
    };

    //Function to remove placeholder div
    var destroyAnimationDiv = function() {
        if (animationDivExists) {
            var animationDiv = document.getElementById("animationDiv");
            var parentDiv = animationDiv.parentElement;
            parentDiv.removeChild(animationDiv);
            animationDivExists = false;
        }
    };
    //Original Transitioner
    var originalTransitioner = function() {
        if (!animationDivExists) {
            createAnimationDiv("magicScrollPopoutAnimation");
        }
        //timeout
        setTimeout(function() {
            //move the video after x timeout
            setVideoClass("popoutSize");
            poppedOut = true;
            //delete the animationDiv
            destroyAnimationDiv();
        }, 750);
    };

    //Popout Transitioner
    var popoutTransitioner = function() {
        if (!animationDivExists) {
            createAnimationDiv("magicScrollOriginalAnimation");
        }
        //timeout
        setTimeout(function() {
            //move the video after x timeout
            setVideoClass("originalSize");
            poppedOut = false;
            //delete the animationDiv
            destroyAnimationDiv();
        }, 750);
    };

    //Function for logging into the console to see if everything is working properly
    var magicSystemCheck = function() {
        console.log(locationDimension);
        console.log("Is the video visible: " + screenCheck());
        console.log("Is the screen large enough: " + screenLargeEnough());
        console.log("Placeholder Exists: " + placeHolderExists);
    };

    //Function for determining if viewer has scrolled past a certain point
    var magicCheck = function() {
        console.log("The original video zone is visible: " + screenCheck());
        if (!screenCheck() && video.state() === "playing" && screenLargeEnough()) {
            //Set Size for permanent-ish Popout Position div
            if (!poppedOut) {
                originalTransitioner();
            } else {
                setVideoClass("popoutSize");
                poppedOut = true;
            }
        } else if (!screenCheck() && poppedOut && video.state() === "paused" && screenLargeEnough()) {
            //Don't disappear if the video is paused
            setVideoClass("popoutSize");
            poppedOut = true;
        } else if (!screenLargeEnough() && !screenCheck()) {
            //Set Size for permanent-ish Original Position div
            if (poppedOut) {
                popoutTransitioner();
                video.pause();
            } else {
                setVideoClass("originalSize");
                poppedOut = false;
                video.pause();
            }
        } else {
            //Set Size for permanent-ish Original Position div
            if (poppedOut) {
                popoutTransitioner();
            } else {
                setVideoClass("originalSize");
                poppedOut = false;
            }
        }
    };

    //Run the final function when the visitor scrolls or resizes the window
    window.onscroll = function() {
        // magicSystemCheck();
        magicCheck();
        animationInitializer();
        animationCheck();
    };
    window.onresize = function() {
        //Probably should Add Animation Controllers here
        // magicSystemCheck();
        magicCheck();
        animationInitializer();
        animationCheck();
    };
});
