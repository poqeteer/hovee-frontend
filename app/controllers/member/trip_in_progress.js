import timezonejsDate from 'appkit/utils/timezonejs_date';
import modalMenu from 'appkit/utils/modal_menu';
import BaseTrip from 'appkit/mixins/base_trip';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var MemberTripInProgressController = Ember.ObjectController.extend(BaseTrip, {
  needs: ['application', 'login', 'currentMember', 'member'],

  messages: [{fullName: 'test', message: 'simple test message'}],

  pollingEnabled: false,

  readTIPActions: function(controller, trip) {
    // Be careful messing with these flags. They control if the updates in base_trip fire!
    // They have to be enabled to stop the updates happening as we change the values below.
    controller.set('inHomeDepartureTimeChange', true);
    controller.set('inWorkDepartureTimeChange', true);

    var isDriver = controller.get('isDriver');
    var isReturnTrip = controller.get('isReturnTrip');
    var computeOtherTimes = function ( time ) {
      var d = timezonejsDate('April 1, 1970 ' + time);
      var newTime;
      if(controller.get('currentState.status') < 1) return;
      if (controller.get('timePassengerHomeToPassengerWork') === 0) controller.setTravelTimes();
      if(controller.get('currentState.status') < 3) {
        //  3-All passengers picked up
        newTime = new TimeDateFormatting().formatNextTime(d, isReturnTrip ? controller.get('timeDriverWorkToPassengerWork') : controller.get('timeDriverHomeToPassengerHome'));
        if (isDriver) {
          if (isReturnTrip) {
            controller.set('passengerWorkPickupTime', newTime);
          } else {
            controller.set('passengerHomePickupTime', newTime);
          }
        } else {
          if (isReturnTrip) {
            controller.set('workDepartureTime', newTime);
          } else {
            controller.set('homeDepartureTime', newTime);
          }
        }
      }
      if(controller.get('currentState.status') < 4) {
        //  4-Passenger dropped off
        newTime = new TimeDateFormatting().formatNextTime(d, isReturnTrip ? controller.get('timeDriverWorkToPassengerWork') + controller.get('timePassengerWorkToPassengerHome') :
                                                                            controller.get('timeDriverHomeToPassengerHome') + controller.get('timePassengerHomeToPassengerWork'));
        if (isReturnTrip) {
          controller.set('passengerHomeDropOffTime', newTime);
        } else {
          controller.set('passengerWorkDestTime', newTime);
        }
      }
      if(controller.get('currentState.status') < 5) {
        //  5-Driver Arrived/Trip Completed
        newTime = new TimeDateFormatting().formatNextTime(d, isReturnTrip ? controller.get('timeDriverWorkToPassengerWork') + controller.get('timePassengerWorkToPassengerHome') + controller.get('timePassengerHomeToDriverHome') :
                                                                            controller.get('timeDriverHomeToPassengerHome') + controller.get('timePassengerHomeToPassengerWork') + controller.get('timePassengerWorkToDriverWork'));
        if (isReturnTrip) {
          controller.set('driverHomeArrivalTime', newTime);
        } else {
          controller.set('driverWorkDestTime', newTime);
        }
      }
    };

    //this.get('memberIsDriver') ? this.get('timeDriverHomeToPassengerHome') : 0) + this.get('timePassengerHomeToPassengerWork') + this.get('timePassengerWorkToDriverWork')

    // controller.store.findQuery('tip_action', {tripId: trip.get('id')}). <-STUPID EMBER this work! It is setup just like rinRequests and doesn't work.
    // This should be faster anyway...
    Ember.$.get(Ember.ENV.APIHOST + '/trips/' + trip.get('id') + '/tip-actions').then(function(responses) {
      responses.tipActions.forEach(function(response){
        var time = new TimeDateFormatting().formatTime(response.messageTimestamp);
        switch(response.status) {
          case 0: //  0-Trip not started
            break;
          case 1: //  1-Driver en-route
            if (isDriver) {
              if (isReturnTrip) {
                controller.set('workDepartureTime', time);
              } else {
                controller.set('homeDepartureTime', time);
              }
            } else {
              if (isReturnTrip) {
                controller.set('passengerWorkPickupTime', time);
              } else {
                controller.set('passengerHomePickupTime', time);
              }
            }
            break;
          case 2: //  2-First passenger picked-up (not used MVP)
            break;
          case 3: //  3-All passengers picked up
            if (isDriver) {
              if (isReturnTrip) {
                controller.set('passengerWorkPickupTime', time);
              } else {
                controller.set('passengerHomePickupTime', time);
              }
            } else {
              if (isReturnTrip) {
                controller.set('workDepartureTime', time);
              } else {
                controller.set('homeDepartureTime', time);
              }
            }
            break;
          case 4: //  4-Passenger dropped off
            if (isReturnTrip) {
              controller.set('passengerHomeDropOffTime', time);
            } else {
              controller.set('passengerWorkDestTime', time);
            }
            break;
          case 5: //  5-Driver Arrived/Trip Completed
            if (isReturnTrip) {
              controller.set('driverHomeArrivalTime', time);
            } else {
              controller.set('driverWorkDestTime', time);
            }
            break;
        }
        computeOtherTimes(time);
      });
    });
  },

  init: function () {

    var controller = this,
        stateDriverTxt    = ["Start Trip",         "Picked up Rider",  "",                 "Dropped off Rider",      "I've Arrived",         "Rate Trip"],
        statePassengerTxt = ["Waiting for Driver", "Join Trip",        "",                 "I've Arrived",           "",                     "Rate Trip"],
        headerStatusTxt   = ["Trip Not Started",   "Driver in Route",  "Passenger Pick-up","Trip in Progress",       "Passenger Arrived",    "Trip Completed"];
    var gw = new GroupWaypoints();

    function myLoop() {           //  create a loop function
      setTimeout(function () {    //  call a 5s setTimeout when the loop is called
        if (controller.get('pollingEnabled')) {
          // Actually there is a timer in the refreshToken so only fires once it time out.
          controller.get('controllers.login').send('refreshToken', false);
          controller.get('model').reload()
            .then(function(trip) {

              var status = Ember.isNone(trip.get('inProgressStatus')) ? 0 : trip.get('inProgressStatus');

              if (status === 0) {
                // Call to compute the times and other stuff to review the trip...
                gw.reviewTrip(controller, trip, controller.get('currentMember.id'));
              }

              controller.set('currentState.status', status);
              controller.set('headerStatus', headerStatusTxt[status]);

              controller.set('infographicUrl', '/assets/img/mobile-infographic-' + (controller.get('isReturnTrip') ? 'inbound' : 'outbound') + '-' + status + '@2x.gif');
              if (controller.get('isDriver')) {
                controller.set('currentState.text', stateDriverTxt[status]);
              } else {
                if (status === 4) status++;
                controller.set('currentState.text', statePassengerTxt[status]);
              }

              if (status > 0) {
                controller.readTIPActions(controller, trip);
              }
            });
          controller.set('pollingEnabled', controller.get('isNextTrip'));
        }

        myLoop();                 //  ..  again which will trigger another
      }, 2000);
    }

    myLoop();                     //  start the loop
  },

  lastMessage: null,

  watchMessages: function() {
    var lastMessage = this.get('lastMessage');
    var lastObject = this.get('messages.lastObject');
    if ((Ember.isNone(lastMessage) && !Ember.isNone(lastObject)) || lastMessage.get('id') !== lastObject.get('id')) {
      this.set('lastMessage', lastObject);
      if (lastObject.get('sender.id') !== this.get('currentMember.id')) {
        this.set('newMessage', "*");
      }
    }
  }.observes('messages'),

  watchStatus: function() {
    var status = this.get('currentState.status');
    // driver left
    if (status >= 1) {
      $('.time1').addClass('time-green');
    }
    // passenger joined
    if (status >= 3) {
      $('.d-home').addClass('dim');
    }
    //
    if (status >= 4) {
      $('.p-home').addClass('dim');
    }
    if (status >= 5) {
      $('.p-work').addClass('dim');
      $('.time4').addClass('time-green');
    }
  }.observes('currentState.status'),

  memberId: null,
  tripId: null,
  partner: null,
  isDriver: false,
  isDriverTxt: 'f',
  driverFirstName: null,
  passengerFirstName: null,
  isReturnTrip: false,
  tripDate: null,
  driverDepartTime: null,
  riderPickupTime: null,
  riderArriveTime: null,
  driverArriveTime: null,
  mobileHeaderString: function() {
    return this.get('tripDate');
  }.property('tripDate'),

  isNextTrip: false,    // is this the next trip?

  headerStatus: "Trip",

  infographicUrl: '/assets/img/mobile-infographic-outbound-0@2x.gif',

  currentState: {
    text: "Trip Details",
    status: 0
  },

  // These may hold the current locations if this is from the Ride Match or the trips locations if from Calendar
  mHomeLocation: null,
  mWorkLocation: null,
  pHomeLocation: null,
  pWorkLocation: null,

  newMessage: "",
  userMessage: "test message",

  showAddress: function(title, address) {
    new GenericModalDialog().modalDialog(
      {
        dialogTitle: title,
        dialogImageUrl: '/assets/img/icon-car-blue.png',
        dialogText: address
      });    
  },
  
  actions: {

    upperLeftTap: function() {
      if (this.get('isReturnTrip')){
        if (this.get('isDriver')) {
          this.showAddress('Your work location', this.get('mWorkLocation.addressCityState'));
        } else {
          this.showAddress(this.get('partner.possessiveFirstName') + ' work location', this.get('pWorkLocation.addressCityState'));
        }
      } else {
        if (this.get('isDriver')) {
          this.showAddress('Your home location', this.get('mHomeLocation.addressCityState'));
        } else {
          this.showAddress(this.get('partner.possessiveFirstName') + ' home location', this.get('pHomeLocation.addressCityState'));
        }        
      }
    },
    upperRightTap: function() {
      if (this.get('isReturnTrip')){
        if (this.get('isDriver')) {
          this.showAddress(this.get('partner.possessiveFirstName') + ' work location', this.get('pWorkLocation.addressCityState'));
        } else {
          this.showAddress('Your work location', this.get('mWorkLocation.addressCityState'));
        }
      } else {
        if (this.get('isDriver')) {
          this.showAddress(this.get('partner.possessiveFirstName') + ' home location', this.get('pHomeLocation.addressCityState'));
        } else {
          this.showAddress('Your home location', this.get('mHomeLocation.addressCityState'));
        }
      }
    },
    lowerLeftTap: function() {
      if (this.get('isReturnTrip')){
        if (this.get('isDriver')) {
          this.showAddress(this.get('partner.possessiveFirstName') + ' home location', this.get('pHomeLocation.addressCityState'));
        } else {
          this.showAddress('Your home location', this.get('mHomeLocation.addressCityState'));
        }
      } else {
        if (this.get('isDriver')) {
          this.showAddress(this.get('partner.possessiveFirstName') + ' work location', this.get('pWorkLocation.addressCityState'));
        } else {
          this.showAddress('Your work location', this.get('mWorkLocation.addressCityState'));
        }
      }
    },
    lowerRightTap: function() {
      if (this.get('isReturnTrip')){
        if (this.get('isDriver')) {
          this.showAddress('Your home location', this.get('mHomeLocation.addressCityState'));
        } else {
          this.showAddress(this.get('partner.possessiveFirstName') + ' home location', this.get('pHomeLocation.addressCityState'));
        }
      } else {
        if (this.get('isDriver')) {
          this.showAddress('Your work location', this.get('mWorkLocation.addressCityState'));
        } else {
          this.showAddress(this.get('partner.possessiveFirstName') + ' work location', this.get('pWorkLocation.addressCityState'));
        }
      }
    },

    tripMessage: function () {
      window.location.assign('#/members/' + this.get('currentMember.id') + '/trip_in_progress_message/' + this.get('tripId') + '/' + this.get('partner.id') + '/' + this.get('isDriverTxt'));
    },

    tripOptions: function () {
      var controller = this;
      var partnerName = this.get('partner.firstName');
//      var memberName = this.get('controllers.currentMember.member.firstName');
      var partnerId = this.get('partner.id');
      var tripId = this.get("parentTripId");
      if (tripId === 0) tripId = this.get("tripId");
      var partnerPhone = this.get("partner.mobilePhone");
      var isDriver = this.get('isDriver');
      var isReturnTrip = this.get('isReturnTrip');
      var isOwner = this.get('ownerId') === this.get('controllers.currentMember.member.id');

//      var driverDestination;
//      if (isDriver) {
//        if (isReturnTrip) {
//          driverDestination = this.get('mHomeLocation.homeAddress');
//        } else {
//          driverDestination = this.get('mWorkLocation.workAddress');
//        }
//      } else {
//        if (isReturnTrip) {
//          driverDestination = this.get('pHomeLocation.homeAddress');
//        } else {
//          driverDestination = this.get('pWorkLocation.workAddress');
//        }
//      }

      var plankTripDetails = {
            title: "Trip Details",
            iconClass: "fa fa-list-ul",
            handler: null,
            transition: function() {
              controller.transitionToRoute('member.trip_proposal', partnerId, tripId, 0);
            }
          };

      var plankStartingTripNow = {
            title: "Starting Trip",
            iconClass: "fa fa-road",
            handler: function() {
              controller.send("tripState");
            },
            transition: null
          };

      var plankPickedUpRider = {
            title: partnerName + " is in the car",
            iconClass: "fa fa-check",
            handler: function() {
              controller.send("tripState");
            },
            transition: null
          };

      var plankDroppedOffRider = {
            title: partnerName + " dropped off",
            iconClass: "fa fa-check-square-o",
            handler: function() {
              controller.send("tripState");
            },
            transition: null
          };

      var plankCompletedTrip = {
            title: "Made it! Trip Complete",
            iconClass: "fa fa-repeat",
            handler: function() {
              controller.send("tripState");
            },
            transition: null
          };

      var plankRateTrip = {
            title: "Rate trip",
            iconClass: "fa fa-star",
            handler: function() {
              controller.send("tripState");
            },
            transition: null
          };


       // currently not used

      // var plankRunningLate = {
      //       title: "Running late!",
      //       iconClass: "fa fa-clock-o",
      //       handler: function() { window.alert("I'm running late");},
      //       transition: null
      //     };

       // var plankCancel = {
       //      title: "Have to cancel!",
       //      iconClass: "fa fa-bolt",
       //      handler: function() { window.alert("I have to cancel");},
       //      transition: null
       //    };

      // currently not used
      // var plankModifyTrip = {
      //       title: "Modify trip",
      //       iconClass: "fa fa-gears",
      //       handler: null,
      //       transition: function() {
      //         controller.transitionToRoute('member.trip_proposal', partnerId, tripId, 0);
      //       }
      //     };

      var plankMapToPassenger = {
            title: "Map to " + partnerName,
            iconClass: "fa fa-globe",
            handler: function() {
              controller.transitionToRoute('member.trip_map', tripId, isOwner ? isReturnTrip ? 'wx' : 'hx' : isReturnTrip ? 'wy' : 'hy');
            },
            transition: null
          };

      var plankMapToDestination = {
            title: "Map to " + (isReturnTrip ? 'home' : 'work'),
            iconClass: "fa fa-globe",
            handler: function() {
              if(controller.get('currentState.status') < 4) {
                controller.transitionToRoute('member.trip_map', tripId, isOwner ? isReturnTrip ? 'wu' : 'hu' : isReturnTrip ? 'wt' : 'ht');
              } else {
                controller.transitionToRoute('member.trip_map', tripId, isOwner ? isReturnTrip ? 'hy' : 'wy' : isReturnTrip ? 'hx' : 'wx');
              }
            },
            transition: null
          };

      var plankText = {
            title: "Text " + partnerName,
            iconClass: "fa fa-comment-o",
            handler: function() {
              if (partnerPhone && partnerPhone.length === 10) {
                var url = "sms:1" + partnerPhone;
                window.location = url;
              }
            },
            transition: null
          };

      var plankCall = {
            title: "Call " + partnerName,
            iconClass: "fa fa-phone",
            handler: function() {
              if (partnerPhone && partnerPhone.length === 10) {
                var url = "tel:1" + partnerPhone;
                window.location = url;
              }
            },
            transition: null
          };

      var plankProfile = {
            title: partnerName + "'s Profile",
            iconClass: "fa fa-user",
            handler: null,
            transition: function() {
              controller.transitionToRoute('member.profile', partnerId);
            }
          };

      var selectionsMatrix;

      if (isDriver) {
        selectionsMatrix = [
          /* status pre */ [plankTripDetails, plankText, plankCall, plankMapToPassenger, plankProfile],
          /* status 0   */ [plankTripDetails, plankStartingTripNow, plankText, plankCall, plankMapToPassenger, plankProfile],
          /* status 1   */ [plankTripDetails, plankPickedUpRider, plankText, plankCall, plankMapToPassenger, plankProfile],
          /* status 2   */ ["not implemented yet"],
          /* status 3   */ [plankTripDetails, plankDroppedOffRider, plankMapToDestination, plankText, plankCall, plankProfile],
          /* status 4   */ [plankTripDetails, plankCompletedTrip, plankMapToDestination, plankText, plankCall, plankProfile],
          /* status 5   */ [plankTripDetails, plankRateTrip, plankText, plankCall, plankProfile]
        ];
      } else {
        selectionsMatrix = [
          /* status pre */ [plankTripDetails, plankText, plankCall, plankMapToPassenger, plankProfile],
          /* status 0   */ [plankTripDetails, plankText, plankCall, plankProfile],
          /* status 1   */ [plankTripDetails, plankPickedUpRider, plankText, plankCall, plankProfile],
          /* status 2   */ ["not implemented yet"],
          /* status 3   */ [plankTripDetails, plankDroppedOffRider, plankText, plankCall, plankProfile],
          /* status 4   */ [plankTripDetails, plankRateTrip, plankText, plankCall, plankProfile],
          /* status 5   */ [plankTripDetails, plankRateTrip, plankText, plankCall, plankProfile]
        ];
      }

      // TODO - remove text, phone options when browsing from desktop computer
      var status = this.get('currentState.status');
      var isNextTrip = this.get('isNextTrip');
      var matrixRow = isNextTrip ? status + 1 : 0;
      var selections = selectionsMatrix[matrixRow];

      modalMenu(selections);
    },


    tripState: function () {

      var isDriver = this.get('isDriver'),
        recMsg = "",
        senMsg = "",
        status = this.get('currentState.status');

      switch (status) {
        case 0:
          if(!this.get('isNextTrip')){
            var partnerId = this.get('partner.id');
            var tripId = this.get("parentTripId");
            if (tripId === 0) tripId = this.get("tripId");
            this.transitionToRoute('member.trip_proposal', partnerId, tripId, 0);
          } else {
            if (isDriver) {
              var memberPronoun = this.get('currentMember.gender') === 'female' ? "her" : "his";
              recMsg = this.get('currentMember.firstName') + " has left and is on " + memberPronoun + " way to you";
              senMsg = "You left to pick up " + this.get('partner.firstName');
              status = 1;
            } else {
              window.alert("Driver hasn't left yet");
              return;
            }
          }
          break;
        case 1:
          if (isDriver) {
            recMsg = "You have joined the trip";
            senMsg = this.get('partner.firstName') + " has joined the trip";
            status = 3;
          } else {
            recMsg = this.get('currentMember.firstName') + " arrived at work";
            senMsg = "You have arrived at work";
            status = 3;
          }
          break;
//        case 2:
//          break;
        case 3:
          if (isDriver) {
            recMsg = this.get('currentMember.firstName') + " arrived at work";
            senMsg = "You have dropped off " + this.get('currentMember.firstName') + " at work";
            status = 4;
          } else {
            recMsg = this.get('currentMember.firstName') + " arrived at work";
            senMsg = "You have arrived at work";
            status = 4;
          }
          break;
        case 4:
          if (isDriver) {
            recMsg = "This trip is completed";
            senMsg = "This trip is completed";
            status = 5;
            break;
          }
          break;
        case 5:
          this.transitionToRoute("member.trip_rating_and_stats", this.get("tripId"));
          return;
        default:
          Ember.Logger.debug("Interesting status " + status + " shouldn't happen, yet");
          return;
      }

      var tipAction = {
            tipAction: {
              recipientMessage: recMsg,
              senderMessage: senMsg,
              recipientId: this.get('partner.id'),
              senderId: this.get('currentMember.id'),
              status: status
            }
      };

      Ember.$.ajax({
        type: 'POST',
        url: Ember.ENV.APIHOST + '/trips/' + this.get('tripId') + '/tip-actions',
        data: JSON.stringify(tipAction),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(tipAction) {
      }).fail(function(error) {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.trip.in.progress.save.title,
            dialogImageUrl: '/assets/img/icon-car-blue.png',
            dialogImageTitle: Em.I18n.translations.error.trip.in.progress.save.id,
            dialogText: Em.I18n.translations.error.trip.in.progress.save.message
          });
        Ember.Logger.debug('tip route: ' + error.status + ' - ' + error.responseText);
      });

    }
  },

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  }.property('controllers.currentMember.member')
});

export default MemberTripInProgressController;
