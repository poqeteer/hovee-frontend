import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import MapDialog from 'appkit/utils/map_dialog';
import modalMenu from 'appkit/utils/modal_menu';
import MessageDialog from 'appkit/utils/message_dialog';

import ProfileMixinController from 'appkit/mixins/profile_mixin_controller';
import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';

var MemberProfileController = Ember.ObjectController.extend(ProfileMixinController, TaglineMixinController, {
  needs: ['application', 'currentMember', 'login', 'member'],

  memberId: null, // needed for LinkedIn view var access

  isPreview: false,

  mobileHeaderString: "Profile",

  //For rides...
  tripMode: null,
  selectedDate: null,
  isSelectedDate: function (){
    return this.get('selectedDate') > 1;
  }.property('selectedDate'),
  isDriver: function() {
    return this.get('tripMode') > -20;
  }.property('tripMode'),
  isTrip:function (){
    try {
      return this.get('tripMode').get('constructor.typeKey') === 'trip';
    } catch(e) {
      return false;
    }
  }.property('tripMode'),

  jobHeadline: function(key, headlineString) {
    if (arguments.length > 1) {
      //Ember.Logger.debug('MemberProfileController.jobHeadline(', headlineString, ')');
      this.set('model.jobHeadline', headlineString);
    }
    return this.get('model.jobHeadline');
  }.property('model.jobHeadline'),

  hasLinkedInInfo: function() {
    return this.get('model.linkedInProfile') !== null;
  }.property('model.linkedInProfile'),

  linkedInId: function() {
    return this.get('model.linkedInProfile.id');
  }.property('model.linkedInProfile.id'),

  linkedInProfileUrl: function() {
    return this.get('model.linkedInProfile.publicProfileUrl');
  }.property('model.linkedInProfile.publicProfileUrl'),

  isMembersProfile: false,

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  }.property('controllers.currentMember.member'),

  listeningPreferences: [],
  musicPreferences: [],

  refresh: false,

  actions: {
    refreshOnce: function() {
      if (this.get('refresh')) {
        this.set('refresh', false);
        setTimeout(function () {
          location.reload(true);
        }, 500);
      }
    },
    togglePreview: function() {
      this.set('isPreview', !this.get('isPreview'));
    },

    schedule: function() {
      if (this.get('tripMode.isStatusInProgress')) {
        this.transitionToRoute('member.trip_in_progress', this.get('currentMember.id'), this.get('id'), this.get('isTrip') ? this.get('tripMode.id') : this.get('tripMode'), this.get('selectedDate'));
      } else {
        this.transitionToRoute('member.trip_proposal', this.get('currentMember.id'), this.get('id'), this.get('isTrip') ? this.get('tripMode.id') : this.get('tripMode'), this.get('selectedDate'));
      }
    },

    pickADay: function() {
      this.transitionToRoute('member.pick_date', this.get('currentMember.id'), this.get('id'));
    },

    rideMatches: function (){
      this.transitionToRoute('member.rides', this.get('currentMember.id'));
    },

    editProfile: function() {
      this.transitionToRoute('member.profile_main', 'work');
    },

    showMemberOptions: function() {
      var controller = this;

      var plankEditProfile = {
        title: "Edit Profile",
        iconClass: "fa fa-pencil",
        handler: function() {
          controller.send('editProfile');
        },
        transition: null
      };

      var plankChangePassword = {
        title: "Change Password",
        iconClass: "fa fa-lock",
        handler: null,
        transition: function() {
          controller.transitionToRoute("member.account_management");
        }
      };

      modalMenu([plankEditProfile, plankChangePassword]);
    },

    showOptions: function() {
      var controller = this;

      var plankPickADay;
      if (this.get('selectedDate')){
        var title = 'Plan Ride';
        if (this.get('isTrip')) {
          if (this.get('tripMode.isStatusInNegotiation')) {
            // potential action req'd
            if (this.get('tripMode.isActionRequired')) {
              title = 'Respond!';
            } else {
              title = 'Review Trip';
            }
          } else {
            if (this.get('tripMode.isStatusAccepted')) {
              //No Action required on user's behalf
              title = 'Trip Confirmed';
            } else {
              if (this.get('tripMode.isStatusInProgress')) {
                title = 'Trip Live';
              } else {
                if (this.get('tripMode.isStatusComplete')) {
                  title = 'Trip Done';
                }
              }
            }
          }
        }
        plankPickADay = {
          title: title,
          iconClass: "fa fa-calendar",
          handler: function () {
            controller.send('schedule');
          },
          transition: null
        };
      } else {
        plankPickADay = {
          title: "Pick a Day",
          iconClass: "fa fa-calendar",
          handler: function () {
            controller.transitionToRoute('member.pick_date', controller.get('currentMember.id'), controller.get('id'));
          },
          transition: null
        };
      } 

      var plankMapRoute = {
        title: "&nbsp;&nbsp;&nbsp;Map the Ride",
        iconClass: "fa fa-map-marker",
        handler: function() {
          controller.send("showRoute", true);
        },
        transition: null
      };

      var plankSendMessage = {
        title: "Message " + controller.get('firstName'),
        iconClass: "fa fa-comment-o",
        handler: function() {
          controller.send("sendMessage");
        },
        transition: null
      };

      modalMenu([plankPickADay, plankSendMessage, plankMapRoute]);
    },

    showRoute: function() {

      if(!this.get('controllers.login.onDesktop')) {
        var ctrl = this.controllerFor('member.map_the_ride');
        ctrl.set('selectedDate', this.get('selectedDate'));
        ctrl.set('tripMode', this.get('tripMode'));
        this.transitionToRoute('member.map_the_ride', this.get('id'), Ember.isNone(this.get('trip')) ? (this.get('isDriver') ? -2 : -3) : this.get('trip.id'));
        return;
      }

      var mapDialog = new MapDialog();
      var mapParams = mapDialog.generateMapDialog(this.get('currentMember'), this.get('content'), this.get('trip'), Ember.isNone(this.get('trip')) ? 0 : this.get('trip.id'), this.get('tripMode') % 10, this.get('isDriver'));
      mapDialog.modalDialog(
        {
          dialogTitle: this.get('firstName'),
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: (this.get('IsDriver') ? 'You are' : this.get('firstName') + ' is') +  ' the driver',
          from: mapParams.from,
          to: mapParams.to,
          waypoints: mapParams.waypoints,
          disableOptions: true,
          icons: mapParams.icons,
          controller: this
        });

    },

    sendMessage: function() {
      // Prefixed to each Twillo message... So have to limit the length
      var limit = 'message from ' + this.get('controllers.currentMember.member.fullName') + ' via hovee: ';
      new MessageDialog().modalDialog(
        {
          dialogTitle: 'Message ' + this.get('firstName'),
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: 'Enter your message here',
          controller: this,
          limit: 160 - limit.length,
          actionText: 'Send', actionClass: 'btn-success', func: this.sendTheMessage,
          cancelText: 'Cancel', cancelClass: 'btn-default'
        }, !this.get('controllers.login.onDesktop'));
    }
  },

  // Sends the user message via twillio... NOTE: I know this is bad, but dup'ed code in trip_detail_mixin_controller. This is temp until we get hovee messaging running?
  sendTheMessage: function(controller, msg) {
    var sms_messages =
    {
      smsMessage: {
        recipientId: controller.get('id'),
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
            dialogText: 'We sent your message via text to ' + controller.get('firstName')
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

export default MemberProfileController;
