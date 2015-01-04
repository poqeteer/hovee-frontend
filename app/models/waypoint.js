var Waypoint = DS.Model.extend ({
  meters: DS.attr('number'),
  minutes: DS.attr('number'),
  orientation: DS.attr('string'),
  owner: DS.attr('string'),
  homeLocation: DS.belongsTo('homeLocation', {async: true}),
  location: DS.belongsTo('location', {async: true})            // BTW this is the company location
});

export default Waypoint;