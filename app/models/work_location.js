var WorkLocation = DS.Model.extend({
  name: DS.attr('string'),
  latitude: DS.attr('string'),
  longitude: DS.attr('string'),
  owner: DS.attr('string'),

  workAddress: DS.belongsTo('workAddress'),
  member: DS.belongsTo('member'),
  fullAddress: function() {
    return  this.get('name') + ": " +
            this.get('workAddress.address1') + ", " +
            this.get('workAddress.city') + ", " +
            this.get('workAddress.state') + " " + this.get('workAddress.zip') + " (" +
            this.get('neighborhood') + ")";
  }.property('name', 'workAddress.address1', 'workAddress.city', 'workAddress.state', 'workAddress.zip', 'neighborhood'),

  addressCityState: function() {
    return  this.get('workAddress.address1') + ", " +
      this.get('workAddress.city') + ", " +
      this.get('workAddress.state');
  }.property('workAddress.address1', 'workAddress.city', 'workAddress.state'),

  streetCity: function() {
    return  this.get('workAddress.street') + ", " +
      this.get('workAddress.city');
  }.property('workAddress.street', 'workAddress.city'),

  streetCityState: function() {
    return  this.get('workAddress.street') + ", " +
      this.get('workAddress.city') + ", " +
      this.get('workAddress.state');
  }.property('workAddress.street', 'workAddress.city', 'workAddress.state'),

  cityState: function() {
    return this.get('workAddress.city') + ", " +
      this.get('workAddress.state');
  }.property('workAddress.city', 'workAddress.state'),

  nameAndAddress: function() {
    return this.get('name') + ' - ' + this.get('workAddress.address1');
  }.property('name', 'workAddress.address1')

});

export default WorkLocation;
