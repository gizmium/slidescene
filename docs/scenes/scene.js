(function(window) {
  Object.defineProperty(window, 'scene', {
    value: Object.create(Object.prototype, {
      load: {
        value: function(props) {
          Object.keys(props).forEach(function(key) {
            this.exports[key] = props[key];
          }.bind(this));
        },
      },
      exports: {
        value: {
          medals: [''],
          nexts: [''],
          sound: '',
          onscroll: function() {},
        },
        writable: true,
      },
    }),
  });
})(this);
