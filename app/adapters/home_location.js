import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'homeLocation'. 'home_location' will make the call, but will NOT work! Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "home_location" does not match "homeLocation".
 */

var HomeLocationAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/homeLocations');
  },

  defaultSerializer: 'homeLocation'
});

export default HomeLocationAdapter;
