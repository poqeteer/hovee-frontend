var TripRating = Ember.View.extend({

  rating: null, // rating value is bound from template/controller
  style: 'height: 100%',

  didInsertElement: function() {

    var view = this;
    var $exclude = Ember.$('.exclude');

    // hide exclude UI initially
    $exclude.hide();

    // initialize noUiSlider on div#range-slider
    Ember.$("#range-slider").noUiSlider({
      start: 3,// initial value is 3
      //step: 1, // only allow whole-number increments (steps)
      connect: "lower", // show colored part from left side to handle
      range: { // range of values
        'min': 1,
        'max': 5
      }
    });

    // when slider is slid, set 'rating' value to slider value
    Ember.$('#range-slider').on({
      slide: function() {
        var rating = Math.round(Ember.$("#range-slider").val());
        if(rating === 1){
          // show exclude
          $exclude.delay(400).fadeIn();
        } else {
          // hide exclude
          $exclude.stop();
          $exclude.fadeOut(150);
        }
        view.set('rating', rating);
      }
    });

    // set rating value initially.
    view.set('rating', Math.round(Ember.$("#range-slider").val()));
  }
});

export default TripRating;

