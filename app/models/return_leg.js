var ReturnLeg = DS.Model.extend({
  carbs: DS.attr('number'),
  deflectMeters: DS.attr('number'),
  deflectMinutes: DS.attr('number'),
  savingsMeters: DS.attr('number'),
  waypoints: DS.hasMany('waypoint'),

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
  }.property('deflectMeters')

});

export default ReturnLeg;
