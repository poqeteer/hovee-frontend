/**
 * Created by lancemock on 11/10/14.
 */
var CalendarCell = DS.Model.extend({
  before: DS.attr(),
  bg: DS.attr('string'),
  date: DS.attr('number'),
  month: DS.attr('string'),
  selectedCell:DS.attr(),
  selectMonth: DS.attr('string'),
  status: DS.attr('string'),
  statusCode: DS.attr('string'),
  timestamp: DS.attr('number'),
  trips: DS.attr()
});

export default CalendarCell;