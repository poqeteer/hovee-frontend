var CalendarDay = DS.Model.extend({
  memberTrips: DS.attr(),
  hasProposedTrip: DS.attr('boolean'),
  isInNegotiation: DS.attr('boolean'),
  memberIsAvailable: DS.attr('boolean'),
  memberIsScheduled: DS.attr('boolean'),
  memberStatus: DS.attr('string'),
  partnerIsAvailable: DS.attr('boolean'),
  partnerStatus: DS.attr('string'),
  bothAreAvailable: DS.attr('boolean'),
  inThePast: DS.attr('boolean'),
  isToday: DS.attr('boolean'),
  displayDate: DS.attr('string'),
  dayNumber: DS.attr('string')
});

export default CalendarDay;
