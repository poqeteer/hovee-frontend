var Recommendation = DS.Model.extend({
  matchScore: DS.attr('number'),
  metersBetweenDests: DS.attr('number'),
  metersBetweenOrigins: DS.attr('number'),
  member: DS.belongsTo('member', {async: true}),
  memberAsDriver: DS.belongsTo('memberAsDriver'),
  riderAsDriver: DS.belongsTo('riderAsDriver'),
  scores: DS.belongsTo('score'),
  recDefaults: DS.belongsTo('recDefault'),

  // Flag to reload, not apart of the model, obviously
  //runReload: DS.attr('boolean'), Doesn't work!

  // Not part of the model proper, these are read after the fact and added in the route
  homeDepartureTime: DS.attr('string'),
  workDepartureTime: DS.attr('string'),
  homeDepartureTimestamp: DS.attr('number'),
  workDepartureTimestamp: DS.attr('number'),

  memberAsDriverDeflectNumber: function () {
    var mad = this.get('memberAsDriver');

    if (!Ember.isNone(mad)) {
      return (mad.get('outboundLeg').get('deflectMeters') + mad.get('returnLeg').get('deflectMeters'))/2;
    }

    return 'N/A';
  }.property('memberAsDriver'),

  riderAsDriverDeflectNumber: function () {
    var rad = this.get('riderAsDriver');

    if (!Ember.isNone(rad)) {
      return (rad.get('outboundLeg').get('deflectMeters') + rad.get('returnLeg').get('deflectMeters'))/2;
    }

    return 'N/A';
  }.property('riderAsDriver'),

  matchScoreColor: function() {
    var matchScore = this.get('matchScore');

    if (matchScore >= 85) {
      return 'green';
    } else if (matchScore >= 70) {
      return 'blue';
    } else if (matchScore > 0) {
      return 'purple';
    } else {
      return 'gray';
    }
  }.property('matchScore'),

  compScoreColor: function() {
    var matchScore = this.get('scores.compatibility');

    if (matchScore >= 85) {
      return 'green';
    } else if (matchScore >= 70) {
      return 'blue';
    } else if (matchScore > 0) {
      return 'purple';
    } else {
      return 'gray';
    }
  }.property('scores.compatibility'),

  kilometersBetweenOrigins: function() {
    return this.get('metersBetweenOrigins') / 1000;
  }.property('metersBetweenOrigins'),

  kilometersBetweenDests: function() {
    return this.get('metersBetweenDests') / 1000;
  }.property('metersBetweenDests'),

  milesBetweenOrigins: function() {
    return Math.round(this.get('metersBetweenOrigins') * 0.0621371) / 100;
  }.property('metersBetweenOrigins'),

  milesBetweenDests: function() {
    return Math.round(this.get('metersBetweenDests') * 0.0621371) /100;
  }.property('metersBetweenDests'),

  //
  // This is a utility function used for debugging.
  // We have two endpoints for recommendations and this will fail for the one that doesn't return memberAsDriver
  // This endpoint has memberAsDriver:
  // GET /api/v1/members/{memberId}/recommendations/riders/{riderId}
  // and this endpoint does not:
  // GET api/v1/members/149/recommendations
  // So, if you want to use this with the second endpoint, you'll need to add some error handling for null memberAsDriver
  //
  // toString: function() {
    // var w1='  ', w2='  ', w3='  ', w4='  ';
    // this.get('memberAsDriver.outboundLeg.waypoints').forEach(function(point){
      // w1 += JSON.stringify(point) + '\n  ';
    // });
    // this.get('memberAsDriver.returnLeg.waypoints').forEach(function(point){
      // w2 += JSON.stringify(point) + '\n  ';
    // });
    // this.get('riderAsDriver.outboundLeg.waypoints').forEach(function(point){
      // w3 += JSON.stringify(point) + '\n  ';
    // });
    // this.get('riderAsDriver.returnLeg.waypoints').forEach(function(point){
      // w4 += JSON.stringify(point) + '\n  ';
    // });

    // return JSON.stringify(this) + '\n:: ' +
      // JSON.stringify(this.get('memberAsDriver')) + ' :\n ' +
        // JSON.stringify(this.get('memberAsDriver.outboundLeg')) +' \n' + w1 + ' :\n ' +
        // JSON.stringify(this.get('memberAsDriver.returnLeg'))  +' \n' + w2 + '\n:: ' +
      // JSON.stringify(this.get('riderAsDriver')) + ' :\n ' +
        // JSON.stringify(this.get('riderAsDriver.outboundLeg'))  +' \n' + w3 + ' :\n ' +
        // JSON.stringify(this.get('riderAsDriver.returnLeg')) +' \n' + w4;
  // }


  // Additional value for rides
  invited: DS.attr(),

  // TODO:
  // Shouldn't need these but... Since EmberData doesn't like to load the member info right away, we need these as a ref
  memberId: DS.attr('string')
});

export default Recommendation;
