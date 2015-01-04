/**
 * Created by lancemock on 9/15/14.
 */
var ProfileMixinController = Ember.Mixin.create({

  homeDepartureTime: "",
  workDepartureTime: "",

  hasHomeDepartureTime: function() {
    return this.get('homeDepartureTime') !== '';
  }.property('homeDepartureTime'),

  weeklyScheduleId: undefined,

  mon: false,
  tue: false,
  wed: false,
  thu: false,
  fri: false,
  sat: false,
  sun: false
});

export default ProfileMixinController;