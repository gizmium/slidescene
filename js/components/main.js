(function(app) {
  'use strict';

  var howler = require('howler');
  var jCore = require('jcore');
  var dom = app.dom || require('../dom.js');
  var Content = app.Content || require('./content.js');
  var Controls = app.Controls || require('./controls.js');

  var Main = jCore.Component.inherits(function() {
    this.sound = new Main.Sound();
    this.content = new Content({ element: this.findElement('.content') });
    this.controls = new Controls({ element: this.findElement('.controls') });
  });

  Main.prototype.oninit = function() {
    this.content.on('medal', this.onmedal.bind(this));
    this.content.on('sound', this.onsound.bind(this));
    this.content.on('panels', this.onpanels.bind(this));
    this.controls.on('mute', this.onmute.bind(this));
    this.controls.on('unmute', this.onunmute.bind(this));
    this.content.load().then(function() {
      dom.on(this.element(), 'keydown', this.onkeydown.bind(this));
      dom.on(this.element(), 'wheel', this.onwheel.bind(this));
    }.bind(this));
  };

  Main.prototype.onkeydown = (function() {
    var map = {
      37: 'moveLeft',
      38: 'moveUp',
      39: 'moveRight',
      40: 'moveDown',
    };
    return function(event) {
      var key = map[dom.which(event)];
      if (key) {
        dom.cancel(event);
        this.content[key]();
      }
    };
  })();

  Main.prototype.onwheel = (function() {
    var context = {};
    var dy = 0;
    var isStart = false;
    var timeoutID = 0;
    return function(event) {
      if (!isStart) {
        this.content.draggable.onstart(this.content, 0, -1, event, context);
        isStart = true;
      }
      dy -= dom.deltaY(event);
      this.content.draggable.onmove(this.content, 0, dy, event, context);
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      timeoutID = setTimeout(function() {
        this.content.draggable.onend(this.content, 0, dy, event, context);
        dy = 0;
        isStart = false;
        timeoutID = 0;
      }.bind(this), 100);
    };
  })();

  Main.prototype.onmedal = function(medal) {
    this.controls.loadMedal(medal).then(function() {
      dom.save('medal', medal);
    });
  };

  Main.prototype.onsound = function(sound) {
    this.sound.load(sound).then(function() {
      this.sound.play();
    }.bind(this));
  };

  Main.prototype.onpanels = function(panels) {
    dom.save('panels', panels.map(function(panel) {
      return {
        top: panel.top(),
        previous: panels.indexOf(panel.previous),
        visible: panel.visible(),
        url: panel.url(),
        medal: panel.medal(),
      };
    }));
  };

  Main.prototype.onmute = function() {
    this.sound.mute();
  };

  Main.prototype.onunmute = function() {
    this.sound.unmute();
  };

  Main.Sound = (function() {
    var Sound = function() {
      this.name = '';
      this.howl = null;
      this.muted = true;
    };

    Sound.prototype.load = function(name) {
      this.name = name;
      return this.fadeOut().then(function() {
        if (!name) {
          return Promise.resolve();
        }
        if (name !== this.name) {
          return Promise.reject();
        }
        this.howl = new howler.Howl({
          src: ['sounds/' + name + '.mp3'],
          loop: true,
          mute: this.muted,
        });
      }.bind(this));
    };

    Sound.prototype.play = function() {
      if (this.howl && !this.howl.playing()) {
        this.howl.play();
      }
    };

    Sound.prototype.fadeOut = function() {
      if (!this.howl) {
        return Promise.resolve();
      }
      return new Promise(function(resolve, reject) {
        var howl = this.howl;
        howl.once('fade', function(){
          if (howl !== this.howl) {
            return reject();
          }
          howl.unload();
          this.howl = null;
          resolve();
        }.bind(this));
        howl.fade(1, 0, 1000);
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

    return Sound;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Main;
  } else {
    app.Main = Main;
  }
})(this.app || (this.app = {}));
