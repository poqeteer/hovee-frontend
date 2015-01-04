var Company = DS.Model.extend({
  name: DS.attr('string'),
  shortName: DS.attr('string'),
  domains: DS.hasMany('domain'),
  largeLogoUrl: DS.attr('string'),
  logoUrl: DS.attr('string'),
  memberCount: DS.attr('number'),
  registrants: DS.hasMany('registrantWithKey'),
  teams: DS.hasMany('team'),
  members: DS.hasMany('member'),
  locations: DS.hasMany('location')
});

export default Company;
