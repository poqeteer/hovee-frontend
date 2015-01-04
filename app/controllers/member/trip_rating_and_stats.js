import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberTripRatingAndStatsController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'member'],

  milesDriven: null,
  totalTime: null,
  carbs: null,
  totalTrips: null,
  tripsAsDriver: null,
  totalCarbsSaved: null,
  tripId: null,
  memberId: null,
  partner: null,
  rating: 3, // the rating value as set by the slider (bound to trip-rating view via template)
  ratingStatus: "Slide to rate",
  excluded: false,

  from: null,
  to: null,
  waypoints: [],

  mobileHeaderString: "Rate Trip",
  mapHeight: function() {
    return "height: " + (window.innerHeight - (this.get('controllers.application.onBinaryWebView') ? 362 : 272)) + "px";
  }.property('window.height'),
  mapHeight2: function() {
    return "height: " + (window.innerHeight - (this.get('controllers.application.onBinaryWebView') ? 429 : 339)) + "px";
  }.property('window.height'),


  isRated: false,

  ratingObs: function() {
    switch (this.get('rating')) {
      case 1:
        this.set('ratingStatus', 'Horrible trip');
        break;

      case 2:
        this.set('ratingStatus', 'Not so great trip');
        break;

      case 3:
        this.set('ratingStatus', 'It was OK');
        break;

      case 4:
        this.set('ratingStatus', 'Good trip');
        break;

      case 5:
        this.set('ratingStatus', 'Great trip!');
        break;
    }
  }.observes('rating'),

  canExclude: function() {
    return (Math.round(this.get('rating')) === 1);
  }.property('rating'),

  actions: {
    sendRating: function() {
      this.set('isRated', true);
      var controller = this;
      Ember.Logger.debug(this.get("tripId"), this.get("partner.id"), this.get("memberId"));
      Ember.$.ajax({
        type: "POST",
        url: Ember.ENV.APIHOST + '/trips/' + this.get("tripId") + '/ratings',
        data: JSON.stringify({ "rating": {"score": this.get("rating"), "memberId":this.get("partner.id"), "raterId":this.get("memberId")}}),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(returnData) {
          //window.alert('Trip ' + this.get("tripId") + ' and rider ' + this.get("partner.id") + ' have been rated.');
          //controller.transitionToRoute('member.calendar', controller.get('memberId'));
        }).
        fail(function(error){
          if (error.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          } else {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.trip.rating.submit.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.trip.rating.submit.id,
                dialogText: Em.I18n.translations.error.trip.rating.submit.message + controller.get("tripId")
              });
          }
        });
    },

    exit: function() {
      this.transitionToRoute('member.rides', this.get('memberId'));
    },

    exclude: function () {
      var controller = this;
      var partnerId = this.partner.get("id");
      var partnerName = this.partner.get("fullName");
      Ember.$.ajax({
        type: "POST",
        url: Ember.ENV.APIHOST + '/members/' + this.get("memberId") + '/excludedMembers',
        data: JSON.stringify({ "excludedMember": {"memberId": partnerId}}),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
      then(function(returnData) {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Trip Rating',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: partnerName + ' has been excluded.'
          });
        controller.set('excluded', true);
      }).
      fail(function(error){
        if (error.status === 401) {
          controller.get('controllers.login').send('refreshToken');
        } else {
          new GenericModalDialog().modalDialog(
            {
              dialogTitle: Em.I18n.translations.error.trip.rating.exclude.title,
              dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
              dialogImageTitle: Em.I18n.translations.error.trip.rating.exclude.id,
              dialogText: Em.I18n.translations.error.trip.rating.exclude.message + partnerName
            });
        }
      });
    }
  }
});

export default MemberTripRatingAndStatsController;
