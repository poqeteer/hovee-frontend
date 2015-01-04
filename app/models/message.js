import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import timezonejsDate from 'appkit/utils/timezonejs_date';

var Message = DS.Model.extend({

  actionLink: DS.attr('string'),
  channel: DS.attr('string'),
  message: DS.attr('string'),
  messageTimestamp: DS.attr('number'),
  msgTypeId: DS.attr('number'),
  recipient: DS.belongsTo('member'),
  sender: DS.belongsTo('member', {async: true}),
  template: DS.attr('string'),
  trip: DS.belongsTo('trip', {async: true}),
  unread: DS.attr('string'),

  timeSent: function() {
    var timestamp = this.get('messageTimestamp');
    return TimeDateFormatting.create().formatTime(timestamp);
  }.property('messageTimestamp'),

  dateTimeSent: function() {
    var timestamp = this.get('messageTimestamp');
    // var dt = new Date(timestamp);
    var dt = timezonejsDate(timestamp);
    var month = dt.getMonth() + 1;
    var day = dt.getDate();
    return (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day) + " " + new TimeDateFormatting().formatTime(timestamp);
  }.property('messageTimestamp'),

  // Used in Notifications desktop on hover above relativeTime
  prettyDateTimeSent: function() {
    var timestamp = this.get('messageTimestamp');
    var format = new TimeDateFormatting();
    return format.formatDateMonthDay(timestamp) + ' at ' + format.formatTime(timestamp);
  }.property('messageTimestamp'),

  // Used in Notifications desktop
  relativeTime: function() {
    var timestamp = this.get('messageTimestamp');
    var dt = timezonejsDate(timestamp);             // Message date and time
    var now = timezonejsDate();                     // Current date and time
    var diff = now.getTime() - dt.getTime();        // Difference between message and now in milliseconds
    var oneDay = 24 * 60 * 60 * 1000;               // Amount of milliseconds in a day
    var numbers = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight','Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen'];

    // First see if we are looking a message less than a day old
    if (diff < oneDay) {
      // See how many hours difference
      var hour = Math.floor(diff / 3600000);

      // If at lease one and less than 12 hours
      if (hour > 0 && hour < 12) {
        // return how many hours ago
        return numbers[hour] + ' hour' + (hour > 1 ? 's' : '') + ' ago';
      } else if (hour > 12) {             // If greater then 12 hours
        // was it yesterday?
        if (dt.getDate() !== now.getDate()) {
          return 'Yesterday';
        } else if (dt.getHours() < 12) {  // was it before noon?
          return 'This morning';
        } else {
          return 'This afternoon';
        }
      } else {                            // was less than an hour
        // return how many minutes ago
        var min = diff - hour * 3600000;
        return Math.floor(min / 60000) + ' minutes ago';
      }
    } else {                              // More than a day ago
      // See how many days
      var diffDays = Math.round(diff/oneDay);

      // If less than 2, it was just yesterday
      if (diffDays < 2) {
        return 'Yesterday';
      } else if (diffDays >= 2 && diffDays < 7) {
        return numbers[diffDays] + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
      } else if (diffDays === 7) {
        return 'A week ago';
      } else if (diffDays > 7 && diffDays < 14){
        return numbers[diffDays] + ' days ago';
      } else if (diffDays > 14) {
        return 'A few weeks ago';
      }
    }
  }.property('messageTimestamp'),

  // Used in Notifications mobile
  simpleRelativeTime: function() {
    var timestamp = this.get('messageTimestamp');
    var dt = timezonejsDate(timestamp);             // Message date and time
    var now = timezonejsDate();                     // Current date and time
    var diff = now.getTime() - dt.getTime();        // Difference between message and now in milliseconds
    var oneDay = 24 * 60 * 60 * 1000;               // Amount of milliseconds in a day

    if (diff < oneDay) {
      return new TimeDateFormatting().formatTime(timestamp);
    } else {
      return new TimeDateFormatting().formatDateMonDay(timestamp);
    }
  }.property('messageTimestamp'),

  senderCompanyId: function() {
    return this.get('sender.company.id');
  }.property('sender.company.id'),

  isUnread: function() {
    return this.get('unread') === 'true';
  }.property('unread')
});

export default Message;
