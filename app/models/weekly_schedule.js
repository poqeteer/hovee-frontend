var WeeklySchedule = DS.Model.extend({
  dailySchedules: DS.hasMany('dailySchedule'),
  tag: DS.attr('string')
});

export default WeeklySchedule;