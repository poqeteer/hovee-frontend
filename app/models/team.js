var Team = DS.Model.extend({
  name: DS.attr('string'),
  company: DS.belongsTo('company'),
  members: DS.hasMany('member')
});

export default Team;
