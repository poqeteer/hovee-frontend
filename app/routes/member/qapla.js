/**
 * Created by lancemock on 10/14/14.
 */
import AuthenticatedRoute from 'appkit/routes/authenticated';

import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberQaplaRoute = AuthenticatedRoute.extend({
  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  choice: null,

  model: function(params) {
    this.set('choice', params.choice);

    return Ember.RSVP.hash({
      partner: this.store.find('member', params.partner_id),
      matchTwo: this.store.find('matchTwo', params.lookup_id)
    });
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.qapla');
    controller.set('switchOnQuestions', false);
    controller.set('matchTwo', hash.matchTwo);
    controller.set('partner', hash.partner);
    controller.set('qapla', false);

    var member = this.modelFor('member');
    var memberId = member.get('id');
    controller.set('memberId', memberId);

    var dt = timezonejsDate();
    if (hash.matchTwo.get('status') === 1 && this.get('choice') !== 'asdfasdf') {
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: "Thanks!",
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogText: "You've already sent a proposal to " + hash.partner.get('firstName')
        });
      controller.transitionToRoute('member.rides');
      dt = new Date('January 1, 2100 00:00:00');
    }

    var pd = timezonejsDate(hash.matchTwo.get('pickupTimestamp'));
    controller.set('disableTry', pd.getTime() < dt.getTime());
    switch (this.get('choice')){
      case 'yes':
        if (pd.getTime() > dt.getTime()) {
          controller.send('makeProposal');
        }
        break;
      case 'no':
        controller.send('notInterested');
        break;
      case 'new':
        controller.send('new');
        break;
      case 'profile':
        controller.send('profilePartner');
        break;
      case 'spin':
        controller.send('spinMe');
        break;
    }

    if (this.get('choice') !== 'profile') {
      var oneDay = 24 * 60 * 60 * 1000;
      // We want to start on Sunday, even if is past
      if (dt.getDay() > 0) {
        // go back the amount of days (mon = 1, tue = 2, etc)
        dt.setTime(dt.getTime() - dt.getDay() * oneDay);
      }
      dt.setHours(0, 0, 0);

      controller.set('timeFrame', "this week");
      if (pd.getTime() >= dt.getTime() && pd.getTime() < dt.getTime() + 7 * oneDay) {
        //controller.set('timeFrame', "this week");
      } else if (pd.getTime() > dt.getTime() + 7 * oneDay && pd.getTime() < dt.getTime() + 14 * oneDay) {
        controller.set('timeFrame', "next week");
      } else if (pd.getTime() > dt.getTime() + 14 * oneDay && pd.getTime() < dt.getTime() + 21 * oneDay) {
        controller.set('timeFrame', "week after next");
      }

      controller.set('pageStyle', "width: " + (controller.get('controllers.login.onDesktop') ? "50" : "95") + "%; margin: 0 auto;");

      // Process the "recommendation"...
      new GroupWaypoints().reviewTrip(controller, hash.matchTwo, memberId);
    } else {
      controller.set('pageStyle', "display: none;");
    }

    controller.set('partner', hash.partner);
  }
});

export default MemberQaplaRoute;