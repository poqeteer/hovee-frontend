import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';
import Spinner from 'appkit/utils/spinner';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberNotificationsController = Ember.ObjectController.extend(TaglineMixinController,{
  needs: ['application', 'login', 'currentMember', 'member'],

  onNotifications: true,

  hasMessages: true,

  // These two are for the mobile header
  //mobileHeaderString: "Notifications",
  showMessageCount: true,

  startIndex: 1,// Display index only... Really the index is 0
  endIndex: 25, // Assumes that we only read 25 in

  disablePrevious: true,
  disableFirst: true,
  disableLast: false,
  disableNext: false,

  disableMarkAllAsRead: true,

  messages: [], // List of messages
  msgTypes: [], // List of message type for action button displays

  tableCellPadding: "5",
  tableStyle: '',

  init: function() {
    if (!this.get('controllers.login.onDesktop')) {
      this.set('tableCellPadding', '3');
      this.set('tableStyle', "margin-left: -10px;");
    }
  },

  // Generic change for the message's unread flag...
  changeUnreadFlag: function(controller, id, unread) {
    controller.set('controllers.login.unreadCount', controller.get('controllers.login.unreadCount') + (unread === 'false' ? -1 : 1));
    Ember.$.ajax({
      type: 'PUT',
      url: Ember.ENV.APIHOST + '/messages/' + id,
      data: '{"message": {"unread": ' + unread + '}}"',
      dataType: 'json',
      contentType: 'application/json; charset=UTF-8'
    }).then(function(){
    }).fail(function(){
    });
  },
  
  actions: {
    markAllAsRead: function(unmark) {
      if (unmark) {
        this.send('markAllAsUnread');
      } else {
        var list = this.get('messages');
        var controller = this;
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: 'Mark All as Read',
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: 'This will mark all the visible "new" notifications as read. Are you sure you want to do this?',
            controller: this,
            actionText: 'Yes', actionClass: 'btn-success',
            func: function(){
              controller.set('disableMarkAllAsRead', true);

              // Go through the list of messages and clear the unread flag
              list.forEach(function (message){
                if (message.get('isUnread')) {
                  message.set('unread', 'false');
                  controller.changeUnreadFlag(controller, message.get('id'), 'false');
                }
              });
            },
            cancelText: 'No', cancelClass: 'btn-default'
          });
      }
    },

    // Only called via the secret button press alt+shift+click on "Mark All as Read"
    markAllAsUnread: function() {
      var list = this.get('messages');
      var controller = this;
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: 'Mark All as New',
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: 'This will mark all the visible notifications as "New". Are you sure you want to do this?',
          controller: this,
          actionText: 'Yes', actionClass: 'btn-success',
          func: function(){
            controller.set('disableMarkAllAsRead', false);

            // Go through the list and set the unread flag
            list.forEach(function (message){
              if (!message.get('isUnread')) {
                message.set('unread', 'true');
                controller.changeUnreadFlag(controller, message.get('id'), 'true');
              }
            });
          },
          cancelText: 'No', cancelClass: 'btn-default'
        });
    },

    // Paging function... Handles all directions
    page: function(direction) {
      var spinner = new Spinner().create();

      var controller = this;
      var amount = 25;
      var start = this.get('startIndex') - 1;
      var total = this.get('controllers.login.totalMessageCount');

      switch(direction) {
        case 'next':
          start += amount;
          this.set('disableNext', start + amount >= total);
          this.set('disableLast', start + amount >= total);
          this.set('disablePrevious', false);
          this.set('disableFirst', false);
          if (start >= total) {
            spinner.stop();
            return;
          }
          break;
        case 'previous':
          if (start === 0) {spinner.stop();return;}
          if (total - start < amount) {
            start = (total - (total - start)) - amount;
          } else {
            start -= amount;
          }
          this.set('disableNext', false);
          this.set('disableLast', false);
          this.set('disablePrevious', start === 0);
          this.set('disableFirst', start === 0);
          break;
        case 'first':
          if (start === 0) {spinner.stop();return;}
          start = 0;
          this.set('disableNext', false);
          this.set('disableLast', false);
          this.set('disablePrevious', true);
          this.set('disableFirst', true);
          break;
        case 'last':
          // Goes to the last set after however many amounts before it... Could be less then the amount (I.E. 1), but never 0
          if (this.get('endIndex') === total) {spinner.stop();return;}
          start = Math.floor(total / amount) * amount;
          if (start === 0) {start = total - amount;}
          this.set('disableNext', true);
          this.set('disableLast', true);
          this.set('disablePrevious', false);
          this.set('disableFirst', false);
          break;
      }

      this.store.findQuery('message', {memberId: this.get('controllers.member.id'), start: start})
        .then(function(messages){
          controller.set('messages', messages);
          controller.set('startIndex', start + 1);
          controller.set('endIndex', start + messages.get('length'));
          controller.set('disableMarkAllAsRead', true);
          for (var i = 0; i < messages.get('length'); i++) {
            if (messages.objectAt(i).get('unread') === 'true') {
              controller.set('disableMarkAllAsRead', false);
              break;
            }
          }
          spinner.stop();
        }).catch(function(){
          spinner.stop();
        });
    },

    // Actions... Handles all message actions. See https://docs.google.com/a/hov.ee/spreadsheets/d/1BU3RrP_h-YtLwgs97ipF_sNRt6gt5RA4vAr4Khp_P9A/edit#gid=0 for more info
    clickNotice: function (id, unread, msgTypeId, tripId, partnerId, parentTripId, actionLink) {
      var isMobile = !this.get('controllers.login.onDesktop');
      var sendTo = 'member.trip_proposal';
      switch(msgTypeId) {
        case 1001: // Driver Trip Reminder
        case 1002: // - Driver is en-Route
          if (isMobile) {
            sendTo = 'member.trip_in_progress';
          }
          break;
        case 1003: // - Driver Did Not Complete Trip
          if (isMobile) {
            sendTo = 'member.trip_in_progress';
          } else {
            new GenericModalDialog().modalDialog({
              dialogTitle: 'Trip Not Completed',
              dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
              dialogText: 'Please change to our mobile app or access this site on you mobile device to complete you trip.'
            });
            sendTo = '';
          }
          break;
        case 1004: //  Driver Has Not Started Trip
        //case 1004D -Driver Has Not Started Trip
        //case 1004P -Driver Has Not Started Trip
          if (isMobile) {
            sendTo = 'member.trip_in_progress';
          }
          break;
        case 1008: //  Driver Missed Trip - Trip Cancelled
          sendTo = 'member.rides';
          break;
        case 1009: //  Trip Cancelled
          sendTo = 'member.rides';
          break;
        case 2004: // - Ride Proposal Declined
          sendTo = 'member.rides';
          break;
        case 2006: // Proposal timed out (SAME TEXT as Decline)
          sendTo = 'member.rides';
          break;

        case 2001: // - New Ride Proposal
        case 2002: // - Reply to Ride Proposal
        case 2003: // - Ride Proposal Accepted
        case 2005: // Counterparty has not replied
          break;
//        case 3001:
//          this.transitionToRoute('member.qapla', partnerId, 'lookup', 'notice');
//          break;
        default: // unknown...??? What do we do?
          if (actionLink.indexOf('http:') > -1) {
            actionLink = actionLink.replace('http', 'https');
            Ember.Logger.debug('bad address http');
          }
          if (window.location.href.indexOf('localhost') > -1) {
            actionLink = 'http://localhost:8000/' + actionLink.substr(actionLink.indexOf('#'));
          }
          window.open(actionLink, '_blank');
          sendTo = '';
          break;
      }
      switch (sendTo) {
        case 'member.trip_proposal':
          if (Ember.isNone(parentTripId)) {
            Ember.$.ajax({
              type: 'GET',
              url: Ember.ENV.APIHOST + '/trips/' + tripId,
              async: false
            }).then(function(trip){
              parentTripId = trip.trip.parentTripId;
            }).fail(function(){
              parentTripId = 0;
            });
          }
          this.transitionToRoute(sendTo, partnerId, parentTripId === 0 ? tripId : parentTripId, 0);
          break;
        case 'member.trip_in_progress':
          this.transitionToRoute(sendTo, tripId, 0);
          break;
        case 'member.calendar':
        case 'member.rides':
          this.transitionToRoute(sendTo, this.get('controllers.member.id'));
          break;
        default:
          break;
      }

      // Farther processing only needed for unread messages
      if (unread) {
        // Need to also clear the flag in memory...
        var messages = this.get('messages');
        for (var i=0; i < messages.get('length'); i++){
          if (messages.objectAt(i).get('id') === id) {
            messages.objectAt(i).set('unread', 'false');
            break;
          }
        }
        this.changeUnreadFlag(this, id, 'false');
      }
    }
  }
});

export default MemberNotificationsController;




