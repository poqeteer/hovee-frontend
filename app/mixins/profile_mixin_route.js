/**
 * Created by lancemock on 9/15/14.
 */
var ProfileMixinRoute = Ember.Mixin.create({

  profileAfterModelProcessing: function(controller, memberId) {

    // Ok, ok... So we are only interested in the schedule lookup, but maybe we'll add more later?

    var _this = this;
    controller.set('homeDepartureTime', '');
    this.store.findQuery('weeklySchedule', {memberId: memberId})
      .then(function (weeklySchedule) {
        var dailySchedule = weeklySchedule.objectAt(0).get('dailySchedules');
        controller.set('mon', dailySchedule.objectAt(0).id !== "-1");
        controller.set('tue', dailySchedule.objectAt(1).id !== "-1");
        controller.set('wed', dailySchedule.objectAt(2).id !== "-1");
        controller.set('thu', dailySchedule.objectAt(3).id !== "-1");
        controller.set('fri', dailySchedule.objectAt(4).id !== "-1");
        controller.set('sat', dailySchedule.objectAt(5).id !== "-1");
        controller.set('sun', dailySchedule.objectAt(6).id !== "-1");

        _this.findDepartureTimes(controller, dailySchedule);
      });
  },

  /**
   * Finds the departure times from the schedule array... Used in a lot of places but ride_match and trip_proposal routes which are unique cases.
   * 
   * @param controller -- controller that contains the vars
   * @param dailySchedule -- the array to search
   * @param homeDeptTVarName -- name of the var in the controller
   * @param workDeptTVarName -- name of the var in the controller
   */
  findDepartureTimes: function(controller, dailySchedule, homeDeptTVarName, workDeptTVarName) {
    // FIXME: Because only one time for all days, only need to find the first day that can be scheduled to find the times
    for (var i = 0; i < 7; i++) {
      if (dailySchedule.objectAt(i).id !== "-1") {
        controller.set(homeDeptTVarName?homeDeptTVarName:'homeDepartureTime', dailySchedule.objectAt(i).get('homeDepartureTime'));
        controller.set(workDeptTVarName?workDeptTVarName:'workDepartureTime', dailySchedule.objectAt(i).get('workDepartureTime'));
        break;
      }
    }    
  }
});

export default ProfileMixinRoute;