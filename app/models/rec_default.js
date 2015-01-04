var RecDefault = DS.Model.extend({
  carbs: DS.attr('number'),
  deflectMeters: DS.attr('number'),
  deflectMinutes: DS.attr('number'),
  role: DS.attr('string'),
  recommendation: DS.belongsTo('recommendation'),
  savingsDollars: DS.attr('number'),
  savingsGreenhouseKgs: DS.attr('number'),
  savingsMeters: DS.attr('number'),

  carbsScore: function() {
    var carbs = this.get('carbs'),
      val = 'zero';
    if (carbs >= 300) {
      val = 'high';
    } else if (carbs >= 150) {
      val = 'med';
    } else if (carbs >= 0) {
      val = 'low';
    } else {
      val = 'zero';
    }
    return val;
  }.property('carbs'),

  deflectScore: function() {
    var deflectMeters = this.get('deflectMeters');

    if (deflectMeters >= 25000) {
      return 'low';
    } else if (deflectMeters >= 10000) {
      return 'med';
    } else {
      return 'high';
    }
  }.property('deflectMeters'),


  deflectKiloMeters: function() {
    return this.get('deflectMeters') / 1000;
  }.property('deflectMeters'),

  deflectMiles: function() {
    var miles = Math.round(this.get('deflectMeters') * 0.0621371) / 100;

    if(miles < 1){
      miles = '< 1';
    } else if(miles > 1 && miles < 3){
      miles = miles.toFixed(1);
    } else {
      miles = Math.round(miles);
    }
    return miles;
  }.property('deflectMeters'),

  deflectMilesNounSuffix: function() {
    var miles = Math.round(this.get('deflectMeters') * 0.0621371) / 100;
    var suffix = "s";

    if(miles < 1){
      suffix = "";
    }
    return suffix;
  }.property('deflectMeters'),

  savingsKiloMeters: function() {
    return this.get('savingsMeters') / 1000;
  }.property('savingsMeters'),

  savingsMiles: function() {
    var miles = Math.round(this.get('savingsMeters') * 0.0621371) / 100;

    if(miles < 1){
      miles = '< 1';
    } else if(miles > 1 && miles < 3){
      miles = miles.toFixed(1);
    } else {
      miles = Math.round(miles);
    }
    return miles;
  }.property('deflectMeters'),

  savingsDollarsPerMonth: function() {
    return Math.round(this.get('savingsDollars') * 10);
  }.property('savingsDollars'),

  savingsDollarsRounded: function() {
    return Math.round(this.get('savingsDollars'));
  }.property('savingsDollars'),

  savingsDollarsClass: function() {
    var sd = this.get('savingsDollarsRounded');

    if (sd >= 30) {
      return 'high';
    } else if (sd >= 15) {
      return 'med';
    } else if (sd > 0) {
      return 'low';
    } else {
      return 'zero';
    }
  }.property('savingsDollarsRounded')

});

export default RecDefault;
