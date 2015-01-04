import Spinner from 'appkit/utils/spinner';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import MessageDialog from 'appkit/utils/message_dialog';

var RidesMixinControllerActions = Ember.Mixin.create({
  actions: {
    /**
     * User clicked on the "Invites/Drivers/Passengers" label on top the rides_matches
     */
    scrollToTop: function() {
      $('html, body').animate({ scrollTop: $("#topOfList").offset().top - 280}, 1000);
    },

    toggleThreeButtons: function(name, value, id, other, otherOther) {
      this.set(name, value);
      $(id).addClass('active');
      $(other).removeClass('active');
      $(otherOther).removeClass('active');
    },

    toggleTwoButtons: function(name, value, id, other) {
      this.set(name, value);
      $(id).addClass('active');
      $(other).removeClass('active');
    },

    /**
     * User clicked on the help icon
     */
    openHelp: function() {
      var dialog = $('#ridesHelpDialog');
      if (this.get('controllers.login.onDesktop')) {
        this.set('ridesHelpDialogStyle', "font-size: 1.5em; font-weight: 400; width: 100%;");
      } else {
        this.set('ridesHelpDialogStyle', "font-size: 1.7em; font-weight: 400; width: 100%;");
      }

      if (this.get('showOptions')) {
        this.set('ridesHelpDialogText', ['Please confirm the details of your commute.', ' ', ' ',
          'Click on times to change when you want to start driving or get picked up.']);
      } else {
        // Calendar help
        this.set('ridesHelpDialogText', ["Pick a day that you'd", "like to commute"]);
        if (this.get('showMatches')) {
          if (!this.get('controllers.login.onDesktop')) {
            this.set('ridesHelpDialogStyle', "font-size: 1.2em; font-weight: 400; width: 100%;");
          }
          // Matches help
          var inDriverMode = this.get('driverMode') === 'driver';
          this.set('ridesHelpDialogText', ['These ' + (inDriverMode ? 'passengers' : 'drivers') + ' are the best available matches for your commute.', ' ', ' ',
            (inDriverMode ? 'The “Miles out of your way” number represents how far you have to drive beyond your solo commute to carpool with this person.' : ''), ' ', ' ',
            (inDriverMode ? 'Click “Plan Ride” to offer them a seat.' : 'Click “Plan Ride” to propose a carpool.'),
            'They will get an email and text asking them to respond. If they accept, your carpool is scheduled.']);
        }
      }
      dialog.on('hide.bs.modal', function (e) {
      });
      dialog.modal({"show": true});
    },

    /**
     * User clicked on the home icon on the options page
     */
    openHomeLocationDialog: function() {
      var controller = this;
      var dialog = $('#homeLocationDialog');
      dialog.modal({"show": true});
      dialog.on('show.bs.modal', function () {
        $(document).on('click', '#addHomeLocationDialogButton', function(){
          controller.transitionToRoute('member.profile_main', 'start_edit');
        });
        $(document).on('click', '#updateHomeLocationDialogButton', function(){
          controller.send('updateHomeLocation');
        });
      });
      dialog.on('hide.bs.modal', function (e) {
      });
    },
    /**
     * User clicked on the work icon on the options page
     */
    openWorkLocationDialog: function() {
      var controller = this;
      var dialog = $('#workLocationDialog');
      dialog.modal({"show": true});
      dialog.on('show.bs.modal', function () {
        $(document).on('click', '#addWorkLocationDialogButton', function(){
          controller.transitionToRoute('member.profile_main', 'destination_edit');
        });
        $(document).on('click', '#updateWorkLocationDialogButton', function(){
          controller.send('updateWorkLocation');
        });
      });
      dialog.on('hide.bs.modal', function (e) {
      });
    },

    /**
     * User clicked on a date on the calendar/week
     * @param date
     * @param before
     * @param week
     * @param day
     */
    selectDateFromCalendar: function(date, before, week, day) {
      this.set('onCalendar', true);
      var controller = this;
      this.set('showMonthHelp', false);
      setTimeout(function(){
        if (controller.get('showOptionsHelp') && (Ember.isNone(controller.get('trips')) || controller.get('trips.length')=== 0)) {
          controller.send('openHelp');
        }
        controller.set('showOptionsHelp', false);
      }, controller.get('showHelpSeconds'));
      if (before) {
        //window.alert('Nope in the past');
      } else {
        this.set('selectedWeek', week);
        this.set('selectedDate', date);
        this.set('selectedDay', day);
        this.clearWeekFlags(this);
        var weekHeaders = this.get('weekHeaderFlags');
        var dt = new Date(date);
        this.set(weekHeaders[dt.getDay()], true);
        for(var i=0; i < 7; i++) {
          if (week.objectAt(i).get('timestamp') === date) {
            week.objectAt(i).set('selectedCell', true);
          }
        }
        this.set('showOptions', true);
        this.set('showGoBackHeader', true);
        this.set('showMatches', true);
        setTimeout(function(){
          controller.resetOptionToggles(controller);
        }, 100);
      }
    },

    selectDate: function(date, before, week, day) {
      var controller = this;
      this.set('showMonthHelp', false);
      setTimeout(function(){
        if (controller.get('showOptionsHelp') && (Ember.isNone(controller.get('trips')) || controller.get('trips.length')=== 0)) {
          controller.send('openHelp');
        }
        controller.set('showOptionsHelp', false);
      }, controller.get('showHelpSeconds'));
      if (before) {
        //window.alert('Nope in the past');
      } else {
        this.set('selectedWeek', week);
        this.set('selectedDate', date);
        this.set('selectedDay', day);
        this.clearWeekFlags(this);
        var weekHeaders = this.get('weekHeaderFlags');
        var dt = new Date(date);
        this.set(weekHeaders[dt.getDay()], true);
        for(var i=0; i < 7; i++) {
          if (week.objectAt(i).get('timestamp') === date) {
            week.objectAt(i).set('selectedCell', true);
          }
        }
        if (!this.get("showOptions")) {
          this.set('showGoBackHeader', true);
          this.set('showMatches', true);
          this.send('goToRideMatch');
        }
      }
    },

    displayOptions: function() {
      var controller = this;
      this.set('showOptions', true);
      setTimeout(function(){
        controller.resetOptionToggles(controller);
      }, 100);
    },

    cancelOptions: function() {
      this.set('showMatches', !this.get('onCalendar'));
      this.set('showOptions', false);
    },

    /**
     * User clicked "Cancel" or the back button icon
     */
    backToRidesCalendar: function() {
      this.clearWeekFlags(this);
      this.set('showGoBackHeader', false);
      this.set('showMatches', false);
    },

    /**
     * User just clicked "Looks Good!"...
     */
    goToRideMatch: function() {
      this.set('onCalendar', false);
      this.set('showOptionsHelp', false);
      var trips = this.get('selectedDay.trips');
      if (!Ember.isNone(trips)) {
        this.set('inviteCount', trips.get('length'));
      }
      var statusCode = this.get('selectedDay.statusCode');
      var isDriveMode = this.get('isDriveMode');

      var spinner = new Spinner().create('#888');

      // update profile with times?
      var days = '';
      if (!this.get('showMatches')) {
        var weeklySchedule = '{"weeklySchedule": ';
        var dailySchedule = '{"dailySchedules":[';
        var departures = '"homeDepartureTime":"' + this.get('homeDepartureTime') + '","workDepartureTime":"' + this.get('workDepartureTime') + '"}';
        var schedule = this.get('sched').objectAt(0).get('dailySchedules');
        for (var i = 0; i < 7; i++) {
          if (schedule.objectAt(i).get('id') !== '-1') {
            if (days.length > 0) {
              days += ',';
            }
            days += '{"day":"' + schedule.objectAt(i).get('day') + '", ' + departures;
          }
        }
        if (days.length > 0) {
          weeklySchedule += dailySchedule + days + '],"tag":"PRIMARY"}}';
        } else {
          weeklySchedule += 'null}';
        }
        this.get('controllers.login').send('refreshToken', false);

        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/members/' + this.get('currentMember.id') + '/commute-preferences/schedules/' + this.get('sched').objectAt(0).get('id'),
          data: weeklySchedule,
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          fail(function (e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.schedule.submit.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.schedule.submit.id,
                  dialogText: Em.I18n.translations.error.profile.schedule.submit.message
                });
            }
            Ember.Logger.error('schedule save: ' + JSON.stringify(e));
          });
      }

      // lookup new recommendations...
      this.set('recommendations', null);
      days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      var controller = this;
      this.store.findQuery('recommendation', {memberId: this.get('currentMember.id'), day: days[new Date(this.get('selectedDate')).getDay()], role: this.get('driverMode')}).
        then(function(recommendations){
          recommendations.forEach(function(recommendation){
            controller.processRecommendation(controller, recommendation, trips);
          });
          controller.set('recommendations', recommendations);
          //controller.send('refreshTheMap');
          controller.set('listMapMode', 'list');
          controller.set('showOptions', false);
          controller.set('showLoading', false);
          controller.set('showMatches', true);
          spinner.stop();
          setTimeout(function(){
            if (controller.get('showMatchesHelp') && (Ember.isNone(controller.get('trips')) || controller.get('trips.length')=== 0)) {
              controller.send('openHelp');
            }
            controller.set('showMatchesHelp', false);
          }, controller.get('showHelpSeconds'));
        }).catch(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          } else {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: 'Error during lookup',
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogText: 'Sorry but there was a problem looking up members. Please try again.'
              });
          }
          Ember.Logger.error('schedule save: ' + JSON.stringify(e));
          controller.set('showLoading', false);
          spinner.stop();
        });
      this.set('showLoading', true);
    },

    /**
     * User clicked "Save" on home location edit dialog
     */
    updateHomeLocation: function() {
      var newPrimary = this.get('homeLocation');
      var oldPrimary = this.get('oldHomeLocation');

      // Changes the home primary to location passed in
      this.get('controllers.login').send('refreshToken', false);

      function makeLocationPrimary(controller) {
        var homeLocation = {
          homeLocation: {
            address: {
              street: newPrimary.get('homeAddress.street'),
              address1: newPrimary.get('homeAddress.address1'),
              city: newPrimary.get('homeAddress.city'),
              state: newPrimary.get('homeAddress.state'),
              zip: newPrimary.get('homeAddress.zip'),
              country: newPrimary.get('homeAddress.country')
            },
            latitude: newPrimary.get('latitude'),
            longitude: newPrimary.get('longitude'),
            neighborhood: newPrimary.get('neighborhood'),
            name: newPrimary.get('startLocationNickName'),
            tag: 'PRIMARY'
          }
        };
        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/homeLocations/' + newPrimary.get('id'),
          data: JSON.stringify(homeLocation),
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          then(function(){
            controller.set('homeLocations', controller.store.findQuery('homeLocation', {memberId: controller.get('member.id')}));
          }).
          fail(function(e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.from.changePrimary.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.from.changePrimary.id,
                  dialogText: Em.I18n.translations.error.profile.from.changePrimary.message
                });
            }
            Ember.Logger.error('change primary: ' + JSON.stringify(e));
          });

      }

      // Need to find the old primary first...
      if (!Ember.isNone(oldPrimary)) {
        var controller = this;
        var homeLocation = {
          homeLocation: {
            address: {
              street: oldPrimary.get('homeAddress.street'),
              address1: oldPrimary.get('homeAddress.address1'),
              city: oldPrimary.get('homeAddress.city'),
              state: oldPrimary.get('homeAddress.state'),
              zip: oldPrimary.get('homeAddress.zip'),
              country: oldPrimary.get('homeAddress.country')
            },
            latitude: oldPrimary.get('latitude'),
            longitude: oldPrimary.get('longitude'),
            neighborhood: oldPrimary.get('neighborhood'),
            name: oldPrimary.get('startLocationNickName'),
            tag: (new Date().getTime()) + 'x'       // No need for timezoneJS, this is just to put something unique in here
          }
        };
        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/homeLocations/' + oldPrimary.get('id'),
          data: JSON.stringify(homeLocation),
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          then(function(){
            makeLocationPrimary(controller);
          }).
          fail(function(e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.from.changePrimary.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.from.changePrimary.id,
                  dialogText: Em.I18n.translations.error.profile.from.changePrimary.message
                });
            }
            Ember.Logger.error('change ~primary: ' + JSON.stringify(e));
          });
      } else {
        makeLocationPrimary(this);
      }

      this.set('oldHomeLocation', newPrimary);
      this.set('member.homeLocation', newPrimary);
    },

    /**
     * User clicked "Save" on work location edit dialog
     */
    updateWorkLocation: function() {
      var member = {member: {companyLocationId: this.get('workLocation.id')}};
      var controller = this;
      Ember.$.ajax({
        type: 'PUT',
        url: Ember.ENV.APIHOST + '/members/' + this.get('member.id'),
        data: JSON.stringify(member),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(){
          controller.set('member.workLocation', controller.get('workLocation'));
        }).
        fail(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          }
          Ember.Logger.error('profile save: ' + JSON.stringify(e));
        });

    },

    /**
     * User clicked "Invite/Review/Respond" on recommendation cell
     */
    doInvite: function(memberId, tripMode, selectedDate, day) {
//      if (day.get('statusCode') === '2') {
//        var trip = day.get('trips').objectAt(0);
//        if (trip.get('nextTripReturn')) {
//          this.transitionToRoute('member.trip_in_progress', trip.get('returnTIPId'), trip.get('nextTripReturnStr'));
//        } else {
//          this.transitionToRoute('member.trip_in_progress', trip.get('outboundTIPId'), trip.get('nextTripOutboundStr'));
//        }
//      } else
      this.transitionToRoute('member.trip_proposal', this.get('member.id'), memberId, tripMode + (this.get('driverMode') === 'driver' ? -10 : -20), selectedDate);
    },

    /**
     * User clicked "Profile" on recommendation cell
     */
    viewProfile: function(memberId, tripMode, selectedDate, trip) {
      // Kludge... Okay I'm cheating a bit here. Setting the controller values before doing the route. Saves having to
      // pass the vars or creating globals.
      var controller = this.controllerFor('member.profile');
      controller.set('selectedDate', selectedDate);
      controller.set('tripMode', Ember.isNone(trip) ? tripMode + (this.get('driverMode') === 'driver' ? -10 : -20) : trip);
      this.transitionToRoute('member.profile', memberId);
    },

    /**
     * User clicked on the "Agenda" box...
     * @param trip
     */
    jump: function(trip) {
      if (trip.get('statusCode') === '2' && !this.get('controllers.login.onDesktop') && trip.get('nextTrip')) {
        if (trip.get('nextTripReturn') || trip.get('outboundTIPId') === 0) {
          this.transitionToRoute('member.trip_in_progress', trip.get('returnTIPId'), trip.get('nextTripReturnStr'));
        } else {
          this.transitionToRoute('member.trip_in_progress', trip.get('outboundTIPId'), trip.get('nextTripOutboundStr'));
        }
      } else {
        this.transitionToRoute('member.trip_proposal', this.get('member.id'), trip.get('isOwnerCurrentMember') ? trip.get('rider.id') : trip.get('owner.id') , trip.get('id'), 0);
      }
    },

    /**
     * User clicked on the "Send Message" button...
     */
    sendMessage: function(whoToId, whoToName) {
      this.set('whoToId',whoToId);
      this.set('whoToName',whoToName);
      // Prefixed to each Twillo message... So have to limit the length
      var limit = 'message from ' + this.get('currentMember.fullName') + ' via hovee: ';
      new MessageDialog().modalDialog(
        {
          dialogTitle: 'Message ' + whoToName,
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: 'Enter your message here',
          controller: this,
          limit: 160 - limit.length,
          actionText: 'Send', actionClass: 'btn-success', func: this.sendTheMessage,
          cancelText: 'Cancel', cancelClass: 'btn-default'
        }, !this.get('controllers.login.onDesktop'));
    }
  },

  whoToId: null,
  whoToName: null,

  // Sends the user message via twillio... NOTE: I know this is bad, but dup'ed code in trip_detail_mixin_controller. This is temp until we get hovee messaging running?
  sendTheMessage: function(controller, msg) {
    var sms_messages =
    {
      smsMessage: {
        recipientId: controller.get('whoToId'),
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
            dialogText: 'We sent your message via text to ' + controller.get('whoToName')
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
  }
});

export default RidesMixinControllerActions;