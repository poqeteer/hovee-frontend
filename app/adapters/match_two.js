import ApplicationAdapter from "appkit/adapters/rest";

/**!!!!!!!!!!!!!!!!!!
 * Note: Make sure to call with 'matchTwo'. 'match_two' will make the call, but will NOT work!  Problem is the Ember-Data
 * routine looks for the "primary" record/thingy and "match_two" does not match "matchTwo".
 */

var MatchTwoAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    return Ember.$.get(Ember.ENV.APIHOST + '/matchTwos');
  },

  defaultSerializer: 'matchTwo'
});

export default MatchTwoAdapter;
