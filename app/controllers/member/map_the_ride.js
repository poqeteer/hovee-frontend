import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var MemberMapTheRideController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'currentMember', 'member'],

  from: null,
  to: null,
  weatherZips: null,
  weatherInfo: null,
  layers: 'traffic weather',
  waypoints: [],
  icons:[],
  disableOptions: null,

  lastTraffic: null,
  lastWeather: null,

  trafficTime: function() {
    return new TimeDateFormatting().formatTime(this.get('lastTraffic'));
  }.property('lastTraffic'),
  weatherTime: function() {
    return new TimeDateFormatting().formatTime(this.get('lastWeather'));
  }.property('lastWeather'),

  //For rides...
  tripMode: null,
  selectedDate: null,
  isSelectedDate: function (){
    return this.get('selectedDate') > 1;
  }.property('selectedDate'),
  isDriver: function() {
    return this.get('tripMode') > -20;
  }.property('tripMode'),

  mobileHeaderString: "Map the Ride"
});

export default MemberMapTheRideController;
