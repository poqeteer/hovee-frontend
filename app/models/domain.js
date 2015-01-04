var Domain = DS.Model.extend({
  name: DS.attr('string'),
  company: DS.belongsTo('company')
});

export default Domain;
