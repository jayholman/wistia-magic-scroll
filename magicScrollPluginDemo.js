Wistia.plugin("magic-scroll", function(video, options) {
    //Current options Available to Change
    // video hashed_id -required
    // containingDivId: String - required
    // originalHeight: Integer
    // originalWidth: Integer
    // popoutHeight: Integer
    // popoutWidth: Integer
    // popoutLocation: String
    // responsive: Boolean
    // src: "/experiments/magicScrollPlugin.js" - required
    //Calculate the Aspect Ratio
    var aspectRatio = video.aspect();
    //Variables to Change
    //Original Sizing for the Video
    if (options.responsive) {
        //Original height responsive
        var originalHeight = "100%";
        //Original width responsive
        var originalWidth = "100%";
    } else if (options.originalWidth && !options.originalHeight) {
        var originalWidth = options.originalWidth;
        var originalHeight = options.originalWidth / aspectRatio;
    } else if (!options.originalWidth && options.originalHeight) {
        var originalHeight = options.originalHeight;
        var originalWidth = options.originalHeight * aspectRatio;
    } else if (options.originalWidth && options.originalHeight) {
        //Original height static
        var originalHeight = options.originalHeight;
        //Original width static
        var originalWidth = options.originalWidth;
    } else {
        var originalHeight = video.height();
        var originalWidth = video.width();
    }
    //Popout Sizing for the Video
    if (options.popoutHeight && options.popoutWidth) {
        //Popout height
        var popoutHeight = options.popoutHeight;
        //Popout width
        var popoutWidth = options.popoutWidth;
    } else if (options.popoutWidth && !options.popoutHeight) {
        var popoutWidth = options.popoutlWidth;
        var popoutHeight = options.popoutWidth / aspectRatio;
    } else if (!options.originalWidth && options.originalHeight) {
        var popoutHeight = options.popoutHeight;
        var popoutWidth = options.popoutHeight * aspectRatio;
    } else {
        //Backup Default
        var popoutHeight = 224;
        var popoutWidth = 400;
    }

    //Determine where to put the popout
    var popoutLocDet = 3;
    if (options.popoutLocation === "topLeft") {
        popoutLocDet = 0;
    } else if (options.popoutLocation === "bottomLeft") {
        popoutLocDet = 1;
    } else if (options.popoutLocation === "topRight") {
        popoutLocDet = 2;
    } else {
        popoutLocDet = 3;
    }
    //Variables used in the function
    var poppedOut = false;
    var popoutAnimationCompleted = false;
    var originalAnimationCompleted = true;
    var placeHolderExists = false;
    //Divs to perform the Magic
    var originalVidContainer = document.getElementById(options.containingDivId);

    //Function to Convert to Pixels
    var pixelConverter = function(size) {
        var number = size.toString();
        var pixeled = number + "px";
        return pixeled;
    };
    //Converted Sizes to Pixels
    if (!options.responsive) {
        var originalHeightPixels = pixelConverter(originalHeight);
        var originalWidthPixels = pixelConverter(originalWidth);
    }
    var popoutHeightPixels = pixelConverter(popoutHeight);
    var popoutWidthPixels = pixelConverter(popoutWidth);
    //Create functions to set the size for the original and popout
    var originalSize = function() {
        if (options.responsive) {
            var theHeight = originalHeight;
            var theWidth = originalWidth;
        } else {
            var theHeight = originalHeightPixels;
            var theWidth = originalWidthPixels;
        }
        var originalSizeCss = '.originalSize { height: ' + theHeight + '; width: ' + theWidth + '; position: relative; z-index: 1000;} ';
        return originalSizeCss;
    };
    var popoutSize = function() {
        //Standard Popout sizing
        var popoutSizeCss = '.popoutSize { ' + 'height: ' + popoutHeightPixels + '; width: ' + popoutWidthPixels + '; position: fixed; z-index: 1000; ';
        //Location for the Popout
        if (popoutLocDet === 0) {
            popoutSizeCss += 'top: 0; left: 0;} '
        } else if (popoutLocDet === 1) {
            popoutSizeCss += 'bottom: 0; left: 0;} '
        } else if (popoutLocDet === 2) {
            popoutSizeCss += 'top: 0; right: 0;} '
        } else if (popoutLocDet === 3) {
            popoutSizeCss += 'bottom: 0; right: 0;} '
        }
        return popoutSizeCss;
    };
    //Create CSS styling for the two Classes and two Animation States
    var head = document.getElementsByTagName('head')[0];
    var styleNode = document.createElement("style");
    styleNode.setAttribute("id", "magic-scroll-plugin-css");
    var magicStyles = document.createTextNode(originalSize() + popoutSize());
    styleNode.appendChild(magicStyles);
    head.appendChild(styleNode);
    //Apply Original Size to the Div
    var sizeSet = function(theDiv) {
        originalVidContainer.setAttribute("class", theDiv);
    };
    sizeSet("originalSize");
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
    var exterminatePlaceholder = function() {
        var placeHolder = document.getElementById("sweetPlaceHolder");
        var parentDiv = placeHolder.parentElement;
        parentDiv.removeChild(placeHolder);
        placeHolderExists = false;
    };
    //Figure out the video's dimensions on the page and it's location
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
    var locationDimension = skynetLocator(originalVidContainer);

    //Add the animationCSS to the page
    var animationAddition = function() {
        //default original values
        var originalX = locationDimension.left;
        var originalY = locationDimension.top;
        //Isolate Top and Left coordinates for the Window
        currentViewingWindowTop = window.scrollY;
        currentViewingWindowBottom = window.scrollY + window.innerHeight;
        currentViewingWindowLeft = window.scrollX;
        currentViewingWindowRight = window.scrollX + window.innerWidth;
        //Create If/Else Tree for where to send the video to/from (if it's too far in one dimension then, make it 0, otherwise find the difference)
        //Determine if the video is above or below the current viewport, if it is, apply 0 to to the Y fixed value
        if (currentViewingWindowTop > locationDimension.top) {
            //video is above the current viewport so the top fixed value is 0
            originalY = 0;
        } else if (currentViewingWindowBottom < locationDimension.bottom) {
            //video is below the current viewport so the bottom fixed value is 0
            originalY = 0;
        } else {
            //video is at the same level as the viewport, fixed level needs to be calculated. scrollY is 0, so difference is the fixed value
            originalY = currentViewingWindowTop - locationDimension.top;
        }
        //Determine if the video is left or right of the current viewport, if it is, apply 0 to the X fixed value
        if (currentViewingWindowRight < locationDimension.right) {
            //video is right of the current viewport so the right fixed value is 0
            originalX = 0;
        } else if (currentViewingWindowLeft > locationDimension.left) {
            //video is left of the current viewport so the left fixed value is 0
            originalX = 0;
        } else {
            //video is at the same level as the viewport, fixed level needs to be calculated. scrollX is 0, so difference is the fixed value
            originalX = currentViewingWindowLeft - locationDimension.left;
        }

        //Where is the popout going to be
        if (popoutLocDet === 0) {
            var popoutX = 0;
            var popoutY = 0;
        } else if (popoutLocDet === 1) {
            var popoutX = 0;
            var popoutY = window.innerHeight - popoutHeight;
        } else if (popoutLocDet === 2) {
            var popoutX = window.innerWidth - popoutWidth;
            var popoutY = 0;
        } else if (popoutLocDet === 3) {
            var popoutX = window.innerWidth - popoutWidth;
            var popoutY = window.innerHeight - popoutHeight;
        }

        //Animation Initializer, create variable that triggers once at the beginning. Afterwards, remove the former animation scripts in order to insert new ones
        

        //Create text node with animation CSS and add it to the Head
        var animatedNode = document.createElement("style");
        animatedNode.setAttribute("id", "magic-scroll-plugin-animation-css");
        head.appendChild(animatedNode);
        var magicStyleTag = document.getElementById("magic-scroll-plugin-animation-css");
        //Popout Animation
        var popoutAnimationNode = document.createTextNode(".magicScrollPopoutAnimation { animation-duration: .75s; animation-name: poppingOut; animation-iteration-count: 1; position: fixed; z-index: 1000;} @keyframes poppingOut { 0% { top: " + originalY + "; left: " + originalX + "; height: " + originalAnimationHeight + "px; width: " + originalAnimationWidth + "px;}  100% {  top: " + popoutY + ";  left: " + popoutX + "; height: " + popoutHeightPixels + "; width: " + popoutWidthPixels + ";} }");
        //Original Animation
        var originalAnimationNode = document.createTextNode(".magicScrollOriginalAnimation { animation-duration: .75s; animation-name: poppingBack; animation-iteration-count: 1; position: fixed; z-index: 1000;} @keyframes poppingBack { 0% { top: " + popoutY + "; left: " + popoutX + "; height: " + popoutHeightPixels + "; width: " + popoutWidthPixels + ";}  100% {  top: " + originalY + ";  left: " + originalX + "; height: " + originalAnimationHeight + "px; width: " + originalAnimationWidth + "px;} }");

        magicStyleTag.appendChild(popoutAnimationNode);
        magicStyleTag.appendChild(originalAnimationNode);
    };
    animationAddition();
    //Animation to popout from the original
    var popoutTransitioner = function() {
        if (!popoutAnimationCompleted) {
            sizeSet("magicScrollPopoutAnimation");
            if (!placeHolderExists) {
                createPlaceholder();
            }
            setTimeout(function() {
                sizeSet("popoutSize");
                popoutAnimationCompleted = true;
            }, 750);
        }
    };
    //Animation from popout back to orignal
    var originalTransitioner = function() {
        if (popoutAnimationCompleted) {
            sizeSet("magicScrollOriginalAnimation");
            setTimeout(function() {
                if (placeHolderExists) {
                    exterminatePlaceholder();
                }
                sizeSet("originalSize");
                popoutAnimationCompleted = false;
            }, 750);
        }
    };
    //Function for setting up whether Video Container is visible
    var screenCheck = function() {
        //Dimensions for the video
        var videoTop = locationDimension.top + (locationDimension.height * .6);
        var videoBottom = locationDimension.bottom - (locationDimension.height * .6);
        var videoLeft = locationDimension.left + (locationDimension.width * .6);
        var videoRight = locationDimension.right - (locationDimension.width * .6);
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
    console.log(locationDimension);
    console.log(screenCheck());
    //Determine if the size of the screen can accept magic-scroll
    var screenLargeEnough = function() {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        if (windowWidth > (popoutWidth * 1.5) && windowHeight > (popoutHeight * 1.5)) {
            return true
        } else {
            return false
        }
    };
    console.log(screenLargeEnough());
    //Function for determining if viewer has scrolled past a certain point
    var magicCheck = function(vidoHash) {
        console.log("The original video zone is visible: " + screenCheck());
        if (!screenCheck() && video.state() === "playing" && screenLargeEnough()) {
            //Set Size for permanent-ish Popout Position div
            popoutTransitioner();
            poppedOut = true;
        } else if (!screenCheck() && poppedOut && video.state() === "paused" && screenLargeEnough()) {
            //Don't disappear if the video is paused
            sizeSet("popoutSize");
            poppedOut = true;
        } else if (!screenLargeEnough() && !screenCheck()) {
            //Set Size for permanent-ish Original Position div
            originalTransitioner();
            poppedOut = false;
            video.pause();
        } else {
            //Set Size for permanent-ish Original Position div
            originalTransitioner();
            poppedOut = false;
        }
    };
    //Run the final function with inputs from the video
    //Only run it on larg enough screen
    window.onscroll = function() {
        magicCheck(video);
    };
    //Also run the function if the video is resize
    window.onresize = function() {
        //Probably should Add Animation Controllers here
        magicCheck(video);
        var animationStyling = document.getElementById("magic-scroll-plugin-animation-css");
        head.removeChild(animationStyling);
        animationAddition();
    };
});
