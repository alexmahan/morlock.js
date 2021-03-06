import { partial, equals } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";
module ElementTrackerStream from "morlock/streams/element-tracker-stream";
module ScrollTrackerStream from "morlock/streams/scroll-tracker-stream";

/**
 * Provides a familiar OO-style API for tracking scroll events.
 * @constructor
 * @param {Object=} options The options passed to the scroll tracker.
 * @return {Object} The API with a `on` function to attach scrollEnd
 *   callbacks and an `observeElement` function to detect when elements
 *   enter and exist the viewport.
 */
function ScrollController(options) {
  if (!(this instanceof ScrollController)) {
    return new ScrollController(options);
  }

  var scrollEndStream = ScrollStream.create(options);

  this.on = function(name, cb) {
    if ('scrollEnd' === name) {
      Stream.onValue(scrollEndStream, cb);
    }
  };

  var resizeStream = ResizeStream.create();

  this.observeElement = function observeElement(elem) {
    var trackerStream = ElementTrackerStream.create(elem, scrollEndStream, resizeStream);

    return {
      on: function on(name, cb) {
        Stream.onValue(Stream.filter(partial(equals, name), trackerStream), cb);
      }
    };
  };
}

ScrollController.observeScrollPosition = function observeScrollPosition(scrollY, options) {
  var stream = ScrollTrackerStream.create(scrollY);

  return {
    on: function(/* name, cb */) {
      var name = 'both';
      var cb;

      if (arguments.length === 1) {
        cb = arguments[0];
      } else {
        name = arguments[0];
        cb = arguments[1];
      }

      var filteredStream;
      if (name === 'both') {
        filteredStream = stream;
      } else {
        filteredStream = Stream.filter(stream, partial(equals, name));
      }

      Stream.onValue(cb);

      return this;
    }
  };
};

export default = ScrollController;
