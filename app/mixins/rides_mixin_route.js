import CalendarMixinRoute from 'appkit/mixins/calendar_mixin_route';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var RidesMixinRoute = Ember.Mixin.create(CalendarMixinRoute, {

  ridesAfterModelProcessing: function(controller, member, trips) {
    var today = timezonejsDate().setHours(1,1,1);
    var d = new TimeDateFormatting().findMonday(timezonejsDate());
    var dateHash = this.calendarAfterModelProcessing(controller, member.get('id'), trips);
    var format = new TimeDateFormatting();

    d.setHours(23,59,0); //... Hmmm rounding bug? if you start Oct 26, 2014, you end up with 2 Nov 2nds. So don't use midnight.
    d.setTime(d.getTime() - 24*60*60*1000);
    var cw = [
      [this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0})],
      [this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0})],
      [this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0})],
      [this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#E0E6E8', date: 0, statusCode: '', timestamp: 0}), this.store.createRecord('calendar_cell').setProperties({bg: '#D1D7D9', date: 0, statusCode: '', timestamp: 0})]
    ];
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var firstNotTagged = true;
    var memberId = member.get('id');
    var selectedDay = controller.get('selectedDay');
    for (var row = 0; row < 4; row++) {
      for(var col = 0; col < 7; col++) {
        cw[row][col].set('timestamp',  d.getTime());
        cw[row][col].set('selectMonth', months[d.getMonth()]);
        cw[row][col].set('date', d.getDate());
        if (d.getDate() === 1) {
          cw[row][col].set('month', months[d.getMonth()]);
        }
        cw[row][col].set('before', d.getTime() < today);
        if (d.getTime() >= today && firstNotTagged) {
          firstNotTagged = false;
          cw[row][col].set('month', months[d.getMonth()]);
        }
        var data = dateHash[format.formatDateMonthDayYear(d)];
        if (data) {
          for (var i = 0; i < data.trips.get('length'); i++) {
            var trip = data.trips.objectAt(i);
            var statusCode = trip.get('isRinStatusAccepted') ? '2' : '0';
            trip.set('statusCode', statusCode);
            trip.set('before', cw[row][col].get('before'));
            var driveOrRide = trip.get('driverId') ===  memberId ?  "drive" : "ride";
            if (statusCode === "0") {
              trip.set('message', "You've " + (trip.get('ownerId') === memberId ? "offered" : "a request") + " to " + driveOrRide);
            } else if (statusCode === "2") {
              trip.set('message', "You're confirmed to " + driveOrRide);
            }
            trip.set('specialIsDriveMode', memberId !== trip.get('driverId'));
          }
          cw[row][col].set('trips', data.trips);
          cw[row][col].set('status', data.status);
          cw[row][col].set('statusCode', data.statusCode.toString());
        }
        if (selectedDay && selectedDay.get('date') === d.getDate()) {
          cw[row][col].set('selectedCell', true);
          controller.set('selectedWeek', cw[row]);
          controller.set('selectedDay', cw[row][col]);
          controller.set('inviteCount', cw[row][col].get('trips.length'));
          var weekHeaders = controller.get('weekHeaderFlags');
          for (var j = 0; j < 7; j++) {
            controller.set(weekHeaders[j], false);
          }
          controller.set(weekHeaders[d.getDay()], true);
        }

        // go to the next day...
        d.setTime(d.getTime() + 24*60*60*1000);
      }
    }

    controller.set('cw', Ember.ArrayProxy.create({ content: Ember.A(cw) }));
  }

});

export default RidesMixinRoute;