var WorkAddress = DS.Model.extend({
	street: DS.attr('string'),
  address1: DS.attr('string'),
  address2: DS.attr('string'),
  address3: DS.attr('string'),
  city: DS.attr('string'),
  country: DS.attr('string'),
  state: DS.attr('string'),
  zip: DS.attr('string'),
  workLocation: DS.belongsTo('workLocation')
});

export default WorkAddress;
