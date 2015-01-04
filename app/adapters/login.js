import ApplicationAdapter from "appkit/adapters/rest";

// Okay this is a bit of a kludge(?)...
//
// You must call it with the following in the query object parameter:
//  - timeSpec -- Which should be 'startTime' and 'endTime' (see note below). If not included, defaults to startTime=0
//
// Note: timeSpec contain 'startTime*' should be the fully qualified startTime/endTime params. Example:
//
//  return this.store.findQuery('login', { timeSpec: 'startTime=1396800800000&endTime=1397113200000' });
//

var LoginAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    var timeSpec = query ? query.timeSpec : null;
    if(timeSpec && timeSpec.indexOf('startTime') > -1) {
      return Ember.$.get(Ember.ENV.APIHOST + '/logins?' + timeSpec);
    }
    return Ember.$.get(Ember.ENV.APIHOST + '/logins?startTime=0');
  }
});

export default LoginAdapter;
