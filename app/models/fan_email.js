import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var FanEmail = DS.Model.extend({
  addedTimestamp: DS.attr('number'),
  companyName: DS.attr('string'),
  email: DS.attr('string'),

  date: function() {
    var time = this.get('addedTimestamp');
    return new TimeDateFormatting().formatDateMonthDayYear(time);
  }.property('addedTimestamp')
});

export default FanEmail;
