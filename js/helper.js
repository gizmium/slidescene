(function(app) {
  'use strict';

  var helper = {};

  helper.clamp = function(number, lower, upper) {
    return Math.min(Math.max(number, lower), upper);
  };

  helper.remove = function(array, item) {
    var index = array.indexOf(item);
    if (index !== -1) {
      array.splice(index, 1);
    }
  };

  helper.find = function(array, callback) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (callback(array[i], i, array)) {
        return array[i];
      }
    }
    return null;
  };

  helper.min = function(array, callback) {
    var ret = null;
    var min = Infinity;
    for (var i = 0, len = array.length; i < len; i++) {
      var v = callback(array[i], i, array);
      if (v < min) {
        ret = array[i];
        min = v;
      }
    }
    return ret;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = helper;
  } else {
    app.helper = helper;
  }
})(this.app || (this.app = {}));
