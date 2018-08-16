(function(app) {
  'use strict';

  var jCore = require('jcore');
  var helper = app.helper || require('../helper.js');
  var dom = app.dom || require('../dom.js');
  var Panel = app.Panel || require('./panel.js');

  var Content = jCore.Component.inherits(function() {
    this.movePanelsWithAnimation = this.prop(0);
    this.panels = [];
    this.draggable = new Content.Draggable(this);
  });

  Content.prototype.hasNextPanel = function(panel) {
    return this.panels.some(function(next) {
      return (next.bottom() > panel.bottom());
    });
  };

  Content.prototype.panelFromTop = function(top) {
    return helper.find(this.panels, function(panel) {
      return (panel.top() <= top && panel.bottom() >= top);
    });
  };

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
    var minTop = this.panels.reduce(function(top, panel) {
      return Math.min(top, panel.top());
    }, Number.MAX_VALUE);
    if (minTop + dy > 0) {
      // don't show an area above the top panel
      dy = -minTop;
    }
    if (dy === 0) {
      return;
    }
    this.panels.forEach(function(panel) {
      panel.top(panel.top() + dy);
    });
  };

  Content.prototype.moveUp = function() {
    var panel = this.panelFromTop(0);
    if (!panel) {
      return;
    }
    this.movePanelsWithAnimation(-panel.top());
  };

  Content.prototype.moveDown = function() {
    var panel = this.panelFromTop(0);
    if (!panel) {
      return;
    }
    if (this.hasNextPanel(panel)) {
      this.movePanelsWithAnimation(-panel.bottom());
    }
  };

  Content.prototype.moveLeft = function() {
    var panel = this.panelFromTop(0);
    if (!panel) {
      return;
    }
    panel.scrollToLeft();
  };

  Content.prototype.moveRight = function() {
    var panel = this.panelFromTop(0);
    if (!panel) {
      return;
    }
    panel.scrollToRight();
  };

  Content.prototype.oninit = function() {
    this.draggable.enable();
  };

  Content.prototype.onredraw = function() {
    this.redrawBy('movePanelsWithAnimation', function(rest) {
      if (this.panels.length === 0) {
        return;
      }
      if (rest === 0) {
        setTimeout(function() {
          this.onanimationend();
        }.bind(this), 0);
        return;
      }
      var dy = (rest > 0 ? 1 : -1) * Math.min(Math.abs(rest), 24);
      this.panels.forEach(function(panel) {
        panel.top(panel.top() + dy);
        panel.redraw();
      });
      setTimeout(function() {
        this.movePanelsWithAnimation(rest - dy);
      }.bind(this), 0);
    });
  };

  Content.prototype.onanimationend = function() {
    // remove panels located on the out of the window
    this.panels.slice().forEach(function(panel) {
      if (panel.bottom() <= 0) {
        this.removePanel(panel);
      }
    }.bind(this));
  };

  Content.Draggable = (function() {
    var Draggable = jCore.Draggable.inherits();

    Draggable.prototype.onstart = function(content, x, y, event, context) {
      dom.cancel(event);
      context.dy = 0;
      context.ddy = 0;
      context.dx = 0;
      context.ddx = 0;
      context.lockY = false;
      context.lockX = false;
      context.panel = content.panelFromTop(y);
      content.movePanelsWithAnimation(0);
      if (context.panel) {
        context.panel.scrollWithAnimation(0);
      }
    };

    Draggable.prototype.onmove = function(content, dx, dy, event, context) {
      if (!context.lockY && !context.lockX) {
        context.lockY = (Math.abs(dy) >= 24);
      }
      if (!context.lockY && !context.lockX) {
        context.lockX = (Math.abs(dx) >= 24);
      }
      if (!context.lockX) {
        this.onmovey(content, dx, dy, event, context);
      }
      if (!context.lockY) {
        this.onmovex(content, dx, dy, event, context);
      }
    };

    Draggable.prototype.onmovey = function(content, dx, dy, event, context) {
      var ddy = dy - context.dy;
      if (ddy === 0) {
        return;
      }
      context.dy = dy;
      context.ddy = ddy;
      content.movePanels(ddy);
    };

    Draggable.prototype.onmovex = function(content, dx, dy, event, context) {
      if (!context.panel) {
        return;
      }
      var ddx = dx - context.dx;
      if (ddx === 0) {
        return;
      }
      context.dx = dx;
      context.ddx = ddx;
      context.panel.scroll(ddx);
    };

    Draggable.prototype.onend = function(content, dx, dy, event, context) {
      if (content.panels.length === 0) {
        return;
      }
      this.onendy(content, dx, dy, event, context);
      this.onendx(content, dx, dy, event, context);
    };

    Draggable.prototype.onendy = function(content, dx, dy, event, context) {
      // find that a part of the panel located on the out of the window
      var overflowPanel = helper.find(content.panels, function(panel) {
        return (panel.top() * panel.bottom() < 0);
      });
      if (!overflowPanel) {
        var maxTop = content.panels.reduce(function(top, panel) {
          return Math.max(top, panel.top());
        }, -Number.MAX_VALUE);
        if (maxTop < 0) {
          // all panels are located on the out of the window
          content.movePanelsWithAnimation(-maxTop);
        } else {
          // XXX: no need to move panels but handle 'animationend' event
          content.onanimationend();
        }
        return;
      }
      var d;
      if (content.hasNextPanel(overflowPanel)) {
        var top = overflowPanel.top();
        var bottom = overflowPanel.bottom();
        if (top <= -24 && bottom >= 24) {
          d = (context.ddy > 0 ? -top : -bottom);
        } else {
          d = (-top < bottom ? -top : -bottom);
        }
      } else {
        // leave the last panel
        d = -overflowPanel.top();
      }
      content.movePanelsWithAnimation(d);
    };

    Draggable.prototype.onendx = function(content, dx, dy, event, context) {
      var panel = context.panel;
      if (!panel) {
        return;
      }
      var d;
      var left = panel.left();
      var right = panel.right();
      if (left <= -24 && right >= 24) {
        d = (context.ddx > 0 ? -left : -right);
      } else {
        d = (-left < right ? -left : -right);
      }
      panel.scrollWithAnimation(d);
    };

    return Draggable;
  })();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Content;
  } else {
    app.Content = Content;
  }
})(this.app || (this.app = {}));
