import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'tipAction'. 'tip_action' will make the call, but will NOT work! Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "tip_action" does not match "tipAction".
 */

var TipActionAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/trips/' + query.tripId + '/tip-actions');
  },

  defaultSerializer: 'tipAction'
});

export default TipActionAdapter;
