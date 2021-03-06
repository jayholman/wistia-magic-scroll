Wistia.plugin("magic-scroll", function(video, options) {
    //Current options Available to Change:
    // video hashed_id -required
    // containingDivId: String - required
    // src: "/experiments/magicScrollPlugin.js" - required
    // originalHeight: Integer
    // originalWidth: Integer
    // popoutHeight: Integer
    // popoutWidth: Integer
    // popoutLocation: String
    // popoutOffsetX: Integer
    // popoutOffsetY: Integer
    // responsive: Boolean
    // transitionSpeed: Decimal that equates to Percentage of Video Height;

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
    var transitionSpeed = 1;
    //What exists and doesn't exist
    var poppedOut = false;
    var placeHolderExists = false;
    //How to grab the video container
    var originalVidContainer = document.getElementById(options.containingDivId);

    //Do we want to alter transitionSpeed
    if (options.transitionSpeed){
      transitionSpeed = options.transitionSpeed;
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
    if (options.popoutOffsetY){
      popoutOffsetY = options.popoutOffsetY;
    }
    if (options.popoutOffsetX){
      popoutOffsetX = options.popoutOffsetX;
    }

    //Popout Locations Calculations
    if (options.popoutLocation === "topLeft") {
        popoutLocation = 0;
        popoutLocationY = "top: "+ popoutOffsetY +";";
        popoutLocationX = "left: "+ popoutOffsetX +";";
    } else if (options.popoutLocation === "bottomLeft") {
        popoutLocation = 1;
        popoutLocationY = "bottom: "+ popoutOffsetY +";";
        popoutLocationX = "left: "+ popoutOffsetX +";";
    } else if (options.popoutLocation === "topRight") {
        popoutLocation = 2;
        popoutLocationY = "top: "+ popoutOffsetY +";";
        popoutLocationX = "right: "+ popoutOffsetX +";";
    } else {
        popoutLocation = 3;
        popoutLocationY = "bottom: "+ popoutOffsetY +";";
        popoutLocationX = "right: "+ popoutOffsetX +";";
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
        var videoTop = locationDimension.top + (locationDimension.height * transitionSpeed);
        var videoBottom = locationDimension.bottom - (locationDimension.height * transitionSpeed);
        var videoLeft = locationDimension.left + (locationDimension.width * transitionSpeed);
        var videoRight = locationDimension.right - (locationDimension.width * transitionSpeed);
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
        console.log("Placeholder Exists: " + placeHolderExists);
    };

    //Function for determining if viewer has scrolled past a certain point
    var magicCheck = function() {
        console.log("The original video zone is visible: " + screenCheck());
        if (!screenCheck() && video.state() === "playing" && screenLargeEnough()) {
            //Set Size for permanent-ish Popout Position div
            setVideoClass("popoutSize");
            poppedOut = true;
        } else if (!screenCheck() && poppedOut && video.state() === "paused" && screenLargeEnough()) {
            //Don't disappear if the video is paused
            setVideoClass("popoutSize");
            poppedOut = true;
        } else if (!screenLargeEnough() && !screenCheck()) {
            //Set Size for permanent-ish Original Position div
            setVideoClass("originalSize");
            poppedOut = false;
            video.pause();
        } else {
            //Set Size for permanent-ish Original Position div
            setVideoClass("originalSize");
            poppedOut = false;
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
