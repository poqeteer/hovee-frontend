var RestrictedInput = Ember.TextField.extend({

  keyPress : function (e) {
    if (Ember.isNone(e)){
      e = window.event;      // get event object
    }
    var key = e.keyCode || e.which; // get key cross-browser
    if (key === 60 || key === 62) return false;
  }
});

export default RestrictedInput;
