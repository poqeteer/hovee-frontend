import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'weeklySchedule'. 'weekly_schedule' will make the call, but will NOT work! Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "weekly_schedule" does not match "weeklySchedule".
 */

var WeeklyScheduleAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/commute-preferences/schedules');
  },

  defaultSerializer: 'weeklySchedule'
});

export default WeeklyScheduleAdapter;
