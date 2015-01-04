import TaglineMixinController from 'appkit/mixins/tagline_mixin_controller';

var MemberCalendarController = Ember.ObjectController.extend(TaglineMixinController,{
  needs: ['application', 'login', 'currentMember', 'member'],

  nextTrip: null,

  calendar: null,

  memberId: null,   // for some reason can't access the currentMember.id

  onCalendar: true,

  partnerFullName: function() {
    if (this.get('nextTrip.riderId') === this.get('memberId')) {
      return this.get('nextTrip.owner.fullName');
    }
    return this.get('nextTrip.rider.fullName');
  }.property('nextTrip.owner.fullName', 'nextTrip.rider.fullName', 'nextTrip.owner.id', 'nextTrip.rider.id'),

  isDriver: function () {
    return this.get('nextTrip.driverId') === this.get('memberId');
  }.property('nextTrip.driverId', 'memberId'),

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  }.property('controllers.currentMember.member')
});

export default MemberCalendarController;