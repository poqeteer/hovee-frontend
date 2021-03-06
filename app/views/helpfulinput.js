import RestrictedInput from 'appkit/views/restrictedinput';

var HelpfulInput = RestrictedInput.extend({
  attributeBindings: ['hintText', 'isDesktop'],

  didInsertElement: function() {
    var view = this;
    var $this = this.$();

    Ember.run.schedule('afterRender',function(){    
      if(view.get('isDesktop')) {
        $this.popover({
          trigger: 'focus',
          content: view.get('hintText'),
          container: $this.parent().parent()
        });
      }
    });

  }
});

export default HelpfulInput;
