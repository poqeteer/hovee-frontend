import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var Login = DS.Model.extend({
  email: DS.attr('string'),
  timestamp: DS.attr('number'),
  source: DS.attr('string'),

  lastLogin: function() {
    var timestamp = this.get('timestamp');
    var format = new TimeDateFormatting();
    return format.formatDateMonthDayYear(timestamp) + ' at ' + format.formatTime(timestamp);
  }.property('timestamp')
});

export default Login;
