(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var Panel = app.Panel || require('./panel.js');

  var Content = jCore.Component.inherits(function() {
    this.movePanelsWithAnimation = this.prop(0);
    this.panels = [];
    this.draggable = new Content.Draggable(this);
  });

  Content.prototype.loadPanel = function(props) {
    var panel = new Panel(props);
    panel.parentElement(this.element());
    panel.redraw();
    this.panels.push(panel);
    return panel.load();
  };

  Content.prototype.removePanel = function(panel) {
    panel.parentElement(null);
    helper.remove(this.panels, panel);
  };

  Content.prototype.movePanels = function(dy) {
    if (this.panels.length === 0) {
      return;
    }
    var t = this.panels.reduce(function(t, panel) {
      return Math.max(t, panel.marginTop() / 2 - panel.top());
    }, Number.MIN_VALUE);
    if (dy > t) {
      dy = t;
    }
    this.panels.forEach(function(panel) {
      panel.top(panel.top() + dy);
    });
  };

  Content.prototype.oninit = function() {
    this.draggable.enable();
  };

  Content.prototype.onredraw = function() {
    this.redrawBy('movePanelsWithAnimation', function(rest) {
      if (this.panels.length === 0 || rest === 0) {
        return;
      }
      var dy = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
      this.panels.forEach(function(panel) {
        panel.top(panel.top() + dy);
        panel.redraw();
      });
      setTimeout(function() {
        this.movePanelsWithAnimation(rest - dy);
      }.bind(this));
    });
  };

  Content.Draggable = (function() {
    var Draggable = jCore.Draggable.inherits();

    Draggable.prototype.onstart = function(content, x, y, event, context) {
      context.my = 0;
      context.dy = 0;
      content.movePanelsWithAnimation(0);
    };

    Draggable.prototype.onmove = function(content, dx, dy, event, context) {
      var my = dy - context.dy;
      if (my === 0) {
        return;
      }
      context.my = my;
      context.dy = dy;
      content.movePanels(my);
    };

    Draggable.prototype.onend = function(content, dx, dy, event, context) {
      if (content.panels.length === 0) {
        return;
      }
      // find that a part of the panel located on the out of the window
      var panel = helper.findLast(content.panels, function(panel) {
        var dt = panel.marginTop() / 2 - panel.top();
        var db = dt - panel.marginTop() - panel.height();
        return (dt * db < 0);
      });
      if (!panel) {
        var mindt = content.panels.reduce(function(t, panel) {
          return Math.min(t, panel.marginTop() / 2 - panel.top());
        }, Number.MAX_VALUE);
        if (mindt > 0) {
          // all panels are located on the out of the window
          content.movePanelsWithAnimation(mindt);
        }
        return;
      }
      var hasNext = content.panels.some(function(p) {
        return (p.top() + p.height() > panel.top() + panel.height());
      });
      var dt = panel.marginTop() / 2 - panel.top();
      var d;
      if (hasNext) {
        var db = dt - panel.marginTop() - panel.height();
        if (Math.abs(dt) >= 24 && Math.abs(db) >= 24) {
          d = (context.my > 0 ? dt : db);
        } else {
          d = (Math.abs(dt) < Math.abs(db) ? dt : db);
        }
      } else {
        // leave the last panel
        d = dt;
      }
      content.movePanelsWithAnimation(d);
    };

    return Draggable;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Content;
  } else {
    app.Content = Content;
  }
})(this.app || (this.app = {}));
