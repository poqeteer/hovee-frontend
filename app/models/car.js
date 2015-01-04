var Car = DS.Model.extend({
  nickname: DS.attr('string'),
  color: DS.attr('string'),
  make: DS.attr('string'),
  carMake: DS.belongsTo('carMake', {async: true}),
  model: DS.attr('string'),
  year: DS.attr('number'),
  members: DS.hasMany('member'),
  photoUrl: DS.attr('string'),

  fullCar: function() {
    var carString = "";
    if(this.get('year')) {
      carString = this.get('year') + " ";
    }
    if(this.get('carMake.make')) {
      carString += this.get('carMake.make') + " ";
    }
    if(this.get('model')) {
      carString += this.get('model');
    }
    return carString;
  }.property('carMake.make', 'model', 'year')
});

export default Car;
