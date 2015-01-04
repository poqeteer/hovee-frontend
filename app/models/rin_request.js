import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var RinRequest = DS.Model.extend({
  messageTimestamp: DS.attr('number'),
  personalMessage: DS.attr('string'),
  recipient: DS.belongsTo('member'),
  recipientMessage: DS.attr('string'),
  sender: DS.belongsTo('member'),
  senderMessage: DS.attr('string'),
  status: DS.attr('number'),
  tripChange: DS.attr(''),
  trip: DS.belongsTo('trip'),

  rinMessage: function() {
    return !Ember.isNone(this.get('personalMessage')) && this.get('personalMessage').trim() !== '' ? this.get('personalMessage') : this.get('senderMessage');
  }.property('personalMessage'),

  messageDateTime: function() {
    var time = this.get('messageTimestamp');
    var format = new TimeDateFormatting();

    return format.formatDateMonthDay(time) + ' - ' + format.formatTime(time);
  }.property('messageTimestamp')
});

export default RinRequest;
