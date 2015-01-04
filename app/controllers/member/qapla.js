/**
 * Created by lancemock on 10/14/14.
 */
import BaseTrip from 'appkit/mixins/base_trip';
import TripDetailMixinController from 'appkit/mixins/trip_detail_mixin_controller';

import Spinner from 'appkit/utils/spinner';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var MemberQaplaController = Ember.ObjectController.extend(BaseTrip, TripDetailMixinController, {
  needs: ['application', 'login', 'member'],

  matchTwo: null,
  choice: null,

  memberId: null,
  partner: null,

  timeFrame: "next week",

  yesButtonText: "Looks Good",
  yesButtonLabel: function() {
    return "Send the invite to " + this.get('partner.firstName');
  }.property('partner.firstName'),
  noButtonText: "Pass",
  noButtonLabel: "I'm not interested",
  newButtonText: "Rain Check",
  newButtonLabel: function() {
    return "See if " + this.get('partner.firstName') + " can ride another day or time";
  }.property('partner.firstName'),
  tripDetailText: "proposal",
  tripDetailButton: "View Proposal",
  spinButtonText: "Spin Again",
  spinButtonLabel: "Show me someone else",

  disableTry: false,

  switchOnQuestions: false,
  qapla: false,
  tripId: null,

  thoughts: "",

  pageStyle: "display: none",
  buttonRowStyle: "",
  bigBtn: false,

  init: function() {
    if (!this.get('controllers.login.onDesktop')){
//      this.set('yesButtonText', 'Yes');
//      this.set('noButtonText', 'No');
//      this.set('yesButtonLabel', null);
//      this.set('noButtonLabel', null);
//      this.set('newButtonLabel', null);
      this.set('tripDetailText', 'trip details');
      this.set('tripDetailButton', 'Trip Details');

      if (window.innerWidth > 320) {
        this.set('buttonRowStyle', 'width: 340px; text-align: center;');
        this.set('bigBtn', true );
      } else {
        this.set('buttonRowStyle', "text-align: center;");
      }
    }
  },

  partnerGender: function() {
    return (this.get('partner.gender') === 'female' ? 'She' : 'He');
  }.property('partner.gender'),

  updateStatus: function(status, matchTwoId, tripId) {
    var matchTwo = {matchTwo:{status: status, tripId: tripId}};
    Ember.$.ajax({
      type: 'PUT',
      url: Ember.ENV.APIHOST + '/matchTwos/' + matchTwoId,
      data: JSON.stringify(matchTwo),
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).fail(function(error){
      window.console.error('updated status error: ' + error.status + ' : ' + JSON.stringify(error));
    });
  },

  actions: {
    notInterested: function() {
      this.updateStatus(0, this.get('matchTwo.id'), 0);
      this.set('switchOnQuestions', true);
    },
    makeProposal: function() {
      var spinner = new Spinner().create();

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

      var memberAsDriverOutboundLeg = this.get('matchTwo.memberAsDriver.outboundLeg'),  // pointer to the outbound leg for the member
          riderAsDriverOutboundLeg =  this.get('matchTwo.riderAsDriver.outboundLeg');   // pointer to the outbound leg for the rider
      var memberAsDriver = null,                                                        // initially we'll assume there is memberAsDriver data
          riderAsDriver = null;                                                         // initially we'll assume there is riderAsDriver data

      var outboundLeg, returnLeg;

      // if there isn't an outbound leg, then no data for the member (probably doesn't have a car)
      if (!Ember.isNone(memberAsDriverOutboundLeg)) {
        var memberAsDriverReturnLeg = this.get('matchTwo.memberAsDriver.returnLeg');
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
        var riderAsDriverReturnLeg = this.get('matchTwo.riderAsDriver.returnLeg');
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
        driverId:        this.get('memberId'),
        pickupTimestamp: this.get('matchTwo.pickupTimestamp'),
        returnTimestamp: this.get('matchTwo.returnTimestamp'),
        riderAsDriver:   riderAsDriver,
        memberAsDriver:  memberAsDriver,
        status:          0
      }};
      Ember.Logger.debug('trip being posted:', trip);
      trip = JSON.stringify(trip);

      var controller = this;
      Ember.$.ajax({
        type: 'POST',
        url: Ember.ENV.APIHOST + '/members/' + this.get('memberId') + '/trips',
        data: trip,
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(reply){

        // Have to set the selectedDate for the dialog...
        controller.set('selectedDate', new TimeDateFormatting().formatDateMonthDayYear(parseInt(controller.get('matchTwo.pickupTimestamp'), 10)));

        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Ride Proposal Sent',
            dialogImageUrl: Ember.isNone(controller.get('partner.profilePhotoUrl')) ? '/assets/img/ios-bookmark-icon.png' : controller.get('partner.profilePhotoUrl'),
            dialogText: 'You asked ' + controller.get('partner.firstName') + ' to ride with you on ' + controller.genSelectedDate(controller)
          });

        controller.set('tripId', reply.trip.id);
        controller.set('qapla', true);

        controller.updateStatus(1, controller.get('matchTwo.id'), reply.trip.id);

        spinner.stop();
      }).fail(function(e) {
        if (e.status === 401) {
          controller.get('controllers.login').send('refreshToken');
        } else if (e.status === 409) {
          new GenericModalDialog().modalDialog(
            {
              dialogTitle: Em.I18n.translations.error.trip.detail.create.title,
              dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
              dialogText: 'Sorry but there was a conflict while creating the trip. Either you or your partner already has a trip schedule for this day. Use "Rain Check" to choose another day.'
            });
          controller.set('disableTry', true);
        } else {
          new GenericModalDialog().modalDialog(
            {
              dialogTitle: Em.I18n.translations.error.trip.detail.create.title,
              dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
              dialogImageTitle: Em.I18n.translations.error.trip.detail.create.id,
              dialogText: Em.I18n.translations.error.trip.detail.create.message
            });

        }
        Ember.Logger.error('trip detail save: ' + JSON.stringify(e));
        spinner.stop();
      });
    },
    new: function() {
      this.updateStatus(2, this.get('matchTwo.id'), 0);
      if (this.get('controllers.login.onDesktop')) {
        this.transitionToRoute('member.trip_proposal', this.get('partner.id'), '0', 0);
      } else {
        this.transitionToRoute('member.pick_date', this.get('partner.id'));
      }
    },
    spinMe: function(){
      this.updateStatus(3, this.get('matchTwo.id'), 0);
      this.transitionToRoute('member.rides');
    },
    words: function() {
      this.transitionToRoute('member.rides', this.get('controllers.member.id'));
      window.alert('TBD post thoughts: ' + this.get('thoughts'));
    },
    cancel: function() {
      this.transitionToRoute('member.rides', this.get('controllers.member.id'));
    },
    profilePartner: function() { // This is for route to call...
      var controller = this;
      setTimeout(function(){
        controller.controllerFor('member.profile').set('selectedDate', -1);
        controller.controllerFor('member.profile').set('tripMode', -10);
        controller.transitionToRoute('member.profile', controller.get('partner.id'));
      }, 100);
    }
  }
});

export default MemberQaplaController;