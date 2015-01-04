var DailySchedule = DS.Model.extend({
  day: DS.attr('string'),
  homeDepartureTime: DS.attr('string'),
  workDepartureTime: DS.attr('string'),
  weeklySchedule: DS.belongsTo('weeklySchedule'),

  // following added for display purposes
  status: DS.attr('string'),
  canSchedule: DS.attr('boolean')
});

export default DailySchedule;