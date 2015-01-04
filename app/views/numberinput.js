import HelpfulInput from 'appkit/views/helpfulinput';

var NumberInput = HelpfulInput.extend({

  keyPress : function (e) {
    if (Ember.isNone(e)){
      e = window.event;      // get event object
    }
    var key = e.keyCode || e.which; // get key cross-browser

    return (key >= 48 && key <= 57) || key === 8;
  }
});

export default NumberInput;
