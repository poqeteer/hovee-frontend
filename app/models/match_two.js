import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import timezonejsDate from 'appkit/utils/timezonejs_date';

var MatchTwo = DS.Model.extend({

  /**
   * Note: This structure is being used by qapla
   */

  createdTimestamp: DS.attr('number'),
  date: DS.attr('number'),
  driver: DS.belongsTo('member', { async: true }),
  lastModifiedTimestamp: DS.attr('number'),
  memberHomeLocation: DS.belongsTo('homeLocation', { async: true }),
  memberWorkLocation: DS.belongsTo('workLocation', { async: true }),
  pickupTimestamp: DS.attr('number'),
  returnTimestamp: DS.attr('number'),
  rider: DS.belongsTo('member', { async: true }),
  riderHomeLocation: DS.belongsTo('homeLocation', { async: true }),
  riderWorkLocation: DS.belongsTo('workLocation', { async: true }),
  status: DS.attr('number'),
  trip: DS.belongsTo('trip'),

  memberAsDriver: DS.belongsTo('memberAsDriver'),
  riderAsDriver: DS.belongsTo('riderAsDriver'), // Not needed?

  // Not a part of the original data structure but needed for existing routines
  owner: DS.belongsTo('member', { async: true}),

  // Formatted info...
  formattedMonthPickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      time = this.get('date');
    }
    if (!Ember.$.isNumeric(time)) return time;
    return new TimeDateFormatting().formatMonth(time);
  }.property('pickupTimestamp'),

  dayOfTheWeekPickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      return this.get('day');
    }
    return new TimeDateFormatting().dayOfTheWeekLong(time);
  }.property('pickupTimestamp'),
  dayOfTheWeekReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      return this.get('day');
    }
    return new TimeDateFormatting().dayOfTheWeekLong(time);
  }.property('returnTimestamp'),

  formatTimePickup: function() {
    var time = this.get('pickupTimestamp');
    if (Ember.isNone(time)) {
      return this.get('pickupTime');
    }
    return new TimeDateFormatting().formatTime(time);
  }.property('pickupTimestamp'),
  formatTimeReturn: function() {
    var time = this.get('returnTimestamp');
    if (Ember.isNone(time)) {
      return this.get('returnTime');
    }
    return new TimeDateFormatting().formatTime(time);
  }.property('returnTimestamp'),

  datePart: function() {
    return timezonejsDate(this.get('pickupTimestamp')).getDate();
  }.property('pickupTimestamp'),

  datePartSuffix: function() {
    var dt = timezonejsDate(this.get('pickupTimestamp')).getDate();
    var digit = dt  % 10;
    var suffix = 'th';
    switch(digit) {
      case 1: suffix = "st"; break;
      case 2: suffix = "nd"; break;
      case 3: suffix = "rd"; break;
    }
    return suffix;
  }.property('pickupTimestamp'),

  // Timestamp logic...
  hasPickupTimestamp: function() {
    return !Ember.isNone(this.get('pickupTimestamp'));
  }.property('pickupTimestamp'),

  hasReturnTimestamp: function() {
    return !Ember.isNone(this.get('returnTimestamp'));
  }.property('returnTimestamp'),


  deflectMiles: function() {
    var miles = Math.round(this.get('memberAsDriver.outboundLeg.deflectMeters') * 0.0621371) / 100;

    if(miles < 1){
      miles = '< 1';
    } else if(miles > 1 && miles < 3){
      miles = miles.toFixed(1);
    } else {
      miles = Math.round(miles);
    }
    return miles;
  }.property('memberAsDriver'),

  deflectMilesNounSuffix: function() {
    var miles = Math.round(this.get('memberAsDriver.outboundLeg.deflectMeters') * 0.0621371) / 100;
    var suffix = "s";

    if(miles < 1){
      suffix = "";
    }
    return suffix;
  }.property('memberAsDriver'),


  formatCreated: function() {
    var timestamp = this.get('createdTimestamp');
    var dt = timezonejsDate(timestamp);
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    return Ember.isNone(this.get('createdTimestamp')) ? 'n/a' : (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day) + " " + new TimeDateFormatting().formatTime(timestamp);
  }.property('createdTimestamp'),

  formatUpdated: function() {
    var timestamp = this.get('lastModifiedTimestamp');
    var dt = timezonejsDate(timestamp);
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    return Ember.isNone(this.get('lastModifiedTimestamp')) ? 'n/a' : (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day) + " " + new TimeDateFormatting().formatTime(timestamp);
  }.property('lastModifiedTimestamp'),

  statusDescription: function() {
    if (Ember.isNone(this.get('status'))) {return 'n/a';}
    var status = ['no', 'yes', 'rain', 'spin'];
    return this.get('status') + ' - ' + status[this.get('status')];
  }.property('status'),

  // TODO:
  // Shouldn't need these but... Since Ember-Data doesn't like to load the member info right away, we need these as a ref
  driverId: DS.attr('string'),
  ownerId: DS.attr('string'),
  riderId: DS.attr('string')

});

export default MatchTwo;
