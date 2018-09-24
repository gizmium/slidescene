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

  Sound.prototype.unlock = function(done) {
    var self = howler.Howler;
    if (!self.ctx) {
      return;
    }
    if (!self._scratchBuffer) {
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);
    }
    self._autoResume();
    var source = self.ctx.createBufferSource();
    source.buffer = self._scratchBuffer;
    source.connect(self.ctx.destination);
    if (typeof source.start === 'undefined') {
      source.noteOn(0);
    } else {
      source.start(0);
    }
    if (typeof self.ctx.resume === 'function') {
      self.ctx.resume();
    }
    source.onended = function() {
      source.disconnect(0);
      done();
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sound;
  } else {
    app.Sound = Sound;
  }
})(this.app || (this.app = {}));
