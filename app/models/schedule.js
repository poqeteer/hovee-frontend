var Schedule = DS.Model.extend({
  weeklySchedules: DS.hasMany('weeklySchedule')
});

export default Schedule;
