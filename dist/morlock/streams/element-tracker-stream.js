define("morlock/streams/element-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {Stream} scrollStream A stream emitting scroll events.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(element, scrollStream, resizeStream) {
      var trackerStream = Stream.create();
      var viewportHeight;
      var isVisible = false;

      function updateViewport() {
        viewportHeight = getViewportHeight();
        didUpdateViewport();
      }
      
      function didUpdateViewport() {
        var r = getRect(element);
        var inY = !!r && r.bottom >= 0 && r.top <= viewportHeight;

        if (isVisible && !inY) {
          isVisible = false;
          Stream.emit(trackerStream, 'exit');
        } else if (!isVisible && inY) {
          isVisible = true;
          Stream.emit(trackerStream, 'enter');
        }
      }

      Stream.onValue(scrollStream, didUpdateViewport);
      Stream.onValue(resizeStream, updateViewport);
      updateViewport();

      return trackerStream;
    }

    __exports__.create = create;
  });