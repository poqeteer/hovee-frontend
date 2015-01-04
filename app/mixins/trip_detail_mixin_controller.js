import timezonejsDate from 'appkit/utils/timezonejs_date';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import BaseTrip from 'appkit/mixins/base_trip';
import MapDialog from 'appkit/utils/map_dialog';
import MessageDialog from 'appkit/utils/message_dialog';

var TripDetailMixinController = Ember.Mixin.create(BaseTrip, {
  needs: ['application', 'currentMember', 'member', 'login'],


  // Schedule tab...
  isRoundTrip: true,
  isWorkTrip: false,
  isReturnTrip: false,

  isRoundOrWork: true,
  watchRoundWork: function() {
    this.set('isRoundOrWork', this.get('isRoundTrip') || this.get('isWorkTrip'));
  }.observes('isRoundTrip', 'isWorkTrip'),

  isRoundOrReturn: true,
  watchRoundReturn: function() {
    this.set('isRoundOrReturn', this.get('isRoundTrip') || this.get('isReturnTrip'));
  }.observes('isRoundTrip', 'isReturnTrip'),

  // zero-indexed week (first week = 0, second week = 1, etc)
  // used in the week controls at the top of the calendar
  selectedWeekIndex: 0,

  // Calendar array with both members scheduling information
  calendar: null,

  // For message displays on page...
  personalMessage: '',          // message current member wants to send
  message: '',                  // message on the bottom of the make_proposal partial... usually some warning of some sort.
  rinMessages: [],              // complete list of messages...

  // Used for the "review" version of the page
  trip: null,
  rideProposal: false,
  editing: true,
  tripNegotiationWeek: null,
  tripNegotiationDay: null,

  timeArray: [],
  init: function() {
    var ta = this.get('timeArray');
    for (var i = 3; i < 24; i++) {
      for (var j = 0; j < 60; j = j + 15) {
        var time = i%13 + ":" + (j < 10? '0' + j: j) + ' ' + (i < 12 ? 'AM' : 'PM');
        ta.push({id: i * 100 + j, label: time});
      }
    }
  },

  selectedDayOfTheWeek: '',
  selectedDate: '',

  selectedDateChange: function() {
    Ember.Logger.info("--- SELECTED DATE CHANGED ---", this.get('selectedDate'));
    if (this.get('homeDepartureTime') === '') {
      this.set('homeDepartureTime', this.get('defaultHomeDepartureTime'));
      this.set('workDepartureTime', this.get('defaultWorkDepartureTime'));
    } else if (this.get('timePassengerHomeToPassengerWork') === 0) {
      this.setTravelTimes();
    }
  }.observes('selectedDate'),

  cantRewindCalendar: function() {
    return (this.get('selectedWeekIndex') <= 0 || this.get('editing') === false);
  }.property('selectedWeekIndex', 'editing'),

  cantAdvanceCalendar: function() {
    // Ember.Logger.debug(">> cantAdvanceCalendar:", this.get('selectedWeekIndex'), this.get('editing'));
    return (this.get('selectedWeekIndex') >= 3 || this.get('editing') === false);
  }.property('selectedWeekIndex', 'editing'),

  mobileHeaderString: function() {
    return this.get('selectedDate');
  }.property('selectedDate'),

  // Control what is display with regard to who has a car
  isTwoDrivers: function() {
    return this.get('currentMember.hasCar') && this.get('partner.hasCar');
  }.property('currentMember.hasCar', 'partner.hasCar'),

  isMemberDriver: function() {
    return this.get('currentMember.hasCar') && !this.get('partner.hasCar');
  }.property('currentMember.hasCar', 'partner.hasCar'),

  isPartnerDriver: function() {
    return !this.get('currentMember.hasCar') && this.get('partner.hasCar');
  }.property('currentMember.hasCar', 'partner.hasCar'),

  isNoneOfTheAbove: function() {
    return !this.get('currentMember.hasCar') && !this.get('partner.hasCar');
  }.property('currentMember.hasCar', 'partner.hasCar'),

  driverOrRider: null, // See route... It is set in there.

  isPartnerFemale: function() {
    return this.get('partner.gender') === 'female';
  }.property('partner.gender'),

  isAccepted: function() {
    return this.get('trip.rinStatus') === 2;
  }.property('trip.rinStatus'),

  isCancelledOrDeclined: function() {
    return this.get('trip.rinStatus') === 3 || this.get('trip.rinStatus') === 4 || this.get('trip.rinStatus') === 7 || this.get('trip.status') === 5;
  }.property('trip.rinStatus'),

  isCurrentMemberOwner: function() {
    return this.get('trip.owner.id') === this.get('currentMember.id');
  }.property('currentMember.id', 'trip.owner.id'),

  isWaitingForResponse: function() {
    if (this.get('trip.owner.id') === this.get('controllers.member.id')) { // NOTE: for some reason the "normal" call to currentMember.id doesn't work on direct call to page
      return this.get('trip.rinStatus') === 5 || (!Ember.isNone(this.get('trip.rinStatus')) && this.get('trip.rinStatus') === 0);
    }
    return this.get('trip.rinStatus') === 6;
  }.property('trip.rinStatus'),

  isNegotiatingTrip: function() {
    return this.get('editing');
  }.property('editing'),

  cantBrowseWeeks: function() {
    return ! this.get('isNegotiatingTrip');
  }.property('isNegotiatingTrip'),


  isNotDirty: function() {
    // NOTE: timezonejsDate is not needed because just checking the times to see if they cross
    var pickupTime = new Date('January 1, 1970 ' + this.get('homeDepartureTime')).getTime(),
      returnTime = new Date('January 1, 1970 ' + this.get('workDepartureTime')).getTime();

    if (pickupTime > returnTime) {
      this.set('message', 'Note: Going to work time must come before going home time. Please adjust the time.');
      return true;
    } else {
      this.set('message', '');
    }
    var driver = this.get('memberIsDriver') ? this.get('currentMember.id') : this.get('partner.id');
    return  (driver === this.get('trip.driverId')) &&
      (this.get('homeDepartureTime') === this.get('lastHomeDepartureTime')) &&
      (this.get('workDepartureTime') === this.get('lastWorkDepartureTime'));
  }.property('memberIsDriver', 'homeDepartureTime', 'workDepartureTime', 'selectedDate'),

  canBeProposed: function() {
    // NOTE: timezonejsDate is not needed because just checking the times to see if they cross
    var pickupTime = new Date('January 1, 1970 ' + this.get('homeDepartureTime')).getTime(),
      returnTime = new Date('January 1, 1970 ' + this.get('workDepartureTime')).getTime();

    if (pickupTime > returnTime) {
      this.set('message', 'Note: Going to work time must come before going home time. Please adjust the time.');
    } else {
      this.set('message', '');
    }
    return pickupTime < returnTime  && this.get('selectedDate') !== '';
  }.property('homeDepartureTime', 'workDepartureTime', 'selectedDate'),

  weekOfDate: function() {
    var idx = this.get('selectedWeekIndex');
    if (idx < 0) {
      this.set('selectedWeekIndex', 0);
      idx = 0;
    }
    return this.get('calendar.content.'+idx+'.displayDate');
  }.property('selectedWeekIndex'),

  currentMember: function() {
    return this.get('controllers.member');
  }.property('controllers.member'),

  currentRecommendation: function() {
    return this.get('controllers.recommendation.currentRecommendation');
  }.property('controllers.recommendation.currentRecommendation'),

  // These may hold the current locations if this is from the Ride Match or the trips locations if from Calendar
  mHomeLocation: null,
  mWorkLocation: null,
  pHomeLocation: null,
  pWorkLocation: null,

  /*
   * The following is for the Infograhic display...
   */
  driverFirstName: function() {
    if (this.get('memberIsDriver')) {
      return this.get('currentMember.firstName');
    }
    return this.get('partner.firstName');
  }.property('selectedDriverMode','memberIsDriver', 'currentMember.firstName', 'partner.firstName'),

  driverHomeAddress: function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.homeAddress.address1');
    }
    return this.get('pHomeLocation.homeAddress.address1');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.address1', 'mHomeLocation.homeAddress.address1'),
  driverHomeStreet: function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.homeAddress.street');
    }
    return this.get('pHomeLocation.homeAddress.street');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.homeAddress.street'),
  driverHomeCity: function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.homeAddress.city');
    }
    return this.get('pHomeLocation.homeAddress.city');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.city', 'mHomeLocation.homeAddress.city'),
  driverHomeHood:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.homeAddress.street');
    }
    return this.get('pHomeLocation.homeAddress.street');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.street'),
  driverHomeAddressCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.addressCityState');
    }
    return this.get('pHomeLocation.addressCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.address1', 'mHomeLocation.address1'),
  driverHomeStreetCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mHomeLocation.streetCityState');
    }
    return this.get('pHomeLocation.streetCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.street'),
  driverWorkNameAndAddress:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mWorkLocation.nameAndAddress');
    }
    return this.get('pWorkLocation.nameAndAddress');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.nameAndAddress', 'mWorkLocation.nameAndAddress'),
  driverWorkName:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mWorkLocation.name');
    }
    return this.get('pWorkLocation.name');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.name', 'mWorkLocation.name'),
  driverWorkCity:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mWorkLocation.workAddress.city');
    }
    return this.get('pWorkLocation.workAddress.city');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.workAddress.city', 'mWorkLocation.workAddress.city'),
  driverWorkAddressCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('mWorkLocation.addressCityState');
    }
    return this.get('pWorkLocation.addressCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.WorkAddress.street', 'mWorkLocation.street'),

  passengerFirstName:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('partner.firstName');
    }
    return this.get('currentMember.firstName');
  }.property('selectedDriverMode','memberIsDriver', 'currentMember.firstName', 'partner.firstName'),

  passengerHomeAddress:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.homeAddress.address1');
    }
    return this.get('mHomeLocation.homeAddress.address1');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.address1', 'mHomeLocation.homeAddress.address1'),
  passengerHomeStreet:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.homeAddress.street');
    }
    return this.get('mHomeLocation.homeAddress.street');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.homeAddress.street'),
  passengerHomeCity:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.homeAddress.city');
    }
    return this.get('mHomeLocation.homeAddress.city');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.city', 'mHomeLocation.homeAddress.city'),
  passengerHomeHood:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.homeAddress.street');
    }
    return this.get('mHomeLocation.homeAddress.street');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.street'),
  passengerHomeAddressCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.addressCityState');
    }
    return this.get('mHomeLocation.addressCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.address1', 'mHomeLocation.address1'),
  passengerHomeStreetCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pHomeLocation.streetCityState');
    }
    return this.get('mHomeLocation.streetCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pHomeLocation.homeAddress.street', 'mHomeLocation.street'),
  passengerWorkNameAndAddress:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pWorkLocation.nameAndAddress');
    }
    return this.get('mWorkLocation.nameAndAddress');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.nameAndAddress', 'mWorkLocation.nameAndAddress'),
  passengerWorkName:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pWorkLocation.name');
    }
    return this.get('mWorkLocation.name');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.name', 'mWorkLocation.name'),
  passengerWorkCity:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pWorkLocation.workAddress.city');
    }
    return this.get('mWorkLocation.workAddress.city');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.workAddress.city', 'mWorkLocation.workAddress.city'),
  passengerWorkAddressCityState:  function() {
    if (this.get('memberIsDriver')) {
      return this.get('pWorkLocation.addressCityState');
    }
    return this.get('mWorkLocation.addressCityState');
  }.property('selectedDriverMode','memberIsDriver', 'pWorkLocation.WorkAddress.street', 'mWorkLocation.street'),

  /*
   * End Infographic specific stuff
   */

  // Trigger when the user selects either to be the driver or the passenger
  driverChange: function () {
    if (Ember.isNone(this.get('selectedDriverMode'))) return;

    this.set('memberIsDriver', this.get('selectedDriverMode') === 'driver');

    this.set('timePassengerHomeToPassengerWork', 0);

    this.homeDepartureTimeChange();
    this.workDepartureTimeChange();
  }.observes('selectedDriverMode'),

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // NOTE: Time change functions are in mixin
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  testOverlap: function(controller) {
    var startHomeTime =  controller.get('memberIsDriver') ? controller.get('workDepartureTime') : controller.get('passengerWorkPickupTime');
    if (timezonejsDate('April 1, 1970 ' + controller.get('driverWorkDestTime')).getTime() > timezonejsDate('April 1, 1970 ' + startHomeTime).getTime()) {
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: Em.I18n.translations.error.trip.detail.propose.overlap.title,
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogImageTitle: Em.I18n.translations.error.trip.detail.propose.overlap.id,
          dialogText: Em.I18n.translations.error.trip.detail.propose.overlap.message
        });
      return true;
    }
    return false;
  },

  genSelectedDate: function(controller){
    var selectedDate = controller.get('selectedDate');
    var dOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var selectedDayOfTheWeek = dOW[new Date(selectedDate).getDay()];

    return selectedDayOfTheWeek + ', ' + selectedDate.substr(0, selectedDate.indexOf(',')) + ( [,'st','nd','rd'][/1?.$/.exec(new Date(selectedDate).getDate() + '' )] || 'th' );
  },

  actions: {
    setTripDirection: function(tripDirection) {
      if (Ember.isNone(this.get('trip'))) {
        this.set('isRoundTrip', false);
        this.set('isWorkTrip', false);
        this.set('isReturnTrip', false);
        this.set(tripDirection, true);
      }
    },


    showRoute: function(preview) {

      if(!this.get('controllers.login.onDesktop')) {
        var ctrl = this.controllerFor('member.map_the_ride');
        ctrl.set('selectedDate', this.get('selectedDate'));
        ctrl.set('tripMode', this.get('tripMode') + (this.get('driverMode') === 'driver' ? -10 : -20));
        this.transitionToRoute('member.map_the_ride', this.get('partner.id'), this.get('trip') ? this.get('trip.id') : this.get('memberIsDriver') ? '-2' : '-3');
        return;
      }

      var memberIsDriver = this.get('memberIsDriver');
      var partner = this.get('partner');
      var trip = this.get('trip');

      var mapDialog = new MapDialog();
      var mapParams = mapDialog.generateMapDialog(this.get('currentMember'), partner, trip, Ember.isNone(trip) ? 0 : trip.get('id'), this.get('tripMode') % 10, memberIsDriver);
      mapDialog.modalDialog(
        {
          dialogTitle: partner.get('firstName'),
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: (memberIsDriver ? 'You are' : partner.get('firstName') + ' is') +  ' the driver',
          from: mapParams.from,
          to: mapParams.to,
          waypoints: mapParams.waypoints,
          disableOptions: preview,
          icons: mapParams.icons,
          controller: this
        });

    },

    // Planner specific actions
    selectTheDay: function(day) {
      this.set('selectedDate', day.get('displayDate'));
    },
    today: function() {
      // hacky- first week won't always be 'today' week
      this.set('selectedWeekIndex', 0);
    },
    prevweek: function() {
      if(this.get('selectedWeekIndex') > 0) {
        this.set('selectedWeekIndex', this.get('selectedWeekIndex') - 1);
      }
    },
    nextweek: function() {
      if(this.get('selectedWeekIndex') < 3) {
        this.set('selectedWeekIndex', this.get('selectedWeekIndex') + 1);
      }
    },

    // Button actions in make_proposal partial
    done: function() {
      window.history.back();
      //this.transitionToRoute('member.ride_match', this.get('model'));
    },
    makeProposal: function () {
      //Ember.Logger.debug(this.get('personalMessage'));
      this.save(false);
    },
    schedule: function () {
      this.save(true);
    },
    acceptProposal: function(){
      var trip = this.get('trip');
      var selectedDate = this.get('selectedDate');
      this.rinRequestPost(
          this.get('currentMember.firstName') + ' has accepted your ride request',
          'Accepted ' + trip.get('owner.firstName') + '\'s request',
        {}, 2,
        'Ride Accepted',
          'Your trip with ' + this.get('partner.firstName') + ' is now scheduled for ' + this.genSelectedDate(this),
        Em.I18n.translations.error.trip.detail.accept.rin.message,
        Em.I18n.translations.error.trip.detail.accept.rin.title,
        Em.I18n.translations.error.trip.detail.accept.rin.id
      );
    },
    proposeChanges: function(){
      this.set('lastHomeDepartureTime', this.get('homeDepartureTime'));
      this.set('lastWorkDepartureTime', this.get('workDepartureTime'));
      this.set('selectedDriverMode', this.get('memberIsDriver') ? 'driver' : 'passenger');

      // Enable the editing view of the world
      this.set('editing', true);
    },
    declineProposal: function(){
      var trip = this.get('trip');
      var selectedDate = this.get('selectedDate');
      this.rinRequestPost(
          this.get( 'currentMember.firstName') + ' has declined your ride request',
          'Declined ' + trip.get('partner.firstName') + '\'s request',
        {},
          this.get('trip.owner.id') === this.get('currentMember.id') ? 3 : 4,
        'Ride Declined',
          'You said no to riding with ' + this.get('partner.firstName') + ' on ' + this.genSelectedDate(this),
        Em.I18n.translations.error.trip.detail.decline.rin.message,
        Em.I18n.translations.error.trip.detail.decline.rin.title,
        Em.I18n.translations.error.trip.detail.decline.rin.id
      );
    },

    propose: function() {
      if (this.testOverlap(this)) return;

      var trip = this.get('trip');
      var selectedDate = this.get('selectedDate');
      var isOwner = this.get('currentMember.id') === trip.get('owner.id');
      var memberIsDriver = this.get('memberIsDriver');

      // Determine who is going to be the driver...
      var driver = this.get('memberIsDriver') ? this.get('currentMember.id') : this.get('partner.id');

      var tripChange = {};

      if (driver !== this.get('trip.driverId')) {
        tripChange.driverId = driver;
      }

      if (this.get('homeDepartureTime') !== this.get('lastHomeDepartureTime')) {
        if (isOwner) {
          tripChange.pickupTimestamp = timezonejsDate(selectedDate + ' ' + this.get('homeDepartureTime')).getTime();
        } else {
          // the name is confusing, but basically you have use the "other" time if you are not the owner
          tripChange.pickupTimestamp = timezonejsDate(selectedDate + ' ' + this.get('passengerHomePickupTime')).getTime();
        }
      }
      if (this.get('workDepartureTime') !== this.get('lastWorkDepartureTime')) {
        if (isOwner) {
          tripChange.returnTimestamp = timezonejsDate(selectedDate + ' ' + this.get('workDepartureTime')).getTime();
        } else {
          // the name is confusing, but basically you have use the "other" time if you are not the owner
          tripChange.returnTimestamp = timezonejsDate(selectedDate + ' ' + this.get('passengerWorkPickupTime')).getTime();
        }
      }

      this.rinRequestPost
      (
          this.get('currentMember.firstName') + ' has responded to your ride request',
          'Waiting for ' + this.get('trip.owner.firstName') + ' to respond to your change request',
        tripChange,
          this.get('trip.owner.id') === this.get('currentMember.id') ? 5 : 6,
        'Ride Changes Proposed',
          this.get('partner.firstName') + ' was sent your changes for the ride on ' + this.genSelectedDate(this),
        Em.I18n.translations.error.trip.detail.change.rin.message,
        Em.I18n.translations.error.trip.detail.change.rin.title,
        Em.I18n.translations.error.trip.detail.change.rin.id
      );
    },

    cancel: function() {
      // Reset any changes to the variables
      this.set('memberIsDriver', this.get('trip.driverId') === this.get('currentMember.id'));
      this.set('selectedDriverMode', this.get('memberIsDriver') ? 'driver' : 'passenger');
      this.set('homeDepartureTime', this.get('lastHomeDepartureTime'));
      this.set('workDepartureTime', this.get('lastWorkDepartureTime'));

      // Disable the editing view of the world
      this.set('editing', false);
    },

    cancelProposal: function(){
      var msg = 'Are you sure you want to cancel?<br><br>';

      // compute 24 hours from now...
      var time = timezonejsDate().getTime() - 24*60*60*1000;
      this.set('cancelMsgTime', time);
      var trip = this.get('trip');

      // if trip is scheduled for less than 24 from now...
      if (trip.get('pickupTimestamp') < time) {
        msg += 'You will be leaving ' + this.get('partner.firstName') +
          ' stranded without a ride partner. And canceling within 24 hours will impact your Hovee Member Reputation.';
      } else {
        msg += 'You will be leaving ' + this.get('partner.firstName') + ' to look for a new ride partner.';
      }

      new GenericModalDialog().modalDialog(
        {
          dialogTitle: 'Cancel a Scheduled Ride',
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: msg,
          controller: this,
          actionText: 'Yes', actionClass: 'btn-danger', func: this.cancelConfirmed,
          cancelText: 'No', cancelClass: 'btn-primary'
        });
    },

    sendMessage: function() {
      // Prefixed to each Twillo message... So have to limit the length
      var limit = 'message from ' + this.get('currentMember.fullName') + ' via hovee: ';
      new MessageDialog().modalDialog(
        {
          dialogTitle: 'Message ' + this.get('partner.firstName'),
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: 'Enter your message here',
          controller: this,
          limit: 160 - limit.length,
          actionText: 'Send', actionClass: 'btn-success', func: this.sendTheMessage,
          cancelText: 'Cancel', cancelClass: 'btn-default'
        }, !this.get('controllers.login.onDesktop'));
    }
  },

  // Sends the user message via twillio... NOTE: I know this is bad, but dup'ed code in profile controller. This is temp until we get hovee messaging running?
  sendTheMessage: function(controller, msg) {
    window.alert(msg);
    var sms_messages =
    {
      smsMessage: {
        recipientId: controller.get('partner.id'),
        body: msg
      }
    };

    Ember.$.ajax({
      type: "POST",
      url: Ember.ENV.APIHOST + '/sms-messages',
      data: JSON.stringify(sms_messages),
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).
      then(function(){
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Thanks, message is on its way',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: 'We sent your message via text to ' + controller.get('partner.firstName')
          });
      }).
      fail(function(error){
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.trip.detail.propose.message.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.trip.detail.propose.message.id,
            dialogText: Em.I18n.translations.error.trip.detail.propose.message.message
          });
        Ember.logger.error('send msg: ' + error.status + " " + JSON.stringify(error));
      });

  },

  // corner case, if the use waits long enough, the time could click over... So to protect the user, we'll track the time
  cancelMsgTime: null,

  /**
   * The canceledStatus tells who cancels the trip. "Without Notice" 503/504 should be used if the cancel is less than 24 hours before the scheduled pickup time.
   * - TRIP_OUTCOME_CANCELED_DRIVER = 501
   * - TRIP_OUTCOME_CANCELED_PASSENGER = 502
   * - TRIP_OUTCOME_CANCELED_DRIVER_WITHOUT_NOTICE = 503
   * - TRIP_OUTCOME_CANCELED_PASSENGER_WITHOUT_NOTICE = 504
   */
  cancelConfirmed: function(controller) {
    var selectedDate = controller .get('selectedDate');
    var driver = controller.get('memberIsDriver');
    var reason = driver ? 501 : 502;

    var time = controller.get('cancelMsgTime');
    var trip = controller.get('trip');

    // For now we need to delete the whole thing... So use the parentId
    var tripId = trip.get('parentTripId');
    if (Ember.isNone(tripId) || tripId === 0) {
      tripId = trip.get('id');
    }

    if (trip.get('pickupTimestamp') > time) {
      reason = driver ? 503 : 504;
    }

    var cancel = { trip: { status: 5, canceledStatus: reason }};

    Ember.$.ajax({
      type: 'PUT',
      url: Ember.ENV.APIHOST + '/trips/' + tripId,
      data: JSON.stringify(cancel),
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).
      then(function(){
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Ride Cancelled',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: 'The ride you had scheduled with ' + controller.get('partner.firstName') + ' for ' + controller.genSelectedDate(controller) + ' is now cancelled.'
          });
        controller.transitionToRoute('member.rides');
      }).
      fail(function(e){
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.trip.detail.cancel.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.trip.detail.cancel.id,
            dialogText: Em.I18n.translations.error.trip.detail.cancel.pre + controller.get('partner.firstName') + Em.I18n.translations.error.trip.detail.cancel.mid + controller.genSelectedDate(controller) + Em.I18n.translations.error.trip.detail.cancel.post
          });
      });
  },

  /**
   * Function to save the ride in negotiation choice
   */
  rinRequestPost: function(recipientMessage, senderMessage, tripChange, status, title, confirmMsg, errorMsg, errorTitle, errorId) {
    var controller = this;
    var trip = this.get('trip');
    var rinRequest = { rinRequest: {
      recipientMessage: recipientMessage,
      senderMessage: senderMessage,
      personalMessage: this.get('personalMessage'),
      recipientId: this.get('partner.id'),
      senderId: this.get('currentMember.id'),
      status: status,
      tripChange: tripChange
    }};

    Ember.$.ajax({
      type: 'POST',
      url: Ember.ENV.APIHOST + '/trips/' + this.get('trip.id') + "/rin-requests",
      data: JSON.stringify(rinRequest),
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).then(function(reply){
      controller.transitionToRoute('member.rides', controller.get('currentMember.id'));
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: title,
          dialogImageUrl: Ember.isNone(controller.get('partner.profilePhotoUrl')) ? '/assets/img/ios-bookmark-icon.png' : controller.get('partner.profilePhotoUrl'),
          dialogText: confirmMsg
        });

    }).fail(function(e){
      if (e.status === 401) {
        controller.get('controllers.login').send('refreshToken');
      } else {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: errorTitle,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: errorId,
            dialogText: Em.I18n.translations.error.trip.detail.rin.message.pre + errorMsg + Em.I18n.translations.error.trip.detail.rin.message.post
          });
        Ember.Logger.error('rin req save: ' + JSON.stringify(e));
      }
    });

  },

  /**
   * Function to post new proposals
   *
   * @param now -- flag to schedule trip without negotiation. Shouldn't be necessary anymore but leaving for now.
   */
  save: function(now, stopTransistion) {
    if (this.testOverlap(this)) return;

    var generateWaypoint = function (waypoints, leg) {
      waypoints.forEach(function(waypoint){
        leg.waypoints.push( {
          locationId: waypoint.get('orientation') === 'origin' ? waypoint.get('homeLocation.id') : waypoint.get('location.id'),
          meters:     waypoint.get('meters'),
          minutes:    waypoint.get('minutes'),
          orientation:waypoint.get('orientation'),
          owner:      waypoint.get('owner')
        });
      });
    };

    var selectedDate = this.get('selectedDate'); // assigned from new calendarmatrixview.js
    // see console entry 'selectedDate' for value after clicking an available day

    // Determine who is going to be the driver...
    var driver = this.get('memberIsDriver') ? this.get('currentMember.id') : this.get('partner.id');

    // The following will be used to generate data for the trip
    // var pickupTime = timezonejsDate(selectedDate + ' ' + this.get('homeDepartureTime')).getTime();
    var pickupTime = timezonejsDate(selectedDate + ' ' + this.get('homeDepartureTime'));
    pickupTime = pickupTime.getTime();
    // var pickupTime = new Date(selectedDate + ' ' + this.get('homeDepartureTime')).getTime(),
    var returnTime = timezonejsDate(selectedDate + ' ' + this.get('workDepartureTime')).getTime();
    // returnTime = new Date(selectedDate + ' ' + this.get('workDepartureTime')).getTime();
    var recommendation = this.get('currentRecommendation');
    var memberAsDriverOutboundLeg = recommendation.get('memberAsDriver.outboundLeg'), // pointer to the outbound leg for the member
        riderAsDriverOutboundLeg =  recommendation.get('riderAsDriver.outboundLeg');  // pointer to the outbound leg for the rider
    var memberAsDriver = null,                                                        // initially we'll assume there is memberAsDriver data
        riderAsDriver = null;                                                         // initially we'll assume there is riderAsDriver data

    var outboundLeg, returnLeg;

    // if there isn't an outbound leg, then no data for the member (probably doesn't have a car)
    if (!Ember.isNone(memberAsDriverOutboundLeg)) {
      var memberAsDriverReturnLeg = recommendation.get('memberAsDriver.returnLeg');
      outboundLeg = {
        carbs:          memberAsDriverOutboundLeg.get('carbs'),
        deflectMeters:  memberAsDriverOutboundLeg.get('deflectMeters'),
        deflectMinutes: memberAsDriverOutboundLeg.get('deflectMinutes'),
        id:             memberAsDriverOutboundLeg.get('id'),
        savingsMeters:  memberAsDriverOutboundLeg.get('savingsMeters'),
        waypoints: []
      };
      returnLeg = {
        carbs:          memberAsDriverReturnLeg.get('carbs'),
        deflectMeters:  memberAsDriverReturnLeg.get('deflectMeters'),
        deflectMinutes: memberAsDriverReturnLeg.get('deflectMinutes'),
        id:             memberAsDriverReturnLeg.get('id'),
        savingsMeters:  memberAsDriverReturnLeg.get('savingsMeters'),
        waypoints: []
      };

      // Generate the pared down waypoints for trip
      generateWaypoint(memberAsDriverOutboundLeg.get('waypoints'), outboundLeg);
      generateWaypoint(memberAsDriverReturnLeg.get('waypoints'), returnLeg);
      memberAsDriver = {outboundLeg: outboundLeg, returnLeg: returnLeg};
    }

    // if there isn't an outbound leg, then no data for the rider/partner (probably doesn't have a car)
    if (!Ember.isNone(riderAsDriverOutboundLeg)) {
      var riderAsDriverReturnLeg = recommendation.get('riderAsDriver.returnLeg');
      outboundLeg = {
        carbs:          riderAsDriverOutboundLeg.get('carbs'),
        deflectMeters:  riderAsDriverOutboundLeg.get('deflectMeters'),
        deflectMinutes: riderAsDriverOutboundLeg.get('deflectMinutes'),
        id:             riderAsDriverOutboundLeg.get('id'),
        savingsMeters:  riderAsDriverOutboundLeg.get('savingsMeters'),
        waypoints: []
      };
      returnLeg = {
        carbs:          riderAsDriverReturnLeg.get('carbs'),
        deflectMeters:  riderAsDriverReturnLeg.get('deflectMeters'),
        deflectMinutes: riderAsDriverReturnLeg.get('deflectMinutes'),
        id:             riderAsDriverReturnLeg.get('id'),
        savingsMeters:  riderAsDriverReturnLeg.get('savingsMeters'),
        waypoints: []
      };

      // Generate the pared down waypoints for trip
      generateWaypoint(riderAsDriverOutboundLeg.get('waypoints'), outboundLeg);
      generateWaypoint(riderAsDriverReturnLeg.get('waypoints'), returnLeg);
      riderAsDriver = {outboundLeg: outboundLeg, returnLeg: returnLeg};
    }

    // ok now we have info we need to create the trip
    var trip = { trip: {
      riderId:         this.get('partner.id'),
      driverId:        driver,
      pickupTimestamp: pickupTime,
      returnTimestamp: returnTime,
      riderAsDriver:   riderAsDriver,
      memberAsDriver:  memberAsDriver,
      personalMessage: this.get('personalMessage'),
      oneWayStatus:    this.get('isRoundTrip') ? 0 : this.get('isWorkTrip') ? 1 : 2,
      status:          now ? 1 : 0
    }};
    Ember.Logger.debug('trip being posted:', trip);
    trip = JSON.stringify(trip);

    var controller = this;
    Ember.$.ajax({
      type: 'POST',
      url: Ember.ENV.APIHOST + '/members/' + this.get('currentMember.id') + '/trips',
      data: trip,
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8',
      async: false
    }).then(function(reply){
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: 'Ride Proposal Sent',
          dialogImageUrl: Ember.isNone(controller.get('partner.profilePhotoUrl')) ? '/assets/img/ios-bookmark-icon.png' : controller.get('partner.profilePhotoUrl'),
          dialogText: 'You asked ' + controller.get('partner.firstName') + ' to ride with you on ' + controller.genSelectedDate(controller)
        });

      controller.transitionToRoute('member.rides');
//      if (!controller.get('controllers.login.onDesktop') && !stopTransistion) {
//        controller.transitionToRoute('member.pick_date', controller.get('currentMember.id'), controller.get('partner.id'));
//        return;
//      }
//      var cal = controller.get('calendar');
//      var sd = controller.get('selectedDate');
//      controller.set('selectedDate', '');
//      for (var w = 0; w < cal.get('length'); w++) {
//        var week = cal.objectAt(w);
//        for (var d = 0; d < 7; d++) {
//          var day = week.daysOfTheWeek[d];
//          if (day.get('displayDate') === sd) {
//            if (!day.get('hasProposedTrip')) {
//              day.set('memberStatus', 'You are planning a ride with ');
//            }
//            day.set('memberStatus',  day.get('memberStatus') + controller.get('partner.fullName'));
//            day.set('hasProposedTrip', true);
//            break;
//          }
//        }
//      }
      return reply.trip.id;
    }).fail(function(e){
      if (e.status === 401) {
        controller.get('controllers.login').send('refreshToken');
      } else {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.trip.detail.create.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.trip.detail.create.id,
            dialogText: Em.I18n.translations.error.trip.detail.create.message
          });

        Ember.Logger.error('trip detail save: ' + JSON.stringify(e));
      }
      return 0;
    });
  }
});

export default TripDetailMixinController;
