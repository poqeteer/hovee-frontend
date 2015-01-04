import AuthenticatedRoute from 'appkit/routes/authenticated';
import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejs from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';
import CalendarMixinRoute from 'appkit/mixins/calendar_mixin_route';
import TaglineMixinRoute from 'appkit/mixins/tagline_mixin_route';

var MemberCalendarRoute = AuthenticatedRoute.extend(CalendarMixinRoute, TaglineMixinRoute, {

  memberId: null,
  member: null,

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },
  model: function(){
    var member = this.modelFor('member');
    this.set('member', member);
    this.set('memberId', member.get('id'));
    this.controllerFor('member.calendar').set('memberId', member.get('id'));

    var dt = timezonejs();
    // We want to start on Monday, even if is past
    if (dt.getDay() > 1)  {
      // - 1 because week starts on Sunday which is 0, so we always want to start at 1
      dt.setTime(dt.getTime() - (dt.getDay()-1)*24*60*60*1000);
    } else if (dt.getDay() < 1) {
      dt.setTime(dt.getTime() - 6*24*60*60*1000); // 0 is Sunday so 6 days in the past
    }
    dt.setHours(0,0,0);
    var et = timezonejs(dt.getTime() + (4*7)*24*60*60*1000); // 4 weeks in the future.

    return Ember.RSVP.hash({
      trips: this.store.findQuery('trip', { from: 'startTime=' + (dt.getTime() - 1000) + '&endTime=' + et.getTime(), id: member.get('id')}), //{from: 'members', id: member.get('id'), endPoint: 'trips'})//,
//      sched: this.store.findQuery('weeklySchedule', {memberId: member.get('id')})
    });
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.calendar');
    this.taglineAfterModelProcessing(controller, this.get('member'));

    var memberId = this.get('memberId');

    var dateHash = this.calendarAfterModelProcessing(controller,  memberId, hash.trips);

    var dt = this.get('monday');
    var td = this.get('today');
    var defaultStatus = this.get('defaultStatus');
    var calendar = [];
    var format = new TimeDateFormatting();
    for (var w = 0; w < 4; w++) {
      var calendarWeek =
      {displayDate:'',
        daysOfTheWeek: [
          {id: 'Monday',    trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Tuesday',   trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Wednesday', trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Thursday',  trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Friday',    trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Saturday',  trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''},
          {id: 'Sunday',    trips: null, inThePast: true, isToday: false, displayDate: '', status: defaultStatus, statusCode: '', driving: false, outboundStatusCode: '', inboundStatusCode: ''}
        ]};
      calendar.push(calendarWeek);
      calendarWeek.displayDate = format.formatDateMonthDayYear(dt);
      for (var nextTripDate=0; nextTripDate < 7; nextTripDate++) {
        // Get the date info to populate the text parts
        calendarWeek.daysOfTheWeek[nextTripDate].displayDate = format.formatDateMonthDayYear(dt);

        var data = dateHash[calendarWeek.daysOfTheWeek[nextTripDate].displayDate];
        if (data) {
          calendarWeek.daysOfTheWeek[nextTripDate].trips = data.trips; //
          calendarWeek.daysOfTheWeek[nextTripDate].status = data.status;
          calendarWeek.daysOfTheWeek[nextTripDate].statusCode = data.statusCode;
          calendarWeek.daysOfTheWeek[nextTripDate].driving = data.driving;
          calendarWeek.daysOfTheWeek[nextTripDate].outboundStatusCode = data.outboundStatusCode;
          calendarWeek.daysOfTheWeek[nextTripDate].inboundStatusCode = data.inboundStatusCode;
        }
        calendarWeek.daysOfTheWeek[nextTripDate].displayDate = format.formatDateDay(dt);

        calendarWeek.daysOfTheWeek[nextTripDate].inThePast = timezonejs(dt).getTime() < td;
        // clear status if day is in the past
        // if(calendarWeek.daysOfTheWeek[nextTripDate].inThePast){
        //   calendarWeek.daysOfTheWeek[nextTripDate].status = "";
        // }
        calendarWeek.daysOfTheWeek[nextTripDate].isToday = timezonejs(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime() === td;

        dt.setTime(dt.getTime() + 24*60*60*1000);                              // Add a day for the next round
      }
    }

    controller.set('calendar', calendar);
  }
});

export default MemberCalendarRoute;
