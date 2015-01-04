var HomeLocation = DS.Model.extend({
  name: DS.attr('string'),
  latitude: DS.attr('string'),
  longitude: DS.attr('string'),
  tag: DS.attr('string'),
  neighborhood: DS.attr('string'),

  homeAddress: DS.belongsTo('homeAddress'),
  member: DS.belongsTo('member'),
  fullAddress: function() {
    return  this.get('name') + ": " +
            this.get('homeAddress.address1') + ", " +
            this.get('homeAddress.city') + ", " +
            this.get('homeAddress.state') + " " + this.get('homeAddress.zip') + " (" +
            this.get('neighborhood') + ")";
  }.property('name', 'homeAddress.address1', 'homeAddress.city', 'homeAddress.state', 'homeAddress.zip', 'neighborhood'),

  addressCityState: function() {
    return  this.get('homeAddress.address1') + ", " +
            this.get('homeAddress.city') + ", " +
            this.get('homeAddress.state');
  }.property('homeAddress.address1', 'homeAddress.city', 'homeAddress.state'),

  streetCity: function() {
    return  this.get('homeAddress.street') + ", " +
      this.get('homeAddress.city');
  }.property('homeAddress.street', 'homeAddress.city'),

  streetCityState: function() {
    return  this.get('homeAddress.street') + ", " +
      this.get('homeAddress.city') + ", " +
      this.get('homeAddress.state');
  }.property('homeAddress.street', 'homeAddress.city', 'homeAddress.state'),

  cityState: function() {
    return this.get('homeAddress.city') + ", " +
      this.get('homeAddress.state');
  }.property('homeAddress.city', 'homeAddress.state'),

  nameAndAddress: function() {
    return this.get('name') + ' - ' + this.get('homeAddress.address1');
  }.property('name', 'homeAddress.address1'),

  isPrimary: function() {
    return this.get('tag') === 'PRIMARY';
  }.property('tag')

});

export default HomeLocation;
