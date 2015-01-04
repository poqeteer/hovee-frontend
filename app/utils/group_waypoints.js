import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var GroupWaypoints = Ember.Object.extend({

  /**
   * Loop through the waypoints and put them into their groups
   *
   * @param waypoints
   * @param originMemberLocations
   * @param destMemberLocations
   * @param originRiderLocations
   * @param destRiderLocations
   */
  processWaypoints: function (waypoints, originMemberLocations, destMemberLocations, originRiderLocations, destRiderLocations) {
    var i = 0;
    /**
     * Used to generate the waypoint objects
     *
     * @param waypoint
     * @param i
     * @returns {{locationId: *, meters: *, minutes: *, orientation: *, owner: *}}
     */
    function makeLocationObj (waypoint, i) {
      var name = '';
      if (waypoint.get('orientation') === 'origin') {
        name = waypoint.get('homeLocation.homeAddress.street') + ', ' + waypoint.get('homeLocation.homeAddress.city');
      } else {
        name = waypoint.get('location.companyAddress.street') + ', ' + waypoint.get('location.companyAddress.city');
      }
//    if (name === 'null, null' || name === 'undefined, undefined') {
//      Ember.Logger.error(JSON.stringify("group_waypoints.js :: makeLocationObj :: Waypoint missing location data - " + waypoint));
//    }
      return {name: name, meters: waypoint.get('meters'), owner: waypoint.get('owner'), minutes: waypoint.get('minutes'), id: i};
    }

    waypoints.forEach(function(waypoint){
      var owner = waypoint.get('owner'),
        orientation = waypoint.get('orientation');

      if (orientation === 'origin') {
        if (owner === 'member' || owner === 'mutual'){
          originMemberLocations.push(makeLocationObj(waypoint, i));
        }
        if (owner === 'rider' || owner === 'mutual') {
          originRiderLocations.push(makeLocationObj(waypoint, i));
        }
      } else { //(orientation === 'dest')
        if (owner === 'member' || owner === 'mutual'){
          destMemberLocations.push(makeLocationObj(waypoint, i));
        }
        if (owner === 'rider' || owner === 'mutual') {
          destRiderLocations.push(makeLocationObj(waypoint, i));
        }
      }
      i++;
    });
  },
  /**
   * The purpose of this function is to breakup the waypoints into groups and put them in the controller for easier handling later.
   *
   * @param controller To put the groups into, if null/undefined then return an object with the groups
   * @param trip Containing the waypoints to process
   */
  groupWaypoints: function (controller, trip, reverse) {
    // Used to store the waypoints into groups
    var memberAsDriverOutboundMemberOriginLocations = [],
        memberAsDriverOutboundMemberDestinationLocations = [],
        memberAsDriverOutboundRiderOriginLocations = [],
        memberAsDriverOutboundRiderDestinationLocations = [],

        memberAsDriverReturnMemberOriginLocations = [],
        memberAsDriverReturnMemberDestinationLocations = [],
        memberAsDriverReturnRiderOriginLocations = [],
        memberAsDriverReturnRiderDestinationLocations = [],

        riderAsDriverOutboundMemberOriginLocations = [],
        riderAsDriverOutboundMemberDestinationLocations = [],
        riderAsDriverOutboundRiderOriginLocations = [],
        riderAsDriverOutboundRiderDestinationLocations = [],

        riderAsDriverReturnMemberOriginLocations = [],
        riderAsDriverReturnMemberDestinationLocations = [],
        riderAsDriverReturnRiderOriginLocations = [],
        riderAsDriverReturnRiderDestinationLocations = [];

    // Pointers to waypoints
    var memberAsDriverOutboundLegWaypoints = trip.get('memberAsDriver.outboundLeg.waypoints'),
        memberAsDriverReturnLegWaypoints =   trip.get('memberAsDriver.returnLeg.waypoints'),
        riderAsDriverOutboundLegWaypoints =  trip.get('riderAsDriver.outboundLeg.waypoints'),
        riderAsDriverReturnLegWaypoints =    trip.get('riderAsDriver.returnLeg.waypoints');

    // if the memberAsDriver objects don't exist, then probably doesn't have a car
    if (memberAsDriverOutboundLegWaypoints !== null) {
      this.processWaypoints(memberAsDriverOutboundLegWaypoints,
        memberAsDriverOutboundMemberOriginLocations,
        memberAsDriverOutboundMemberDestinationLocations,
        memberAsDriverOutboundRiderOriginLocations,
        memberAsDriverOutboundRiderDestinationLocations );

    }
    if (memberAsDriverReturnLegWaypoints !== null) {
      this.processWaypoints(memberAsDriverReturnLegWaypoints,
        memberAsDriverReturnMemberOriginLocations,
        memberAsDriverReturnMemberDestinationLocations,
        memberAsDriverReturnRiderOriginLocations,
        memberAsDriverReturnRiderDestinationLocations );
    }
    // if the riderAsDriver objects don't exist, then probably doesn't have a car
    if (riderAsDriverOutboundLegWaypoints !== null) {
      this.processWaypoints(riderAsDriverOutboundLegWaypoints,
        riderAsDriverOutboundMemberOriginLocations,
        riderAsDriverOutboundMemberDestinationLocations,
        riderAsDriverOutboundRiderOriginLocations,
        riderAsDriverOutboundRiderDestinationLocations );
    }
    if (riderAsDriverReturnLegWaypoints !== null) {
      this.processWaypoints(riderAsDriverReturnLegWaypoints,
        riderAsDriverReturnMemberOriginLocations,
        riderAsDriverReturnRiderOriginLocations,
        riderAsDriverReturnMemberDestinationLocations,
        riderAsDriverReturnRiderDestinationLocations );
    }

    // See if the caller wants to reverse the waypoint groups
    if (!Ember.isNone(reverse) && reverse) {

      // See if we are dealing with an actual controller
      if (Ember.isNone(controller)){

        return {
          memberAsDriverOutboundMemberOriginLocations:      riderAsDriverOutboundRiderOriginLocations,
          memberAsDriverOutboundMemberDestinationLocations: riderAsDriverOutboundRiderDestinationLocations,
          memberAsDriverOutboundRiderOriginLocations:       riderAsDriverOutboundMemberOriginLocations,
          memberAsDriverOutboundRiderDestinationLocations:  riderAsDriverOutboundMemberDestinationLocations,

          memberAsDriverReturnMemberOriginLocations:        riderAsDriverReturnRiderOriginLocations,
          memberAsDriverReturnMemberDestinationLocations:   riderAsDriverReturnRiderDestinationLocations,
          memberAsDriverReturnRiderOriginLocations:         riderAsDriverReturnMemberOriginLocations,
          memberAsDriverReturnRiderDestinationLocations:    riderAsDriverReturnMemberDestinationLocations,

          riderAsDriverOutboundMemberOriginLocations:       memberAsDriverOutboundRiderOriginLocations,
          riderAsDriverOutboundMemberDestinationLocations:  memberAsDriverOutboundRiderDestinationLocations,
          riderAsDriverOutboundRiderOriginLocations:        memberAsDriverOutboundMemberOriginLocations,
          riderAsDriverOutboundRiderDestinationLocations:   memberAsDriverOutboundMemberDestinationLocations,

          riderAsDriverReturnMemberOriginLocations:         memberAsDriverReturnRiderOriginLocations,
          riderAsDriverReturnMemberDestinationLocations:    memberAsDriverReturnRiderDestinationLocations,
          riderAsDriverReturnRiderOriginLocations:          memberAsDriverReturnMemberOriginLocations,
          riderAsDriverReturnRiderDestinationLocations:     memberAsDriverReturnMemberDestinationLocations
        };

      } else {

        // Finally copy the groups to the controller
        controller.set('memberAsDriverOutboundMemberOriginLocations',      riderAsDriverOutboundRiderOriginLocations);
        controller.set('memberAsDriverOutboundMemberDestinationLocations', riderAsDriverOutboundRiderDestinationLocations);
        controller.set('memberAsDriverOutboundRiderOriginLocations',       riderAsDriverOutboundMemberOriginLocations);
        controller.set('memberAsDriverOutboundRiderDestinationLocations',  riderAsDriverOutboundMemberDestinationLocations);

        controller.set('memberAsDriverReturnMemberOriginLocations',        riderAsDriverReturnRiderOriginLocations);
        controller.set('memberAsDriverReturnMemberDestinationLocations',   riderAsDriverReturnRiderDestinationLocations);
        controller.set('memberAsDriverReturnRiderOriginLocations',         riderAsDriverReturnMemberOriginLocations);
        controller.set('memberAsDriverReturnRiderDestinationLocations',    riderAsDriverReturnMemberDestinationLocations);

        controller.set('riderAsDriverOutboundMemberOriginLocations',       memberAsDriverOutboundRiderOriginLocations);
        controller.set('riderAsDriverOutboundMemberDestinationLocations',  memberAsDriverOutboundRiderDestinationLocations);
        controller.set('riderAsDriverOutboundRiderOriginLocations',        memberAsDriverOutboundMemberOriginLocations);
        controller.set('riderAsDriverOutboundRiderDestinationLocations',   memberAsDriverOutboundMemberDestinationLocations);

        controller.set('riderAsDriverReturnMemberOriginLocations',         memberAsDriverReturnRiderOriginLocations);
        controller.set('riderAsDriverReturnMemberDestinationLocations',    memberAsDriverReturnRiderDestinationLocations);
        controller.set('riderAsDriverReturnRiderOriginLocations',          memberAsDriverReturnMemberOriginLocations);
        controller.set('riderAsDriverReturnRiderDestinationLocations',     memberAsDriverReturnMemberDestinationLocations);

      }

    } else {

      // See if we are dealing with an actual controller
      if (Ember.isNone(controller)){

        return {
          memberAsDriverOutboundMemberOriginLocations:      memberAsDriverOutboundMemberOriginLocations,
          memberAsDriverOutboundMemberDestinationLocations: memberAsDriverOutboundMemberDestinationLocations,
          memberAsDriverOutboundRiderOriginLocations:       memberAsDriverOutboundRiderOriginLocations,
          memberAsDriverOutboundRiderDestinationLocations:  memberAsDriverOutboundRiderDestinationLocations,

          memberAsDriverReturnMemberOriginLocations:        memberAsDriverReturnMemberOriginLocations,
          memberAsDriverReturnMemberDestinationLocations:   memberAsDriverReturnMemberDestinationLocations,
          memberAsDriverReturnRiderOriginLocations:         memberAsDriverReturnRiderOriginLocations,
          memberAsDriverReturnRiderDestinationLocations:    memberAsDriverReturnRiderDestinationLocations,

          riderAsDriverOutboundMemberOriginLocations:       riderAsDriverOutboundMemberOriginLocations,
          riderAsDriverOutboundMemberDestinationLocations:  riderAsDriverOutboundMemberDestinationLocations,
          riderAsDriverOutboundRiderOriginLocations:        riderAsDriverOutboundRiderOriginLocations,
          riderAsDriverOutboundRiderDestinationLocations:   riderAsDriverOutboundRiderDestinationLocations,

          riderAsDriverReturnMemberOriginLocations:         riderAsDriverReturnMemberOriginLocations,
          riderAsDriverReturnMemberDestinationLocations:    riderAsDriverReturnMemberDestinationLocations,
          riderAsDriverReturnRiderOriginLocations:          riderAsDriverReturnRiderOriginLocations,
          riderAsDriverReturnRiderDestinationLocations:     riderAsDriverReturnRiderDestinationLocations
        };

      } else {

        // Finally copy the groups to the controller
        controller.set('memberAsDriverOutboundMemberOriginLocations',      memberAsDriverOutboundMemberOriginLocations);
        controller.set('memberAsDriverOutboundMemberDestinationLocations', memberAsDriverOutboundMemberDestinationLocations);
        controller.set('memberAsDriverOutboundRiderOriginLocations',       memberAsDriverOutboundRiderOriginLocations);
        controller.set('memberAsDriverOutboundRiderDestinationLocations',  memberAsDriverOutboundRiderDestinationLocations);

        controller.set('memberAsDriverReturnMemberOriginLocations',        memberAsDriverReturnMemberOriginLocations);
        controller.set('memberAsDriverReturnMemberDestinationLocations',   memberAsDriverReturnMemberDestinationLocations);
        controller.set('memberAsDriverReturnRiderOriginLocations',         memberAsDriverReturnRiderOriginLocations);
        controller.set('memberAsDriverReturnRiderDestinationLocations',    memberAsDriverReturnRiderDestinationLocations);

        controller.set('riderAsDriverOutboundMemberOriginLocations',       riderAsDriverOutboundMemberOriginLocations);
        controller.set('riderAsDriverOutboundMemberDestinationLocations',  riderAsDriverOutboundMemberDestinationLocations);
        controller.set('riderAsDriverOutboundRiderOriginLocations',        riderAsDriverOutboundRiderOriginLocations);
        controller.set('riderAsDriverOutboundRiderDestinationLocations',   riderAsDriverOutboundRiderDestinationLocations);

        controller.set('riderAsDriverReturnMemberOriginLocations',         riderAsDriverReturnMemberOriginLocations);
        controller.set('riderAsDriverReturnMemberDestinationLocations',    riderAsDriverReturnMemberDestinationLocations);
        controller.set('riderAsDriverReturnRiderOriginLocations',          riderAsDriverReturnRiderOriginLocations);
        controller.set('riderAsDriverReturnRiderDestinationLocations',     riderAsDriverReturnRiderDestinationLocations);

      }

    }
  },

  /**
   * This function will compute and return the pickup and return times from the rider's perspective. Doesn't matter if
   * the trip is a child or parent trip.
   *
   * @param trip
   * @param memberId
   * @param memberAsDriverOutboundRiderOriginLocations
   * @param riderAsDriverOutboundMemberOriginLocations
   * @param memberAsDriverOutboundMemberDestinationLocations
   * @param riderAsDriverOutboundRiderDestinationLocations
   * @returns {{homeDepartureTime: string, workDepartureTime: string}}
   */
  computeReversePickupReturnTimes: function(trip, memberId,
                                            memberAsDriverOutboundRiderOriginLocations, riderAsDriverOutboundMemberOriginLocations,
                                            memberAsDriverOutboundMemberDestinationLocations, riderAsDriverOutboundRiderDestinationLocations){

    var memberIsDriver = trip.get('driverId') === memberId;

    // Basically we have to reverse the logic in the make_proposal *Change observers...
    var homeDepartureTime = '';
    try {
      // First set the home departure time... Note: Don't think the actual order of setting the times matter, but...
      var timeToPassengerHome = memberIsDriver ? memberAsDriverOutboundRiderOriginLocations.minutes : riderAsDriverOutboundMemberOriginLocations.minutes;

      if (memberIsDriver) timeToPassengerHome = -timeToPassengerHome;

      homeDepartureTime = new TimeDateFormatting().formatNextTime(timezonejsDate('January 1, 1970 ' + trip.get('formatTimePickup')), timeToPassengerHome);
    } catch (e) {
      // do nothing
    }

    var workDepartureTime = '';
    try {
      // Then set the work departure time
      var timeToDriverWork = memberIsDriver ?
        memberAsDriverOutboundMemberDestinationLocations.owner === 'mutual' ?
          0 :
          memberAsDriverOutboundMemberDestinationLocations.minutes :
        riderAsDriverOutboundRiderDestinationLocations.owner === 'mutual' ?
          0 :
          riderAsDriverOutboundRiderDestinationLocations.minutes;

      if (memberIsDriver) timeToDriverWork = -timeToDriverWork;

      workDepartureTime = new TimeDateFormatting().formatNextTime(timezonejsDate('January 1, 1970 ' + trip.get('formatTimeReturn')), timeToDriverWork);
    } catch (e) {
      // do nothing
    }

    return {homeDepartureTime: homeDepartureTime, workDepartureTime: workDepartureTime};
  },

  /**
   * Okay this will recompute and set the pickup and return timestamps of the trip from the rider's perspective. It
   * doesn't care if the trip is a child or parent trip.
   *
   * NOTE: The old pickupTime and returnTime variables are used to hold the recomputed times
   *
   * @param trip
   * @param currentMemberId
   */
  recomputeAndSetPickupReturnTimes: function (trip, currentMemberId) {
    var tmpController = this.groupWaypoints(null, trip, true);

    var times = this.computeReversePickupReturnTimes( trip, currentMemberId,
      tmpController.memberAsDriverOutboundRiderOriginLocations[0],
      tmpController.riderAsDriverOutboundMemberOriginLocations[0],
      tmpController.memberAsDriverOutboundMemberDestinationLocations[0],
      tmpController.riderAsDriverOutboundRiderDestinationLocations[0] );

    if (!Ember.isNone(trip.get('pickupTimestamp'))) {
      trip.set('pickupTime', times.homeDepartureTime);
    }
    if (!Ember.isNone(trip.get('returnTimestamp'))) {
      trip.set('returnTime', times.workDepartureTime);
    }
  },

  reviewTrip: function(controller, trip, memberId) {
    // Now lookup the member information... Because it isn't loaded automatically... And we need the info now!
    Ember.RSVP.hash({
      owner: trip.get('owner'),
      rider: trip.get('rider'),
      memberHomeLocation: trip.get('memberHomeLocation'),
      memberWorkLocation: trip.get('memberWorkLocation'),
      riderHomeLocation: trip.get('riderHomeLocation'),
      riderWorkLocation: trip.get('riderWorkLocation')
    }).
      then(function(info) {

        var memberIsDriver = trip.get('driverId') === memberId;
        var ownerIsMember = info.owner.id === memberId;

        if (ownerIsMember) {
          controller.set('partner', info.rider);
        } else {
          controller.set('partner', info.owner);
        }

        var gw = new GroupWaypoints();
        gw.groupWaypoints(controller, trip, !ownerIsMember);  // put all the waypoints into groups and put them into the controller

        // Note: These clears must happen before the reviewTrip...
        controller.set('timePassengerHomeToPassengerWork', 0); // Order matters... This must come before homeDepartureTime else will not clear properly
        controller.set('homeDepartureTime', '');
        controller.set('workDepartureTime', '');

        // What follows shouldn't have to be done but... When loading the page "fresh" the location information is not being loaded right away into the waypoints making the
        // waypoints useless for storing the names of the locations. The "hard" data is fine so that info is intact. To compensate, I created a dummy selection containing
        // the necessary information in to the selected value of what should be a dropdown/combobox/select list.

        var memberAsDriverOutboundRiderOriginLocations = controller.get('memberAsDriverOutboundRiderOriginLocations');
        var memberAsDriverOutboundRiderDestinationLocations = controller.get('memberAsDriverOutboundRiderDestinationLocations');
        var riderAsDriverOutboundMemberOriginLocations = controller.get('riderAsDriverOutboundMemberOriginLocations');
        var riderAsDriverOutboundMemberDestinationLocations = controller.get('riderAsDriverOutboundMemberDestinationLocations');

        var memberHomeName = trip.get('memberHomeLocation.homeAddress.street') + ' ' + trip.get('memberHomeLocation.homeAddress.city');
        var memberWorkName = trip.get('memberWorkLocation.companyAddress.street') + ' ' + trip.get('memberWorkLocation.companyAddress.city');
        var riderHomeName = trip.get('riderHomeLocation.homeAddress.street') + ' ' + trip.get('riderHomeLocation.homeAddress.city');
        var riderWorkName = trip.get('riderWorkLocation.companyAddress.street') + ' ' + trip.get('riderWorkLocation.companyAddress.city');

        if (!ownerIsMember) {
          // Also have to reverse the names of the locations
          var t = memberHomeName;
          memberHomeName = riderHomeName;
          riderHomeName = t;
          t = memberWorkName;
          memberWorkName = riderWorkName;
          riderWorkName = t;

          controller.set('pHomeLocation', trip.get('memberHomeLocation'));
          controller.set('pWorkLocation', trip.get('memberWorkLocation'));
          controller.set('mHomeLocation', trip.get('riderHomeLocation'));
          controller.set('mWorkLocation', trip.get('riderWorkLocation'));

        } else {

          controller.set('mHomeLocation', trip.get('memberHomeLocation'));
          controller.set('mWorkLocation', trip.get('memberWorkLocation'));
          controller.set('pHomeLocation', trip.get('riderHomeLocation'));
          controller.set('pWorkLocation', trip.get('riderWorkLocation'));

        }

        var owner = null;
        var meters = null;
        var minutes = null;

        // Set what should have been selected via the dropdowns/comboboxs/selects on the page...

        if (memberAsDriverOutboundRiderOriginLocations.length > 0){
          // get the waypoint information... I know could have just used the references, but this is from some code where I tried to construct the waypoint array with the
          // name info, but because the dropdown/combobox/select was being rendered before I could do it, it made that impossible to use.
          owner =   memberAsDriverOutboundRiderOriginLocations.objectAt(0).owner;
          meters =  memberAsDriverOutboundRiderOriginLocations.objectAt(0).meters;
          minutes = memberAsDriverOutboundRiderOriginLocations.objectAt(0).minutes;

          // create the "selected" value
          controller.set('selectedPassengerHomeLocation', {name: memberHomeName, owner: owner, meters: meters, minutes: minutes});
        }
        if (memberAsDriverOutboundRiderDestinationLocations.length > 0){
          owner = memberAsDriverOutboundRiderDestinationLocations.objectAt(0).owner;
          meters = memberAsDriverOutboundRiderDestinationLocations.objectAt(0).meters;
          minutes = memberAsDriverOutboundRiderDestinationLocations.objectAt(0).minutes;
          controller.set('selectedPassengerWorkLocation', {name: memberWorkName, owner: owner, meters: meters, minutes: minutes});
        }
        if (riderAsDriverOutboundMemberOriginLocations.length > 0){
          owner = riderAsDriverOutboundMemberOriginLocations.objectAt(0).owner;
          meters = riderAsDriverOutboundMemberOriginLocations.objectAt(0).meters;
          minutes = riderAsDriverOutboundMemberOriginLocations.objectAt(0).minutes;
          controller.set('selectedMemberHomeLocation', {name: riderHomeName, owner: owner, meters: meters, minutes: minutes});
        }
        if (riderAsDriverOutboundMemberDestinationLocations.length > 0){
          owner = riderAsDriverOutboundMemberDestinationLocations.objectAt(0).owner;
          meters = riderAsDriverOutboundMemberDestinationLocations.objectAt(0).meters;
          minutes = riderAsDriverOutboundMemberDestinationLocations.objectAt(0).minutes;
          controller.set('selectedMemberWorkLocation', {name: riderWorkName, owner: owner, meters: meters, minutes: minutes});
        }

        controller.set('memberIsDriver', memberIsDriver);
        controller.set('selectedDate', trip.get('formattedMdYPickup'));

        //Ember.Logger.debug('Setting date in reviewTrip ' + controller.get('selectedDate'));

        // NOTE: Setting the homeDepartureTime and WorkDepartureTime will cause the *Change observers in make_proposal fire! Make sure you have the data you want setup first.

        // if the current member isn't the owner of the ride, have to play with the configurable times...
        if (!ownerIsMember) {
          var times = gw.computeReversePickupReturnTimes( trip, memberId,
            memberAsDriverOutboundRiderOriginLocations.objectAt(0),
            riderAsDriverOutboundMemberOriginLocations.objectAt(0),
            controller.get('memberAsDriverOutboundMemberDestinationLocations').objectAt(0),
            controller.get('riderAsDriverOutboundRiderDestinationLocations').objectAt(0) );

          controller.set('homeDepartureTime', times.homeDepartureTime);
          controller.set('workDepartureTime', times.workDepartureTime);
        } else {
          controller.set('homeDepartureTime', Ember.isNone(trip.get('formatTimePickup')) ? '' : trip.get('formatTimePickup'));
          controller.set('workDepartureTime', Ember.isNone(trip.get('formatTimeReturn')) ? '' : trip.get('formatTimeReturn'));
        }

        //Ember.Logger.debug('Setting times in reviewTrip ' + controller.get('homeDepartureTime')  + ' ' + controller.get('workDepartureTime'));

        controller.set('personalMessage', '');
      }).catch(function(error){
        if (error.message !== "Units must be a number.") {
          controller.get('controllers.application').notify({message:'Error proposal could not be loaded complete.'});
        }
      });
  }
});

export default GroupWaypoints;
