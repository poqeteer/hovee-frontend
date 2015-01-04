var Location = DS.Model.extend({
  name: DS.attr('string'),
  latitude: DS.attr('number'),
  longitude: DS.attr('number'),

  company: DS.belongsTo('company'),
  members: DS.hasMany('member'),
  companyAddress: DS.belongsTo('companyAddress'),

  nameAndAddress: function() {
    return this.get('name') + ' - ' + this.get('companyAddress.address1');
  }.property('name', 'companyAddress.address1'),
  
  addressCityState: function() {
    return  this.get('companyAddress.address1') + ", " +
      this.get('companyAddress.city') + ", " +
      this.get('companyAddress.state');
  }.property('companyAddress.address1', 'companyAddress.city', 'companyAddress.state'),

});

export default Location;
