import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var TipAction = DS.Model.extend({
  
  messageTimestamp: DS.attr('number'),
  recipient: DS.belongsTo('member'),
  recipientMessage: DS.attr('string'),
  sender: DS.belongsTo('member'),
  senderMessage: DS.attr('string'),
  status: DS.attr('number'),
  trip: DS.belongsTo('trip'),

  formatTime: function() {
    var time = this.get('messageTimestamp');
    return new TimeDateFormatting().formatTime(time);
  }.property('messageTimestamp')

});

export default TipAction;