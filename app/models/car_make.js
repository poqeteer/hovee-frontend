var CarMake = DS.Model.extend({
  make: DS.attr('string'),
  cars: DS.hasMany('car')
});

export default CarMake;
