var ToggleButtonComponent = Ember.Component.extend({
  tagName           : 'button',
  attributeBindings : [ "value", "label", "style", 'isDesktop' ],
  classNames        : ['btn','btn-default', 'toggleButton'],
  classNameBindings : ['value:active'],

  doOnce: false,

  click: function () {

    // Fix for the mobile "tap bounce"... For some reason, on mobile, will get two taps for one causing the value to be
    // set/cleared automatically. We can only do this because each button is a separate object.
    if (!this.get('isDesktop'))
    {
      if (this.get('doOnce')) {
        this.set('doOnce', false);
        return;
      }
      this.set('doOnce', true);
    }
    this.set('value', !this.get('value'));
  }
});

export default ToggleButtonComponent;
