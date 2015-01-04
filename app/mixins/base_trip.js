import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var BaseTrip = Ember.Mixin.create({

  // Member object riding with
  partner: null,

  // Should contain the current member's default departure times
  defaultHomeDepartureTime: '',
  defaultWorkDepartureTime: '',

  // Extracted recommendation information for location, meters, and minute
  memberAsDriverOutboundMemberOriginLocations: null,
  memberAsDriverOutboundMemberDestinationLocations: null,
  memberAsDriverOutboundRiderOriginLocations: null,
  memberAsDriverOutboundRiderDestinationLocations: null,

  memberAsDriverReturnMemberOriginLocations: null,
  memberAsDriverReturnMemberDestinationLocations: null,
  memberAsDriverReturnRiderOriginLocations: null,
  memberAsDriverReturnRiderDestinationLocations: null,

  riderAsDriverOutboundMemberOriginLocations: null,
  riderAsDriverOutboundMemberDestinationLocations: null,
  riderAsDriverOutboundRiderOriginLocations: null,
  riderAsDriverOutboundRiderDestinationLocations: null,

  riderAsDriverReturnMemberOriginLocations: null,
  riderAsDriverReturnMemberDestinationLocations: null,
  riderAsDriverReturnRiderOriginLocations: null,
  riderAsDriverReturnRiderDestinationLocations: null,

  selectedPassengerHomeLocation: null,
  selectedMemberHomeLocation: null,
  selectedPassengerWorkLocation: null,
  selectedMemberWorkLocation: null,
  selectedDriverMode: null,

  memberIsDriver: null,

  // Used for the Outbound (leave home) fields
  homeDepartureTime: '',
  passengerHomePickupTime: '',

  passengerWorkDestTime: '',
  driverWorkDestTime: '',

  workDepartureTime: '',
  passengerWorkPickupTime: '',
  passengerHomeDropOffTime: '',
  driverHomeArrivalTime: '',

  totalCommuteTime: '', // Note: computed one way only outbound

  timeDriverHomeToPassengerHome: 0,     // computed in setTravelTimes
  timePassengerHomeToPassengerWork: 0,  // computed in setTravelTimes
  timePassengerWorkToDriverWork: 0,     // computed in setTravelTimes
  timeDriverWorkToPassengerWork: 0,     // computed in setTravelTimes
  timePassengerWorkToPassengerHome: 0,  // computed in setTravelTimes
  timePassengerHomeToDriverHome: 0,     // computed in setTravelTimes

  setTravelTimes: function() {

    var memberIsDriver = this.get('memberIsDriver');

    // if the selected passenger/member home location isn't set, which should have-been/is from a dropdown then we'll just select the first one off the list.
    if (Ember.isNone(this.get('selectedPassengerHomeLocation')) || Ember.isNone(this.get('selectedMemberHomeLocation'))){
      if (memberIsDriver) {
        this.set('selectedPassengerHomeLocation', this.get('memberAsDriverOutboundRiderOriginLocations').objectAt(0));
        this.set('selectedPassengerWorkLocation', this.get('memberAsDriverOutboundRiderDestinationLocations').objectAt(0));
      } else {
        this.set('selectedMemberHomeLocation', this.get('riderAsDriverOutboundMemberOriginLocations').objectAt(0));
        this.set('selectedMemberWorkLocation', this.get('riderAsDriverOutboundMemberDestinationLocations').objectAt(0));
      }
    }

    // compute the times to locations
    var timeDriverHomeToPassengerHome = memberIsDriver ? this.get('selectedPassengerHomeLocation.minutes') : this.get('selectedMemberHomeLocation.minutes'),
        timePassengerHomeToPassengerWork = memberIsDriver ? this.get('selectedPassengerWorkLocation.minutes') : this.get('selectedMemberWorkLocation.minutes');

    // Assume that destinations are mutual
    var timePassengerWorkToDriverWork = 0;
    if (memberIsDriver) {
      if (this.get('memberAsDriverOutboundMemberDestinationLocations').objectAt(0).owner !== 'mutual') {
        timePassengerWorkToDriverWork = this.get('memberAsDriverOutboundMemberDestinationLocations').objectAt(0).minutes;
      }
    } else {
      if (this.get('riderAsDriverOutboundRiderDestinationLocations').objectAt(0).owner !== 'mutual') {
        timePassengerWorkToDriverWork = this.get('riderAsDriverOutboundRiderDestinationLocations').objectAt(0).minutes;
      }
    }

    this.set('timeDriverHomeToPassengerHome', timeDriverHomeToPassengerHome);
    this.set('timePassengerHomeToPassengerWork', timePassengerHomeToPassengerWork);
    this.set('timePassengerWorkToDriverWork',    timePassengerWorkToDriverWork);

//    // Assume time between destinations is "mutual"
//    var timePassengerWorkToDriverWork = 0;
// FIXME:: This is actually the correct times... But to keep the InfoGraphic symmetric
//    if (memberIsDriver) {
//      if (this.get('memberAsDriverReturnRiderDestinationLocations').objectAt(0).owner !== 'mutual') {
//        timePassengerWorkToDriverWork = this.get('memberAsDriverReturnRiderDestinationLocations').objectAt(0).minutes;
//      }
//    } else {
//      if (this.get('riderAsDriverReturnMemberDestinationLocations').objectAt(0).owner !== 'mutual') {
//        timePassengerWorkToDriverWork = -this.get('riderAsDriverReturnMemberDestinationLocations').objectAt(0).minutes;
//      }
//    }

    this.set('timeDriverWorkToPassengerWork', timePassengerWorkToDriverWork);
    this.set('timePassengerWorkToPassengerHome', timePassengerHomeToPassengerWork);
    this.set('timePassengerHomeToDriverHome', timeDriverHomeToPassengerHome);

    // Compute total, one direction, commute time.
    var totalCommuteTime = Math.abs(timeDriverHomeToPassengerHome) + Math.abs(timePassengerHomeToPassengerWork) + Math.abs(timePassengerWorkToDriverWork);
    var hr = Math.floor(totalCommuteTime / 60);
    var mn = totalCommuteTime % 60;
    var minDescriptor = "minutes";
    if(mn === 1)
    {
      minDescriptor = "minute";
    }
    var hourDescriptor = "hours";
    if(hr === 1) {
      hourDescriptor = "hour";
    }
    if(hr < 1){
      this.set('totalCommuteTime', mn + ' ' + minDescriptor);
    } else {
      this.set('totalCommuteTime', hr + ' ' + hourDescriptor + ' ' + mn + ' ' + minDescriptor);
    }

  },

  inHomeDepartureTimeChange: false,
  homeDepartureTimeChange: function() {
    //Ember.Logger.debug('Home departure time change ' + this.get('homeDepartureTime')  + ' ' + this.get('selectedDate'));
    if (this.get('homeDepartureTime') === '' || this.get('inHomeDepartureTimeChange')) return;

    this.set('inHomeDepartureTimeChange', true);

    if (this.get('timePassengerHomeToPassengerWork') === 0) this.setTravelTimes();

    var timeDriverHomeToPassengerHome = this.get('timeDriverHomeToPassengerHome');
    var timePassengerHomeToPassengerWork = this.get('timePassengerHomeToPassengerWork');
    var timePassengerWorkToDriverWork = this.get('timePassengerWorkToDriverWork');
    var memberIsDriver = this.get('memberIsDriver');

    // Special case... if member isn't the driver they are the passenger so reverse the time to passenger
    if (!memberIsDriver) timeDriverHomeToPassengerHome = -timeDriverHomeToPassengerHome;

    // Set the drivers start time which is the base time for the rest
    var driverStartTime = timezonejsDate('April 1, 1970 ' + this.get('homeDepartureTime'));

    var format = new TimeDateFormatting();
    // Set the passenger pickup time is relative to the owner's time...
    this.set('passengerHomePickupTime', format.formatNextTime(driverStartTime, timeDriverHomeToPassengerHome));

    // Set the destination times...
    if (memberIsDriver) {
      driverStartTime = timezonejsDate('April 1, 1970 ' + this.get('passengerHomePickupTime'));
    }
    this.set('passengerWorkDestTime', format.formatNextTime(driverStartTime, timePassengerHomeToPassengerWork));
    this.set('driverWorkDestTime', format.formatNextTime(driverStartTime, timePassengerHomeToPassengerWork + timePassengerWorkToDriverWork));

    this.set('inHomeDepartureTimeChange', false);
  }.observes('homeDepartureTime'),

  computePassengerHomePickupTimeChange: function(controller, time) {
    var d = timezonejsDate('April 1, 1970 ' + time);
    return new TimeDateFormatting().formatNextTime(d, (controller.get('memberIsDriver') ? -1 : 1) * controller.get('timeDriverHomeToPassengerHome'));
  },

  passengerHomePickupTimeChange: function() {
    if (this.get('inHomeDepartureTimeChange')) return;

    this.set('homeDepartureTime', this.computePassengerHomePickupTimeChange(this, this.get('passengerHomePickupTime')));
  }.observes('passengerHomePickupTime'),

  passengerWorkDestTimeChange: function() {
    if (this.get('inHomeDepartureTimeChange')) return;

    var d = timezonejsDate('April 1, 1970 ' + this.get('passengerWorkDestTime'));
    this.set('homeDepartureTime', new TimeDateFormatting().formatNextTime(d, -((this.get('memberIsDriver') ? this.get('timeDriverHomeToPassengerHome') : 0) + this.get('timePassengerHomeToPassengerWork'))));
  }.observes('passengerWorkDestTime'),

  driverWorkDestTimeChange: function() {
    if (this.get('inHomeDepartureTimeChange')) return;

    var d = timezonejsDate('April 1, 1970 ' + this.get('driverWorkDestTime'));
    this.set('homeDepartureTime', new TimeDateFormatting().formatNextTime(d, -((this.get('memberIsDriver') ? this.get('timeDriverHomeToPassengerHome') : 0) + this.get('timePassengerHomeToPassengerWork') + this.get('timePassengerWorkToDriverWork'))));
  }.observes('driverWorkDestTime'),

  inWorkDepartureTimeChange: false,
  workDepartureTimeChange: function() {
    if (this.get('workDepartureTime') === '' || this.get('inWorkDepartureTimeChange')) return;

    this.set('inWorkDepartureTimeChange', true);

    if (this.get('timePassengerHomeToPassengerWork') === 0) this.setTravelTimes();

    var timeDriverWorkToPassengerWork = this.get('timeDriverWorkToPassengerWork');
    var timePassengerWorkToPassengerHome = this.get('timePassengerWorkToPassengerHome');
    var timePassengerHomeToDriverHome = this.get('timePassengerHomeToDriverHome');
    var memberIsDriver = this.get('memberIsDriver');

    // Special case... if member isn't the driver they are the passenger so reverse the time to passenger
    if (!memberIsDriver) timeDriverWorkToPassengerWork = -timeDriverWorkToPassengerWork;

    // Set the drivers start time which is the base time for the rest
    var driverStartTime = timezonejsDate('April 1, 1970 ' + this.get('workDepartureTime'));

    var format = new TimeDateFormatting();
    // Set the passenger pickup time is relative to the owner's time...
    this.set('passengerWorkPickupTime', format.formatNextTime(driverStartTime, timeDriverWorkToPassengerWork));

    // Set the destination times...
    if (memberIsDriver) {
      driverStartTime = timezonejsDate('April 1, 1970 ' + this.get('passengerWorkPickupTime'));
    }
    this.set('passengerHomeDropOffTime', format.formatNextTime(driverStartTime, timePassengerWorkToPassengerHome));
    this.set('driverHomeArrivalTime', format.formatNextTime(driverStartTime, timePassengerWorkToPassengerHome + timePassengerHomeToDriverHome));

    this.set('inWorkDepartureTimeChange', false);
  }.observes('workDepartureTime'),

  computePassengerWorkPickupTimeChange: function(controller, time) {
    var d = timezonejsDate('April 1, 1970 ' + time);
    return new TimeDateFormatting().formatNextTime(d, (controller.get('memberIsDriver') ? -1 : 1) * controller.get('timeDriverWorkToPassengerWork'));
  },

  passengerWorkPickupTimeChange: function() {
    if (this.get('inWorkDepartureTimeChange')) return;

    this.set('workDepartureTime', this.computePassengerWorkPickupTimeChange(this, this.get('passengerWorkPickupTime')));
  }.observes('passengerWorkPickupTime'),

  passengerHomeDropOffTimeChange: function() {
    if (this.get('inWorkDepartureTimeChange')) return;

    var d = timezonejsDate('April 1, 1970 ' + this.get('passengerHomeDropOffTime'));
    this.set('workDepartureTime', new TimeDateFormatting().formatNextTime(d, -((this.get('memberIsDriver') ? this.get('timeDriverWorkToPassengerWork') : 0) + this.get('timePassengerWorkToPassengerHome'))));
  }.observes('passengerHomeDropOffTime'),

  driverHomeArrivalTimeChange: function() {
    if (this.get('inWorkDepartureTimeChange')) return;

    var d = timezonejsDate('April 1, 1970 ' + this.get('driverHomeArrivalTime'));
    this.set('workDepartureTime', new TimeDateFormatting().formatNextTime(d, -((this.get('memberIsDriver') ? this.get('timeDriverWorkToPassengerWork') : 0) + this.get('timePassengerWorkToPassengerHome') + this.get('timePassengerHomeToDriverHome'))));
  }.observes('driverHomeArrivalTime')

});

export default BaseTrip;