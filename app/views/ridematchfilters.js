var RideMatchFilters = Ember.View.extend({
  
  didInsertElement: function() {
    var $this = this.$();
    var view = this;

    $this.find('.filterHeader').each(function(){
      var $header = $(this);
      $header.click(function(){
        $header.nextAll('ul').eq(0).slideToggle('fast', function(){

          $header.toggleClass('closed');
        });

        $header.find('i').toggleClass('fa-caret-down');
        $header.find('i').toggleClass('fa-caret-left');
      });
    });

    Ember.run.schedule('afterRender',function(){
      view.$('.filters').affix({
        offset: {
           top:  144
        }
      });
    });

  }
});

export default RideMatchFilters;

