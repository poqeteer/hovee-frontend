var MaskedInput;
MaskedInput = Ember.View.extend({
  tagName: "input",
  type: "text",
  attributeBindings: [ "name", "value", "mask", "hintText", "isDesktop" ],
  onChange: function (e) {
    this.set('value', e.currentTarget.value);
  },
  didInsertElement: function () {
    var view = this;
//    this.$.mask.definitions['~'] = '[+-]';
    this.$('').mask(this.get('mask'));
    this.$('').on('change', function (e) {
      view.onChange(e);
    });

    if(this.get('hintText')) {
      var $this = this.$();

      Ember.run.schedule('afterRender',function(){    
        if (view.get('isDesktop')) {
          $this.popover({
            trigger: 'focus',
            content: view.get('hintText'),
            container: $this.parent().parent()
          });
        }
      });
    }
  }
});

export default MaskedInput;