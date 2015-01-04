var MatchTwoSerializer = DS.RESTSerializer.extend({
/*
 e.g. POST /api/v1/matchTwos

{ "matchTwos" : [
  { "date" : 1414306800000,
    "driverId" : 106,
    "id" : 6697,
    "memberAsDriver" : {
      "id" : 6698,
      "outboundLeg" : {
        "carbs" : 0.0,
        "deflectMeters" : 1004,
        "deflectMinutes" : 7,
        "id" : 6699,
        "savingsMeters" : -173,
        "waypoints" : [
          { "id" : 6700,
            "locationId" : 108,
            "meters" : 0,
            "minutes" : 0,
            "orientation" : "origin",
            "owner" : "member"
          },
          { "id" : 6701,
            "locationId" : 3225,
            "meters" : 50702,
            "minutes" : 45,
            "orientation" : "origin",
            "owner" : "rider"
          },
          { "id" : 6702,
            "locationId" : 58,
            "meters" : 831,
            "minutes" : 2,
            "orientation" : "dest",
            "owner" : "mutual"
          }
        ]
      },
      "returnLeg" : { ... }
    },
    "memberHomeLocationId" : 108,
    "memberWorkLocationId" : 58,
    "pickupTimestamp" : 1414368000000,
    "returnTimestamp" : 1414368000000,
    "riderAsDriver" : null,
    "riderHomeLocationId" : 3225,
    "riderId" : 122,
    "riderWorkLocationId" : 58,
    "status" : null
  },
  { ... }
  ]
}
*/
  extractSingle: function(store, type, payload, id, requestType) {

    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(payload) {
    /**
     * Used to process the waypoints in each leg.
     *
     * @param wps Waypoints to be processed
     * @returns {Array} of waypoint ids processed
     */
    function processWaypoints (waypoints, wps) {
      var tmpArray = [];                                // Will how array of waypoint ids
      wps.forEach(function(waypoint){
        if (waypoint.orientation === 'origin') {
          waypoint.homeLocation = waypoint.locationId;  // this is a home location id
        } else {
          waypoint.location = waypoint.locationId;      // this is a company location id
        }
        delete waypoint.locationId;                     // Don't need it anymore
        waypoints.push(waypoint);                       // store the waypoint
        tmpArray.push(waypoint.id);                     // save the waypoint id to return
      });
      return tmpArray;
    }

    // TODO - these IDs should be deleted, but we're leaving them in for now.
    // They should be deleted because Ember is supposed to fully populate the associated object
    // but it's not.  So later we're manually doing an async call to get the data assocated with the ID.
    // The correct solution is to get Ember to populate the object.

    if(!Ember.isNone(payload.matchTwo.driverId)) {
      payload.matchTwo.driver = payload.matchTwo.driverId;
      // TODO - trim out this ID, like so:
      // delete payload.matchTwo.driverId;
    }

    // Dummy var for trip routines to use... We know the driver is the owner...
    if(!Ember.isNone(payload.matchTwo.driverId)) {
      payload.matchTwo.owner = payload.matchTwo.driverId;
    }

//    if(!Ember.isNone(payload.matchTwo.ownerId)) {
//      payload.matchTwo.owner = payload.matchTwo.ownerId;
//      // TODO - trim out this ID, like so:
//      // delete payload.matchTwo.ownerId;
//    }

    if(!Ember.isNone(payload.matchTwo.riderId)) {
      payload.matchTwo.rider = payload.matchTwo.riderId;
      // TODO - trim out this ID, like so:
      // delete payload.matchTwo.riderId;
    }

    if(!Ember.isNone(payload.matchTwo.tripId)) {
      payload.matchTwo.trip = payload.matchTwo.tripId;
      // TODO - trim out this ID, like so:
      // delete payload.matchTwo.tripId;
    }

    if(!Ember.isNone(payload.matchTwo.memberHomeLocationId)) {
      payload.matchTwo.memberHomeLocation = payload.matchTwo.memberHomeLocationId;
      delete payload.matchTwo.memberHomeLocationId;
    }

    if(!Ember.isNone(payload.matchTwo.memberWorkLocationId)) {
      payload.matchTwo.memberWorkLocation = payload.matchTwo.memberWorkLocationId;
      delete payload.matchTwo.memberWorkLocationId;
    }

    if(!Ember.isNone(payload.matchTwo.riderHomeLocationId)) {
      payload.matchTwo.riderHomeLocation = payload.matchTwo.riderHomeLocationId;
      delete payload.matchTwo.riderHomeLocationId;
    }

    if(!Ember.isNone(payload.matchTwo.riderWorkLocationId)) {
      payload.matchTwo.riderWorkLocation = payload.matchTwo.riderWorkLocationId;
      delete payload.matchTwo.riderWorkLocationId;
    }

    payload.memberAsDriver = [];
    payload.riderAsDriver = [];
    payload.outboundLeg = [];
    payload.returnLeg = [];
    payload.waypoints = [];

    // Process the memberAsDriver object
    var mad = payload.matchTwo.memberAsDriver, t;
    if (!Ember.isNone(mad)) {
      if(!Ember.isNone(mad.outboundLeg)) {
        t = processWaypoints(payload.waypoints, mad.outboundLeg.waypoints);
        delete mad.outboundLeg.waypoints;
        mad.outboundLeg.waypoints = t;
        payload.outboundLeg.push(mad.outboundLeg);
        mad.outboundLeg = mad.outboundLeg.id;
      }
      if(!Ember.isNone(mad.returnLeg)) {
        t = processWaypoints(payload.waypoints, mad.returnLeg.waypoints);
        delete mad.returnLeg.waypoints;
        mad.returnLeg.waypoints = t;
        payload.returnLeg.push(mad.returnLeg);
        mad.returnLeg = mad.returnLeg.id;
      }

      payload.memberAsDriver.push(mad);
      payload.matchTwo.memberAsDriver = payload.matchTwo.memberAsDriver.id;
    }

    // Process the riderAsDriver object
    var rad = payload.matchTwo.riderAsDriver;
    if (!Ember.isNone(rad)) {
      if(!Ember.isNone(rad.outboundLeg)) {
        t = processWaypoints(payload.waypoints, rad.outboundLeg.waypoints);
        delete rad.outboundLeg.waypoints;
        rad.outboundLeg.waypoints = t;
        payload.outboundLeg.push(rad.outboundLeg);
        rad.outboundLeg = rad.outboundLeg.id;
      }
      if(!Ember.isNone(rad.returnLeg)) {
        t = processWaypoints(payload.waypoints, rad.returnLeg.waypoints);
        delete rad.returnLeg.waypoints;
        rad.returnLeg.waypoints = t;
        payload.returnLeg.push(rad.returnLeg);
        rad.returnLeg = rad.returnLeg.id;
      }

      payload.riderAsDriver.push(rad);
      payload.matchTwo.riderAsDriver = payload.matchTwo.riderAsDriver.id;
    }

    return payload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this,
        singlePayload,
        newPayload = {
          matchTwos: []
        },
        memberAsDriver = [],
        riderAsDriver = [],
        outboundLeg = [],
        returnLeg = [],
        waypoints = [];

    payload.matchTwos.forEach(function(matchTwo) {
      singlePayload = serializer.munge({ matchTwo: matchTwo });

      newPayload.matchTwos.push(singlePayload.matchTwo);
      if (!Ember.isEmpty(singlePayload.memberAsDriver)) {
        singlePayload.memberAsDriver.forEach(function(mAD){
          memberAsDriver.push(mAD);
        });
      }
      if (!Ember.isEmpty(singlePayload.riderAsDriver)) {
        singlePayload.riderAsDriver.forEach(function(rAD){
          riderAsDriver.push(rAD);
        });
      }
      if (!Ember.isEmpty(singlePayload.outboundLeg)) {
        singlePayload.outboundLeg.forEach(function(oL){
          outboundLeg.push(oL);
        });
      }
      if (!Ember.isEmpty(singlePayload.returnLeg)) {
        singlePayload.returnLeg.forEach(function(rL){
          returnLeg.push(rL);
        });
      }
      if (!Ember.isEmpty(singlePayload.waypoints)) {
        singlePayload.waypoints.forEach(function(waypoint){
          waypoints.push(waypoint);
        });
      }

    });

    newPayload.memberAsDriver = memberAsDriver;
    newPayload.riderAsDriver = riderAsDriver;
    newPayload.outboundLeg = outboundLeg;
    newPayload.returnLeg = returnLeg;
    newPayload.waypoints = waypoints;

    return this._super(store, type, newPayload, id, requestType);
  },

  serialize: function(matchTwo, options) {
    var json = this._super(matchTwo, options);

    json.driverId = json.driver;
//    json.ownerId = json.owner;
    json.riderId = json.rider;
    json.memberHomeLocationId = json.memberHomeLocation;
    json.memberWorkLocationId = json.memberWorkLocation;
    json.riderHomeLocationId = json.riderHomeLocation;
    json.riderWorkLocationId = json.riderWorkLocation;

    delete json.driver;
//    delete json.owner;
    delete json.rider;
    delete json.memberHomeLocation;
    delete json.memberWorkLocation;
    delete json.riderHomeLocation;
    delete json.riderWorkLocation;

    return json;
  }
});

export default MatchTwoSerializer;