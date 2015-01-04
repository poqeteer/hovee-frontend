import BaseTrip from 'appkit/mixins/base_trip';
import TripDetailMixinController from 'appkit/mixins/trip_detail_mixin_controller';
import modalMenu from 'appkit/utils/modal_menu';
import MessageDialog from 'appkit/utils/message_dialog';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var MemberTripProposalController = Ember.ObjectController.extend(BaseTrip, TripDetailMixinController, {

  cw: [],
  selectedWeek: null,
  selectedDay: null,
  inviteCount: 0,

  // Calender header
  sundaySelected: false,
  mondaySelected: false,
  tuesdaySelected: false,
  wednesdaySelected: false,
  thursdaySelected: false,
  fridaySelected: false,
  saturdaySelected: false,
  weekHeaderFlags: ['sundaySelected','mondaySelected','tuesdaySelected','wednesdaySelected','thursdaySelected','fridaySelected','saturdaySelected'],


  //!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // This is all for mobile...

  infographicUrl: '/assets/img/mobile-infographic-outbound-0@2x.gif',
  isReturnTrip: false,

  direction: 'out',

  hght: "height: 480px",

  showPickADay: false,

  noteAttached: "",

  watchdirection: function() {
    if (this.get('direction') === 'out') {
      this.set('infographicUrl', '/assets/img/mobile-infographic-outbound-0@2x.gif');
      this.set('isReturnTrip', false);
    } else {
      this.set('infographicUrl', '/assets/img/mobile-infographic-inbound-0@2x.gif');
      this.set('isReturnTrip', true);
    }
  }.observes('direction'),

  watchSelectedDriverMode: function() {
    if (this.get('selectedDriverMode') === 'driver') {
      $('#ml').addClass('active');
      $('#pl').removeClass('active');
    } else {
      $('#ml').removeClass('active');
      $('#pl').addClass('active');
    }
  }.observes('selectedDriverMode'),

  memberIsDriver: function() {
    return this.get('selectedDriverMode') === 'driver';
  }.property('selectedDriveMode'),

  showAddress: function(title, address) {
    new GenericModalDialog().modalDialog(
      {
        dialogTitle: title,
        dialogImageUrl: '/assets/img/icon-car-blue.png',
        dialogText: address
      });
  },

  actions: {

    selectDate: function(timestamp, before, selectedWeek, day) {
      var dt = timezonejsDate(timestamp);
      var d = new TimeDateFormatting().formatDateMonthDayYear(dt);
      this.set('selectedDate', d);

      this.set('selectedDay', day);
      var weekHeaders = this.get('weekHeaderFlags');
      for (var i = 0; i < 7; i++) {
        if (selectedWeek.objectAt(i).get('timestamp') === timestamp) {
          selectedWeek.objectAt(i).set('selectedCell', true);
        } else {
          selectedWeek.objectAt(i).set('selectedCell', false);
        }
        this.set(weekHeaders[i], false);
      }
      this.set(weekHeaders[dt.getDay()], true);
    },

    upperLeftTap: function() {
      var title, address;
      if (this.get('isReturnTrip')){
        if (this.get('memberIsDriver')) {
          title = 'Your work location';
        } else {
          title = this.get('partner.possessiveFirstName') + ' work location';
        }

        if (this.get('isAccepted')) {
          address = this.get('driverWorkAddressCityState');
        } else {
          address = this.get('driverWorkName');
        }
      } else {
        if (this.get('memberIsDriver')) {
          title = 'Your home location';
        } else {
          title = this.get('partner.possessiveFirstName') + ' home location';
        }

        if (this.get('isAccepted')) {
          address = this.get('driverHomeAddressCityState');
        } else {
          address = this.get('driverHomeStreetCityState');
        }
      }
      this.showAddress(title, address);
    },
    upperRightTap: function() {
      var title, address;
      if (this.get('isReturnTrip')){
        if (this.get('memberIsDriver')) {
          title = this.get('partner.possessiveFirstName') + ' work location';
        } else {
          title = 'Your work location';
        }

        if (this.get('isAccepted')) {
          address = this.get('passengerWorkAddressCityState');
        } else {
          address = this.get('passengerWorkName');
        }
      } else {
        if (this.get('memberIsDriver')) {
          title = this.get('partner.possessiveFirstName') + ' home location';
        } else {
          title = 'Your home location';
        }

        if (this.get('isAccepted')) {
          address = this.get('passengerHomeAddressCityState');
        } else {
          address = this.get('passengerHomeStreetCityState');
        }
      }
      this.showAddress(title, address);
    },
    lowerLeftTap: function() {
      var title, address;
      if (this.get('isReturnTrip')){
        if (this.get('memberIsDriver')) {
          title = this.get('partner.possessiveFirstName') + ' home location';
        } else {
          title = 'Your home location';
        }
        if (this.get('isAccepted')) {
          address = this.get('passengerHomeAddressCityState');
        } else {
          address = this.get('passengerHomeStreetCityState');
        }
      } else {
        if (this.get('memberIsDriver')) {
          title = this.get('partner.possessiveFirstName') + ' work location';
        } else {
          title = 'Your work location';
        }
        if (this.get('isAccepted')) {
          address = this.get('passengerWorkAddressCityState');
        } else {
          address = this.get('passengerWorkName');
        }
      }
      this.showAddress(title, address);
    },
    lowerRightTap: function() {
      var title, address;
      if (this.get('isReturnTrip')){
        if (this.get('memberIsDriver')) {
          title = 'Your home location';
        } else {
          title = this.get('partner.possessiveFirstName') + ' home location';
        }
        if (this.get('isAccepted')) {
          address = this.get('driverHomeAddressCityState');
        } else {
          address = this.get('driverHomeStreetCityState');
        }
      } else {
        if (this.get('memberIsDriver')) {
          title = 'Your work location';
        } else {
          title = this.get('partner.possessiveFirstName') + ' work location';
        }
        if (this.get('isAccepted')) {
          address = this.get('driverWorkAddressCityState');
        } else {
          address = this.get('driverWorkName');
        }
      }
      this.showAddress(title, address);
    },

    toggleDirection: function(direction, id, other) {
      this.set('direction', direction);
      $(id).addClass('active');
      $(other).removeClass('active');
    },
    toggleDriver: function(mode, id, other) {
      this.set('selectedDriverMode', mode);
      $(id).addClass('active');
      $(other).removeClass('active');
    },

    showOptions: function() {
      var controller = this;
      var partnerName = this.get('partner.firstName');


      var plankAcceptProposal = {
        title: "Accept Proposal",
        iconClass: "fa fa-check",
        handler: function() {
          controller.send("acceptProposal");
        },
        transition: null
      };

      var plankMakeProposal = {
        title: "Send It",
        iconClass: "fa fa-check",
        handler: function() {
          controller.send("makeProposal");
        },
        transition: null
      };

      var plankProposeRide = {
        title: "Send It",
        iconClass: "fa fa-check",
        handler: function() {
          controller.send("propose");
        },
        transition: null
      };

      var plankMapRoute = {
        title: "&nbsp;&nbsp;&nbsp;Map the Ride",
        iconClass: "fa fa-map-marker",
        handler: function() {
          controller.send("showRoute", true);
        },
        transition: null
      };

      var cancelRideProposal = "Decline Proposal";
      if (this.get('isCurrentMemberOwner')) {
        if (this.get('isWaitingForResponse')) {
          cancelRideProposal = "Cancel Ride Proposal";
        } else {
          cancelRideProposal = "Decline Ride Proposal";
        }
      }

      var plankDeclineProposal = {
        title: cancelRideProposal,
        iconClass: "fa fa-thumbs-down",
        handler: function() {
          controller.send("declineProposal");
        },
        transition: null
      };

      var plankCancelTrip = {
        title: 'Cancel Trip',
        iconClass: "fa fa-thumbs-down",
        handler: function() {
          controller.send("cancelProposal");
        },
        transition: null
      };

      var plankDone = {
        title: "&nbsp;Cancel",
        iconClass: "fa fa-times-circle",
        handler: function() {
          controller.send("done");
        },
        transition: null
      };

      var plankCancelEdit = {
        title: "&nbsp;Cancel Edit",
        iconClass: "fa fa-times",
        handler: function() {
          controller.send("cancel");
        },
        transition: null
      };

      var plankAttachNote = {
        title: "Note to " + this.get('partner.firstName'),
        iconClass: "fa fa-edit",
        handler: function() {
          controller.send('attachNote');
        },
        transition: null
      };

      var plankSendMessage = {
        title: "Message " + partnerName,
        iconClass: "fa fa-comment-o",
        handler: function() {
          controller.send("sendMessage");
        },
        transition: null
      };

      var plankMakeChanges = {
        title: "Make Changes",
        iconClass: "fa fa-pencil",
        handler: function() {
          controller.send("proposeChanges");
        },
        transition: null
      };

      var plankCall = {
        title: "Call " + this.get('partner.firstName'),
        iconClass: "fa fa-phone",
        handler: function() {
          window.location = "tel:1" + controller.get('partner.mobilePhone');
        },
        transition: null
      };

      var selections;

      if (this.get('rideProposal')) {
        if (this.get('editing')) {
          selections = [plankProposeRide, plankCancelEdit, plankAttachNote, plankMapRoute];
        } else if (this.get('isAccepted')) {
          selections = [plankSendMessage, plankCall, plankCancelTrip, plankMapRoute];
        } else {
          if(this.get('isWaitingForResponse')) {
            selections = [plankDeclineProposal, plankMapRoute];
          } else {
            selections = [plankAcceptProposal, plankMakeChanges, plankDeclineProposal, plankAttachNote, plankMapRoute];
          }
        }
      } else {
        selections = [plankMakeProposal, plankDone, plankAttachNote, plankMapRoute];
      }

      modalMenu(selections);
    },

    attachNote: function() {
      new MessageDialog().modalDialog(
        {
          dialogTitle: 'Attach a note',
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: 'Enter note for ' + this.get('partner.firstName'),
          controller: this,
          message: this.get('personalMessage'),
          limit: 300,
          actionText: 'Attach', actionClass: 'btn-success', func: this.attachTheNote,
          cancelText: 'Cancel', cancelClass: 'btn-default'
        }, !this.get('controllers.login.onDesktop'));
      }
    },

  attachTheNote: function(controller, msg) {
    controller.set('personalMessage', msg);
    if (msg.length > 0) controller.set('noteAttached', "You've attached a note");
  }
});

export default MemberTripProposalController;
