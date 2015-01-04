var TripDetailButtons = Ember.View.extend({

  didInsertElement: function() {
    var view = this;

    Ember.run.schedule('afterRender',function(){
      view.$('.tripdetailSidebar.doAffix .voice').width(view.$('.tripdetailSidebar').width());
      view.$('.tripdetailSidebar.doAffix').affix({
        offset: {
           top:  310
        }
      });
    });
  }
});

export default TripDetailButtons;

