import GroupWaypoints from 'appkit/utils/group_waypoints';
import timezonejsDate from 'appkit/utils/timezonejs_date';
import TimeDateFormatting from 'appkit/utils/time_date_formatting';

var CalendarMixinRoute = Ember.Mixin.create({

  defaultStatus: "<span class='dim'>No ride scheduled</span>", // if nothing is happening on a day (it is blank)

  monday: null,
  today: null,

  calendarAfterModelProcessing: function(controller, memberId, trips) {
    // Check to see if user is still onboarding... Only happens if they refresh on incomplete page
    Ember.$.ajax({
      type: 'GET',
      url: Ember.ENV.APIHOST + '/members/' + memberId + '/tracking',
      async: false
    }).then(function(response){
      if (!response.tracking.fullyOnboarded) {
        var loginController = controller.controllerFor('login');
        if (controller.get('controllers.application.onDesktop')) {
          loginController.set('isOnBoardingProfile', true);
          if (response.tracking.onboardingPageId === null || response.tracking.onboardingPageId <= 1) {
            controller.transitionToRoute('member.linkedin', memberId);
          } else {
            controller.transitionToRoute('member.profile_main', memberId, response.tracking.onboardingPageId);
          }
        } else {
          window.location.assign('#/incomplete');
        }
      }
    }).fail(function(error){
      Ember.Logger.debug('calendar tracking ' + error.status + " : " + error.responseText);
      if (error.status !== 404) controller.send('logout');

    });

    // Proceed...
    var days = [],
      singleDay = [],
      iDay = null,
      dayStatusStr = "",
      dayStatusCode = "",
      driving = false,
      dayOutboundStatusCode = "",
      dayInboundStatusCode = "",
      defaultStatus = this.get('defaultStatus');

    var dt = timezonejsDate();
    dt.setTime(dt.getTime() + 60*60*1000);  // One hour forward
    var nextTripUpperRange = dt.getTime();
    dt.setTime(dt.getTime() - 120*60*1000); // One hour back (2 from forward)
    var nextTripLowerRange = dt.getTime();

    // The next bit is to produce the scheduling objects for 4 weeks
    // Create a for week calendar starting with this week back to the first of the week (Monday)
    dt = timezonejsDate();
    var td = timezonejsDate(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
    // We want to start on Monday, even if is past
    if (dt.getDay() > 1)  {
      // - 1 because week starts on Sunday which is 0, so we always want to start at 1
      dt.setTime(dt.getTime() - (dt.getDay()-1)*24*60*60*1000);
    } else if (dt.getDay() < 1) {
      dt.setTime(dt.getTime() - 6*24*60*60*1000); // 0 is Sunday so 6 days in the past
    }

    this.set('monday', dt);
    this.set('today', td);

    /**
     * Ugly but this function sets the day* vars for the trips in the array.
     *
     * @param tripArray
     */
    function setTripDayInfo(tripArray){

      // FIXME: need to get these status strings into a settings file
      dayStatusStr = "<i class='fa fa-exclamation-circle fa-lg'></i>";
      dayStatusCode = '0';

      var atLeast1Decline = 0;
      var atLeast1Pending = 0;
      // See if one of the proposals is accepted...
      for (var i = 0; i < tripArray.length; i++) {
        if (tripArray[i].get('isStatusCancelledOrDeclined')) {
          atLeast1Decline++;
        } else  if(tripArray[i].get('isRinStatusAccepted')) {
          dayStatusStr = "<i class='fa fa-check-circle fa-lg'></i>";
          dayStatusCode = '2';
          driving = tripArray[i].get('isDriver');
          dayOutboundStatusCode = '' + tripArray[i].get('outboundTripStatus');
          dayInboundStatusCode = '' + tripArray[i].get('inboundTripStatus');
          //break;
        } else {
          atLeast1Pending++;
        }
      }
      if (dayStatusCode !== '' && dayStatusCode !== '2' && atLeast1Decline > 0 && atLeast1Pending === 0) {
        dayStatusStr = defaultStatus;
        if (atLeast1Decline > 0) {
          dayStatusCode = '3';
        } else {
          dayStatusCode = '';
        }
      } else if (atLeast1Pending > 0) {
        dayStatusCode = '0';
      }
    }

    var parentHash = [];
    var dateHash = [];
    var groupWaypoints = new GroupWaypoints();

    // loop through the trips to setup the driver/passenger, whether we are the driver.
    trips.forEach(function(trip){
      // If this is a child trip, we don't care... It won't be display anyway.
      if (trip.get('parentTripId') === 0 && !trip.get('isStatusCancelledOrDeclined') && !trip.get('isRinStatusDeclined')) {
        parentHash[trip.get('id')] = trip;

        trip.set('currentMemberId', memberId);
        // If the we are the owner, then the rider is the partner
        if (memberId === trip.get('ownerId'))
        {
//          trip.set('partner', trip.get('rider'));
//          trip.set('partnerId', trip.get('riderId'));

          // Okay this is a bit silly but we use the old pickupTime and returnTime vars to display because we can't
          // change the pickupTimestamp and returnTimestamp in the recomputedAndSetPickupReturnTimes routine...
          trip.set('pickupTime', trip.get('formatTimePickup'));
          trip.set('returnTime', trip.get('formatTimeReturn'));
        }
        else // we are the partner
        {
//          trip.set('partner', trip.get('owner'));
//          trip.set('partnerId', trip.get('ownerId'));

          // Need to recompute pickup and return times from our perspective
          groupWaypoints.recomputeAndSetPickupReturnTimes(trip, memberId);
        }
        //trip.set('isDriver', trip.get('driverId') === memberId); now done in model

          // If we haven't found the next trip and this trip is greater than today, then it is the next trip
          var pickupTimestamp = timezonejsDate(trip.get('pickupTimestamp'));
          var pickupTime = new Date('April 1, 1970 ' + trip.get('pickupTime')); // just need to get the hours and minutes
          pickupTimestamp.setHours(pickupTime.getHours());
          pickupTimestamp.setMinutes(pickupTime.getMinutes());
          pickupTimestamp = pickupTimestamp.getTime();
          var returnTimestamp = timezonejsDate(trip.get('returnTimestamp'));
          var returnTime = new Date('April 1, 1970 ' + trip.get('returnTime')); // just need to get the hours and minutes
          returnTimestamp.setHours(returnTime.getHours());
          returnTimestamp.setMinutes(returnTime.getMinutes());
          returnTimestamp = returnTimestamp.getTime();
          if (nextTripLowerRange !== null && (pickupTimestamp >= nextTripLowerRange || returnTimestamp >= nextTripLowerRange) && !trip.get('isStatusCancelledOrDeclined')) {
            var nextTripOutbound = (pickupTimestamp >= nextTripLowerRange && pickupTimestamp <= nextTripUpperRange);
            if (nextTripOutbound || (returnTimestamp >=  nextTripLowerRange && returnTimestamp <= nextTripUpperRange)) {
              controller.set('nextTrip', trip);
              trip.set('nextTrip', true);
              trip.set('nextTripOutbound', nextTripOutbound);
              trip.set('nextTripReturn', !nextTripOutbound);
            }
            nextTripLowerRange = null;
          } else {
            trip.set('nextTrip', false);
          }
        }

        // if this is the same day as the last trip (or first iteration- there is no 'last trip')
        if(iDay === trip.get('formattedMdYPickup') || iDay === null) {
          singleDay.push(trip);
        } else {
          // Setup the header/plank for the last day
          setTripDayInfo(singleDay);
          days.push({
            status: dayStatusStr,
            statusCode: dayStatusCode,
            driving: driving,
            outboundStatusCode: dayOutboundStatusCode,
            inboundStatusCode: dayInboundStatusCode,
            trips: singleDay
          });
          singleDay = [];
          singleDay.push(trip);

          dateHash[iDay] = days[days.length-1];
        }
        iDay = trip.get('formattedMdYPickup');
    });

    // Setup the header/plank for the last day
    if (singleDay.length > 0) {
      setTripDayInfo(singleDay);
      days.push({
        status: dayStatusStr,
        statusCode: dayStatusCode,
        driving: driving,
        outboundStatusCode: dayOutboundStatusCode,
        inboundStatusCode: dayInboundStatusCode,
        trips: singleDay
      });
      dateHash[iDay] = days[days.length-1];
    }

    return dateHash;
  }
});

export default CalendarMixinRoute;