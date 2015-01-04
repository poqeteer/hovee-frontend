var RegistrantWithKey = DS.Model.extend({
  key: DS.attr('string'),
  company: DS.belongsTo('company')
});

export default RegistrantWithKey;
