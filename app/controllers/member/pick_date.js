var MemberPickDateController = Ember.ObjectController.extend({
  needs: ['application', 'login', 'currentMember', 'member'],

  mobileHeaderString: 'Schedule with',

  nextTrip: null,

  calendar: null,

  memberId: null,   // for some reason can't access the currentMember.id

  partner: null,

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
  }.property('controllers.currentMember.member'),

  actions: {
    schedule: function(day) {
      // Had coded that the current member is driving... -10
      this.transitionToRoute ('member.trip_proposal', this.get('partner.id'), -10, day.time);
    }
  }
});

export default MemberPickDateController;