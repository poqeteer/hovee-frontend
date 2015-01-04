var WeeklyScheduleSerializer = DS.RESTSerializer.extend({

  /*
   {
      weeklySchedules: [1]
      0:  {
        dailySchedules: [5]
        0:  {
          day: "fri"
          homeDepartureTime: "09:00 am"
          id: 876
          workDepartureTime: "05:00 pm"
        }
          1:  {
          day: "wed"
          homeDepartureTime: "09:00 am"
          id: 877
          workDepartureTime: "05:00 pm"
        }
          2:  {
          day: "thu"
          homeDepartureTime: "09:00 am"
          id: 875
          workDepartureTime: "05:00 pm"
        }
          3:  {
          day: "tue"
          homeDepartureTime: "09:00 am"
          id: 879
          workDepartureTime: "05:00 pm"
        }
          4:  {
          day: "mon"
          homeDepartureTime: "09:00 am"
          id: 878
          workDepartureTime: "05:00 pm"
        }
        id: 874
        tag: "PRIMARY"
      }
   }
   */
  extractArray: function(store, type, payload, id, requestType) {
    var weeklySchedules = payload.weeklySchedules,
        dailySchedules = [],
        daysOfTheWeek = {mon: 0, tue: 1, wed: 2, thr: 3, fri: 4, sat: 5, sun: 6}; // Used to force schedule in order

    dailySchedules.push({day: "", homeDepartureTime: "", id: -1, workDepartureTime: ""}); // place holder object

    weeklySchedules.forEach(function(weeklySchedule) {
      var dailyIds = new Array(7);
      var dailyScheds = weeklySchedule.dailySchedules;

      // because schedule may not have all the days, initialize all id's to place holder object
      for (var i=0; i < 7; i++) {
        dailyIds[i] = -1;
      }
      dailyScheds.forEach(function(dailySchedule) {
        dailySchedules.push(dailySchedule);
        dailyIds[daysOfTheWeek[dailySchedule.day]] = dailySchedule.id;  // put the schedule into the correct slot, yes the schedule is not ordered
      });

      weeklySchedule.dailySchedules = dailyIds; // schedule should be in order mon - fri
    });

    payload.dailySchedules = dailySchedules;

    return this._super(store, type, payload, id, requestType);
  }
});

export default WeeklyScheduleSerializer;
