import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'workLocation'. 'work_location' will make the call, but will NOT work! Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "work_location" does not match "workLocation".
 */

var WorkLocationAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/workLocations');
  },

  defaultSerializer: 'workLocation'
});

export default WorkLocationAdapter;
