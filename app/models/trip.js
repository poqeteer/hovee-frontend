import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var Trip = DS.Model.extend({

  /**
   * Note: This structure is being used by trip (trips and members versions) and rin are the models are almost exactly the same
   */

  driver: DS.belongsTo('member', { async: true }),
  inProgressStatus: DS.attr('number'),
  memberHomeLocation: DS.belongsTo('homeLocation', { async: true }),
  memberWorkLocation: DS.belongsTo('workLocation', { async: true }),
  oneWayStatus: DS.attr('number'),
  outboundTIPId: DS.attr('number'),
  owner: DS.belongsTo('member', { async: true }),
  parentTripId: DS.attr('number'),
  pickupTimestamp: DS.attr('number'),
  returnTIPId: DS.attr('number'),
  returnTimestamp: DS.attr('number'),
  riderHomeLocation: DS.belongsTo('homeLocation', { async: true }),
  rider: DS.belongsTo('member', { async: true }),
  riderWorkLocation: DS.belongsTo('workLocation', { async: true }),
  rinStatus: DS.attr('number'),
  status: DS.attr('number'),

  memberAsDriver: DS.belongsTo('memberAsDriver'),
  riderAsDriver: DS.belongsTo('riderAsDriver'),

  // Deprecated values
//  day: DS.attr('string'),
  pickupTime: DS.attr('string'),  // Note: reusing this for displaying corrected times
  returnTime: DS.attr('string'),  // Note: reusing this for displaying corrected times
//  week: DS.attr('number'),
//  date: DS.attr('number'),

  // Formatted info...
  formattedMdYPickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      time = this.get('date');
    }
    if (!Ember.$.isNumeric(time)) return time;
    return TimeDateFormatting.create().formatDateMonthDayYear(time);
  }.property('pickupTimestamp'),

  formattedMdYReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      time = this.get('date');
    }
    if (!Ember.$.isNumeric(time)) return time;
    return TimeDateFormatting.create().formatDateMonthDayYear(time);
  }.property('returnTimestamp'),

  formattedMdPickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      time = this.get('date');
    }
    if (!Ember.$.isNumeric(time)) return time;
    return TimeDateFormatting.create().formatDateMonthDay(time);
  }.property('pickupTimestamp'),

  formattedMdReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      time = this.get('date');
    }
    if (!Ember.$.isNumeric(time)) return time;
    return TimeDateFormatting.create().formatDateMonthDay(time);
  }.property('returnTimestamp'),

  dayOfTheWeekPickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      return this.get('day');
    }
    return TimeDateFormatting.create().dayOfTheWeek(time);
  }.property('pickupTimestamp'),
  dayOfTheWeekReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      return this.get('day');
    }
    return TimeDateFormatting.create().dayOfTheWeek(time);
  }.property('returnTimestamp'),

  formatTimePickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      return this.get('pickupTime');
    }
    return TimeDateFormatting.create().formatTime(time);
  }.property('pickupTimestamp'),
  formatTimeReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      return this.get('returnTime');
    }
    return TimeDateFormatting.create().formatTime(time);
  }.property('returnTimestamp'),

  // Timestamp logic...
  hasPickupTimestamp: function() {
    return !Ember.isNone(this.get('pickupTimestamp'));
  }.property('pickupTimestamp'),

  hasReturnTimestamp: function() {
    return !Ember.isNone(this.get('returnTimestamp'));
  }.property('returnTimestamp'),

  // trip type...
  isOutboundTrip: function () {
    return Ember.isNone(this.get('returnTimestamp'));
  }.property('returnTimestamp'),

  isReturnTrip: function () {
    return Ember.isNone(this.get('pickupTimestamp'));
  }.property('pickupTimestamp)'),

  isParentTrip: function () {
    return this.get('parentTripId') === 0;
  }.property('parentTripId'),

  isRinStatusNew: function () {
    return this.get('rinStatus')=== 0;
  }.property('rinStatus'),
  isRinStatusAccepted: function () {
    return this.get('rinStatus')=== 2;
  }.property('rinStatus'),
  isRinStatusDeclineOwner: function () {
    return this.get('rinStatus')=== 3;
  }.property('rinStatus'),
  isRinStatusDeclineRider: function () {
    return this.get('rinStatus')=== 4;
  }.property('rinStatus'),
  isRinStatusChangeOwner: function () {
    return this.get('rinStatus')=== 5;
  }.property('rinStatus'),
  isRinStatusChangeRider: function () {
    return this.get('rinStatus')=== 6;
  }.property('rinStatus'),
  isRinStatusDeclined: function () {
    return this.get('rinStatus')=== 3 || this.get('rinStatus')=== 4;
  }.property('status'),

  isStatusInNegotiation: function () {
    return this.get('status')=== 0;
  }.property('status'),
  isStatusAccepted: function () {
    return this.get('status')=== 1;
  }.property('status'),
  isStatusInProgress: function () {
    return this.get('status')=== 2 || this.get('status')=== 3;
  }.property('status'),
  isStatusComplete: function () {
    return this.get('status')=== 4;
  }.property('status'),
  isStatusCancelled: function () {
    return this.get('status')=== 5;
  }.property('status'),
  isStatusDeclined: function () {
    return this.get('status')=== 6;
  }.property('status'),
  isStatusExpired: function () {
    return this.get('status')=== 7;
  }.property('status'),
  isStatusCancelledOrDeclined: function () {
    return this.get('status')=== 5 || this.get('status')=== 6;
  }.property('status'),

  isActionRequired: function() {
    var actionRequired = false;
    if(this.get('isStatusInNegotiation')){
      if(this.get('isOwnerCurrentMember')) {
        if(this.get('isRinStatusChangeRider')){
          actionRequired = true;
        }
      } else { // isn't isOwnerCurrentMember
        if(! this.get('isRinStatusChangeRider')){
          actionRequired = true;
        }
      }
    } 
    return actionRequired;
  }.property('isStatusInNegotiation', 'isOwnerCurrentMember', 'isRinStatusChangeRider', 'isRinStatusChangeOwner'),

/*
{{#if trip.isStatusInNegotiation}}
  {{!-- potential action req'd --}}
  {{#if trip.isOwnerCurrentMember}}
  {{!-- you created this trip --}}
    {{#if trip.isRinStatusChangeRider}}
    {{!-- They made a change and sent it back --}}
      Response required!
    {{else}}
    {{!-- they haven't responded --}}
      Awaiting response from {{trip.partner.firstName}}.
    {{/if}}
  {{else}}
  {{!-- they created this trip --}}
    {{#if trip.isRinStatusChangeRider}}
      Awaiting response from {{trip.partner.firstName}}.
    {{else}}
      Response required!
    {{/if}}
  {{/if}}
{{/if}}
*/
  // This is a complete cheat... And only currently used in the Ride In Negotiation page

  currentMemberId: DS.attr('string'),

  isOwnerCurrentMember: function() {
    if (Ember.isNone(this.get('currentMemberId'))) throw "trip.isOwnerCurrentMember the currentMemberId is null";
    return this.get('ownerId') === this.get('currentMemberId');
  }.property('owner.id', 'currentMemberId'),

  isRiderCurrentMember: function() {
    if (Ember.isNone(this.get('currentMemberId'))) throw "trip.isRiderCurrentMember the currentMemberId is null";
    return this.get('riderId') === this.get('currentMemberId');
  }.property('riderId', 'currentMemberId'),

  roundTrip:function() {
    return this.get('oneWayStatus') === 0 || Ember.isNone(this.get('oneWayStatus'));
  }.property('oneWayStatus'),
  workTrip:function() {
    return this.get('oneWayStatus') === 1;
  }.property('oneWayStatus'),
  homeTrip:function() {
    return this.get('oneWayStatus') === 2;
  }.property('oneWayStatus'),

  isRoundOrFromHome: function() {
    return this.get('roundTrip') || this.get('workTrip');
  }.property('oneWayStatus'),
  isRoundOrFromWork: function() {
    return this.get('roundTrip') || this.get('homeTrip');
  }.property('oneWayStatus'),

  // TODO:
  // Shouldn't need these but... Since EmberData doesn't like to load the member info right away, we need these as a ref
  driverId: DS.attr('string'),
  ownerId: DS.attr('string'),
  riderId: DS.attr('string'),
  memberHomeLocationId: DS.attr('number'),
  memberWorkLocationId: DS.attr('number'),
  riderHomeLocationId: DS.attr('number'),
  riderWorkLocationId: DS.attr('number'),

  // Add-on info
  partnerId: function() {
    if (this.get('isOwnerCurrentMember')) {
      return this.get('riderId');
    }
    return this.get('ownerId');
  }.property('owner', 'rider'),
  partner: function(){
    if (this.get('isOwnerCurrentMember')) {
      return this.get('rider');
    }
    return this.get('owner');
  }.property('owner', 'rider'),
  partnerMobilePhoneLink: function() {
    if (this.get('isOwnerCurrentMember')) {
      return 'tel:1' + this.get('rider.mobilePhone');
    }
    return 'tel:1' + this.get('owner.mobilePhone');
  }.property('owner.mobilePhone', 'rider.mobilePhone'),

  isDriver: function() { //DS.attr('boolean'),
    return this.get('driverId') === this.get('currentMemberId');
  }.property('driverId', 'currentMemberId'),

  nextTrip: DS.attr('boolean'),
  nextTripOutbound: DS.attr('boolean'),
  nextTripOutboundStr: function() {
    return this.get('nextTripOutbound') ? 'x' : 'z';
  }.property('nextTripOutbound'),
  nextTripReturn: DS.attr('boolean'),
  nextTripReturnStr: function() {
    return this.get('nextTripReturn') ? 'x' : 'z';
  }.property('nextTripReturn'),

  selectedDate: function() {
    if (Ember.isNone(this.get('pickupTimestamp'))) {
      return this.get('pickupTimestamp');
    }
    return this.get('returnTimestamp');
  }.property('pickupTimestamp', 'returnTimestamp'),

  outboundTripStatus: DS.attr('number'),
  inboundTripStatus: DS.attr('number'),

  tipActions: DS.hasMany('tipAction')
});

export default Trip;
