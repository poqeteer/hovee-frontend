import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var Unconfirmed = DS.Model.extend({

  email: DS.attr('string'),
  source: DS.attr('string'),
  timestamp: DS.attr('number'),

  // Not apart of the actual model...
  checked: DS.attr('boolean'),

  // Formatted info...
  formattedMdY: function() {
    return new TimeDateFormatting().formatDateMonthDayYear(this.get('timestamp'));
  }.property('timestamp'),

  formatTime: function() {
    return new TimeDateFormatting().formatTime(this.get('timestamp'));
  }.property('timestamp'),
  
  formatFullDateTime: function() {
    return this.get('formattedMdY') + ' ' + this.get('formatTime');
  }.property('returnTimestamp')
});

export default Unconfirmed;
