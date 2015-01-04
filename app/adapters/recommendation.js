import ApplicationAdapter from "appkit/adapters/rest";

var RecommendationAdapter = ApplicationAdapter.extend({
  find: function (store, type, id) {
    return Ember.$.get(Ember.ENV.APIHOST + '/members/' + window.localStorage.memberId + '/recommendations/riders/' + id);
  },

  findQuery: function(store, type, query) {
    var options = '';
    if (!Ember.isNone(query.day)) {
      options = "?day=" + query.day;
    }
    if (!Ember.isNone(query.role)) {
      if (options !== '') {
        options += '&driverRole=' + query.role;
      } else {
        options = '?driverRole=' + query.role;
      }
    }
    return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/recommendations' + options);
  },

  defaultSerializer: 'recommendation'
});

export default RecommendationAdapter;
