var RecommendationSerializer = DS.RESTSerializer.extend({

  extractSingle: function(store, type, payload, id, requestType) {
    payload = this.munge(payload.recommendation);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function (recommendation) {

    var newPayload =
      {
        recommendation: null, homeAddresses: [], homeLocations: [],
        companyAddresses: [], locations: [], waypoints: [], outboundLeg: [], returnLeg: [], memberAsDriver: [], riderAsDriver: [], scores: [], recDefaults: []
      };

    // Delete these since we're not using them for now.
    delete recommendation.postIntersection;

    if (!Ember.isNone(recommendation.memberId)) {
      recommendation.member = recommendation.memberId;
//      delete recommendation.memberId;
    }

    if (!Ember.isNone(recommendation.recDefaults)) {
      newPayload.recDefaults.push(recommendation.recDefaults);
      recommendation.recDefaults = recommendation.recDefaults.id;
    }

    /**
     * Used to process the waypoints in each leg.
     *
     * NOTE: I know, I know... Shouldn't be accessing the globals here, but what are you going to do.
     *
     * @param wps Waypoints to be processed
     * @returns {Array} of waypoint ids processed
     */
    function processWaypoints(wps) {
      var tmpWaypoints = [];            // Will how array of waypoint ids
      wps.forEach(function(waypoint){
        if (waypoint.orientation === 'origin') {
          newPayload.homeAddresses.push(waypoint.location.address);         // save the addresses
          waypoint.location.homeAddress = waypoint.location.address.id;     // create new property to store the id
          newPayload.homeLocations.push(waypoint.location);                 // save the location
          waypoint.homeLocation = waypoint.location.id;                     // create new property to store the id
          delete waypoint.location.address;                                 // remove the old object
          delete waypoint.location;                                         // remove the old object
        } else {
          newPayload.companyAddresses.push(waypoint.location.address);      // save the addresses
          waypoint.location.companyAddress = waypoint.location.address.id;  // create new property to store the id
          newPayload.locations.push(waypoint.location);                     // save the location
          waypoint.location = waypoint.location.id;                         // create new property to store the id
          delete waypoint.location.address;                                 // remove the old object
        }
        newPayload.waypoints.push(waypoint);                                // store the waypoint
        tmpWaypoints.push(waypoint.id);                                     // save the waypoint id to return
      });
      return tmpWaypoints;
    }

    var t;

    // Process the memberAsDriver object
    var mad = recommendation.memberAsDriver;
    if (!Ember.isNone(mad)) {
      t = processWaypoints(mad.outboundLeg.waypoints);

      delete mad.outboundLeg.waypoints;
      mad.outboundLeg.waypoints = t;
      t = processWaypoints(mad.returnLeg.waypoints);
      delete mad.returnLeg.waypoints;
      mad.returnLeg.waypoints = t;

      newPayload.outboundLeg.push(mad.outboundLeg);
      newPayload.returnLeg.push(mad.returnLeg);
      mad.outboundLeg = mad.outboundLeg.id;
      mad.returnLeg = mad.returnLeg.id;
      newPayload.memberAsDriver.push(mad);
      recommendation.memberAsDriver = recommendation.memberAsDriver.id;
    }

    // Process the riderAsDriver object
    var rad = recommendation.riderAsDriver;
    if (!Ember.isNone(rad)) {
      t = processWaypoints(rad.outboundLeg.waypoints);
      delete rad.outboundLeg.waypoints;
      rad.outboundLeg.waypoints = t;
      t = processWaypoints(rad.returnLeg.waypoints);
      delete rad.returnLeg.waypoints;
      rad.returnLeg.waypoints = t;

      newPayload.outboundLeg.push(rad.outboundLeg);
      newPayload.returnLeg.push(rad.returnLeg);
      rad.outboundLeg = rad.outboundLeg.id;
      rad.returnLeg = rad.returnLeg.id;
      newPayload.riderAsDriver.push(rad);
      recommendation.riderAsDriver = recommendation.riderAsDriver.id;
    }

    newPayload.scores.push (recommendation.scores);
    recommendation.scores = recommendation.scores.id;

    newPayload.recommendation = recommendation;

    return newPayload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var recommendations = payload.recommendations,
      serializer = this,
      newPayload = {},
      homeLocations = [],
      homeAddresses = [],
      memberAsDriver = [],
      riderAsDriver = [],
      outboundLeg = [],
      returnLeg = [],
      scores = [],
      recDefaults = [],
      waypoints = [],
      locations = [],
      companyAddresses = [],
      goodRecommendations = [];

    recommendations.forEach(function(recommendation) {
      try {
        var singlePayload = serializer.munge(recommendation);

        if (!Ember.isEmpty(singlePayload.homeLocations)){
          singlePayload.homeLocations.forEach(function(homeLocation) {
            homeLocations.push(homeLocation);
          });
        }
        if (!Ember.isEmpty(singlePayload.homeAddresses)){
          singlePayload.homeAddresses.forEach(function(homeAddress) {
            homeAddresses.push(homeAddress);
          });
        }
        if (!Ember.isEmpty(singlePayload.memberAsDriver)){
          singlePayload.memberAsDriver.forEach(function(mad) {
            memberAsDriver.push(mad);
          });
        }
        if (!Ember.isEmpty(singlePayload.riderAsDriver)){
          singlePayload.riderAsDriver.forEach(function(rad) {
            riderAsDriver.push(rad);
          });
        }
        if (!Ember.isEmpty(singlePayload.outboundLeg)){
          singlePayload.outboundLeg.forEach(function(out) {
            outboundLeg.push(out);
          });
        }
        if (!Ember.isEmpty(singlePayload.returnLeg)){
          singlePayload.returnLeg.forEach(function(ret) {
            returnLeg.push(ret);
          });
        }
        if (!Ember.isEmpty(singlePayload.scores)){
          singlePayload.scores.forEach(function(score) {
            scores.push(score);
          });
        }
        if (!Ember.isEmpty(singlePayload.recDefaults)){
          singlePayload.recDefaults.forEach(function(recDefault) {
            recDefaults.push(recDefault);
          });
        }
        if (!Ember.isEmpty(singlePayload.waypoints)){
          singlePayload.waypoints.forEach(function(way) {
            waypoints.push(way);
          });
        }
        if (!Ember.isEmpty(singlePayload.locations)){
          singlePayload.locations.forEach(function(loc) {
            locations.push(loc);
          });
        }
        if (!Ember.isEmpty(singlePayload.companyAddresses)){
          singlePayload.companyAddresses.forEach(function(coa) {
            companyAddresses.push(coa);
          });
        }
        if (!Ember.isEmpty(singlePayload.recommendation)){
          goodRecommendations.push(singlePayload.recommendation);
        }
      } catch(e) {
        Ember.Logger.debug("Error Recommendation Serializer parsing recommendation id: " + recommendation.id + "\n" + e.stack );
      }
    });

    newPayload.recommendations = goodRecommendations;
    newPayload.homeLocations = homeLocations;
    newPayload.homeAddresses = homeAddresses;
    newPayload.memberAsDriver = memberAsDriver;
    newPayload.riderAsDriver = riderAsDriver;
    newPayload.outboundLeg = outboundLeg;
    newPayload.returnLeg = returnLeg;
    newPayload.scores = scores;
    newPayload.recDefaults = recDefaults;
    newPayload.waypoints = waypoints;
    newPayload.locations = locations;
    newPayload.companyAddresses = companyAddresses;

    return this._super(store, type, newPayload, id, requestType);
  }
});

export default RecommendationSerializer;
