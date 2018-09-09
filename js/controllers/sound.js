(function(app) {
  'use strict';

  var howler = require('howler');

  var Sound = function() {
    this.howl = null;
    this.muted = true;
  };

  Sound.prototype.create = function(name) {
    return new howler.Howl({
      src: ['sounds/' + name + '.mp3'],
      loop: true,
      mute: this.muted,
    });
  };

  Sound.prototype.fadeOut = function() {
    return new Promise(function(resolve) {
      if (!this.howl) {
        return resolve();
      }
      this.howl.once('fade', function(){
        resolve();
      });
      this.howl.fade(1, 0, 1000);
    }.bind(this));
  };

  Sound.prototype.change = function(name) {
    var howl = this.howl;
    return this.fadeOut().then(function() {
      if (howl !== this.howl) {
        throw new Error('Failed to change sound to "' + name + '"');
      }
      if (this.howl) {
        this.howl.unload();
      }
      if (!name) {
        this.howl = null;
        return;
      }
      this.howl = this.create(name);
      this.howl.play();
    }.bind(this));
  };

  Sound.prototype.mute = function() {
    this.muted = true;
    if (this.howl) {
      this.howl.mute(true);
    }
  };

  Sound.prototype.unmute = function() {
    this.muted = false;
    if (this.howl) {
      this.howl.mute(false);
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sound;
  } else {
    app.Sound = Sound;
  }
})(this.app || (this.app = {}));
