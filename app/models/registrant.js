var Registrant = DS.Model.extend({
  email: DS.attr('string'),
  company: DS.belongsTo('company', { async: true })
});

export default Registrant;
