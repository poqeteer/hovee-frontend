import ApplicationAdapter from "appkit/adapters/rest";

// Okay this is a bit of a kludge(?), but it does at least work for reusing the trip model and serializer...
//
// You must call it with the following in the query object parameter:
//  - from     -- Which should be 'trips' or 'members' or 'startTime*' (see note below)
//  - id       -- This is the id you want to make the call with
//  - endPoint -- Optional param (note defaults below), this could be:
//                for trips - 'rin-requests'
//                for members - 'rides-in-negotiation', 'scheduled-trips', 'trips-in-progress', or 'trips'
//
// So a call would sorta look like the following:
//
//  return this.store.findQuery('trip', { from: 'members', id: member.get('id'), endPoint: 'rides-in-negotiation' });
//
// Note: If you want to call trips without and endPoint use "find" instead of "findQuery". To find a specific trip from trips
//       use something like:
//
//  return this.store.find('trip', params.trip_id );
//
// Note: from contain 'startTime*' should be the fully qualified startTime/endTime params. Example:
//
//  return this.store.findQuery('trip', { from: 'startTime=1396800800000&endTime=1397113200000' });
//

var TripAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {
    var endPoint = query.endPoint;
    var from = query.from;
    // from must be set so if none default to 'trips'
    if (Ember.isNone(from)) {
      from = "trips";
      // endPoint will always be set so if none, 'rin-requests' is default for trips
      if (Ember.isNone(endPoint)) {
        endPoint = 'rin-requests';
      }
    } else if (from === 'members') {
      // endPoint will always be set so if none, 'trips' is default for members
      if (Ember.isNone(endPoint)) {
        endPoint = 'trips';
      }
    } else if(from.indexOf('startTime') > -1) {
      if (Ember.isNone(query.id)) {
        return Ember.$.get(Ember.ENV.APIHOST + '/trips?' + from);
      }
      return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.id + '/trips?' + from);
    }
    return Ember.$.get(Ember.ENV.APIHOST + '/' + from + '/' + query.id + '/' + endPoint);
  },

  defaultSerializer: 'trip'
});

export default TripAdapter;
