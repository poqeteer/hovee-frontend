var JobHeadline = Ember.View.extend({

  view: null,
  $field: null,
  wasOver: false,

  didInsertElement: function() {
    var view    = this,
        $field  = view.$('#headline');

    view.$('.help-block').hide();
    view.handleFieldLength();

    $field.keyup(function(){
      view.handleFieldLength();
    });

    $field.change(function(){
      view.handleFieldLength();
    });
  },

  handleFieldLength: function() {
    var view    = this,
        $field  = view.$('#headline'),
        count   = $field[0].value.length,
        suffix  = '';

    if(count > 64) {
      this.set('wasOver', true);
      var overBy = Math.abs(64 - count);
      if(overBy === 1){ 
        suffix = ''; 
      } else { 
        suffix = 's'; 
      }
      view.$('.form-group').removeClass('has-success');  
      view.$('.form-group').addClass('has-error');
      view.$('.help-block').text('Please shorten your job title by ' + Math.abs(64 - count) + ' character' + suffix + '.');
      view.$('.help-block').show('fast');
    } else {
      view.$('.form-group').removeClass('has-error');
      if(this.get('wasOver')){
        view.$('.form-group').addClass('has-success');        
        view.$('.help-block').text('Looks good!');
      } else {
        view.$('.help-block').text('');
        view.$('.help-block').hide();
      }
    }
  }
});

export default JobHeadline;
