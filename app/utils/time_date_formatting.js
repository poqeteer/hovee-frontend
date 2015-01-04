import timezonejsDate from 'appkit/utils/timezonejs_date';

/**
 * Created by lancemock on 1/3/14.
 */
var TimeDateFormatting = Ember.Object.extend({

  twentyFourHoursMS: 24 * 60 * 60 * 1000,

  /**
   * Returns Monday (midnight) of the week for the date sent in.
   * @param dt
   * @returns {*}
   */
  findMonday: function(dt) {
    if (dt.getDay() > 1) {
      // - 1 because week starts on Sunday which is 0, so we always want to start at 1
      dt.setTime(dt.getTime() - (dt.getDay() - 1) * this.get('twentyFourHoursMS'));
    } else if (dt.getDay() < 1) {
      dt.setTime(dt.getTime() - 6 * this.get('twentyFourHoursMS')); // 0 is Sunday so 6 days in the past
    }
    return dt;
  },

  dayOfTheWeek: function (timestamp) {
    var daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return daysOfTheWeek[timezonejsDate(timestamp).getDay()];
  },

  dayOfTheWeekLong: function (timestamp) {
    var daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return daysOfTheWeek[timezonejsDate(timestamp).getDay()];
  },

  formatMonth: function (timestamp) {
    var dt = new Date(timestamp);
    var month = dt.getMonth();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return months[month];
  },

  formatDateMonthDay: function (timestamp) {
    var dt = new Date(timestamp);
    var day = dt.getDate();

    return this.formatMonth(timestamp) + ' ' + day;
  },

  formatDateMonDay: function (timestamp) {
    var dt = new Date(timestamp);
    var month = dt.getMonth();
    var day = dt.getDate();
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return months[month] + ' ' + day;
  },

  formatDateMonthDayYear: function (timestamp) {
    var dt = timezonejsDate(timestamp);

    return this.formatDateMonthDay(timestamp) + ", " + dt.getFullYear();
  },

  formatDateDay: function (timestamp) {
    var dt = timezonejsDate(timestamp);
    var day = dt.getDate();
    var readableDay = "";
    if(day === 1 || day === 21 || day === 31){
      readableDay = day + "st";
    } else if(day === 2 || day === 22) {
      readableDay = day + "nd";
    } else if(day === 3 || day === 23) {
      readableDay = day + "rd";
    } else {
      readableDay = day + "th";
    }
    return readableDay;
  },

  formatTime: function (timestamp) {
    var dt = timezonejsDate(timestamp);

    var hours = dt.getHours();
    var minutes = dt.getMinutes();

    return (hours > 12 ? hours-12 : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + (hours >= 12 ? 'PM' : 'AM');
  },

  formatNextTime: function (startTime, next) {
    // var time = new Date();
    var time = timezonejsDate();
    time.setTime(startTime.getTime() + next * 60000);
    var hour = time.getHours();
    var min  = time.getMinutes();
    return (hour > 12 ? hour-12 : hour) + ':' + (min < 10 ? '0' + min : min) + ' ' + (hour >= 12 ? 'PM' : 'AM');
  }

});

export default TimeDateFormatting;
