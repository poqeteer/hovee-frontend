import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'rinRequest'. 'rin_request' will make the call, but will NOT work! Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "rin_requst" does not match "rinRequest".
 */

var RinRequestAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/trips/' + query.tripId + '/rin-requests');
  },

  defaultSerializer: 'rinRequest'
});

export default RinRequestAdapter;
