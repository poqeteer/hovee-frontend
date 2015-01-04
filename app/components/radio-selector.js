var RadioSelectorComponent = Ember.Component.extend({
  selectionChanged: function() {
    // an afterRender schedule has to be done here so that the input's "active" class has been already set.
    // if we do it straight away, it would not be changed yet from the current input to the new input!
    Ember.run.scheduleOnce('afterRender', this, 'afterRenderEvent');
    this.sendAction("radioChanged", this.get('value'));
  }.observes("value"),


  didInsertElement : function() {
    this._super();
    this.$().find('input.active').parent('label').toggleClass('active');

    if(this.get('hintText')) {
      var view = this;
      var $this = this.$('.btn-group');
      Ember.run.schedule('afterRender',function(){
        if (view.get('isDesktop')) {
          $this.popover({
            trigger: 'hover',
            content: view.get('hintText'),
            container: $this.parent().parent().parent()
          });
        }
      });
    }
  },

  afterRenderEvent: function() {
    //this._super();
    // remove previous 'active' class on labels
    this.$().find('input').each(function(index, element) {
      $(element).parent('label').removeClass('active');
    });
    // set active class where the active on input has been set !
    this.$().find('input.active').parent('label').toggleClass('active');
  }
});

export default RadioSelectorComponent;
