var HomeLocationSerializer = DS.RESTSerializer.extend({
  /*
    Format from the server:
    We're going to change the locations to be sideloaded.

      
    {"homeLocations": [
      {
        "address": {
          "address1": "2 2nd Avenue",
          "address2": null,
          "city": "San Francisco",
          "country": "US",
          "id": 17595,
          "state": "CA",
          "street": "2nd Ave",
          "zip": "94118"
        },
        "id": 770,
        "latitude": 37.787243,
        "longitude": -122.46042,
        "name": "not where i live",
        "neighborhood": "Presidio Heights",
        "tag": "PRIMARY"
      },
      {
        "address": {
          "address1": "18 Lansing St",
          "address2": null,
          "city": "San Francisco",
          "country": "US",
          "id": 17764,
          "state": "CA",
          "street": "Lansing St",
          "zip": "94105"
        },
        "id": 17763,
        "latitude": 37.78636,
        "longitude": -122.39387,
        "name": "Not Home",
        "neighborhood": "SOMA",
        "tag": "SECONDARY"
      }
    ]}
*/
  extractSingle: function(store, type, payload, id, requestType) {
    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(location) {
    var newPayload = {
      homeLocations: [],
      homeAddresses: []
    };

    location.homeLocation.homeAddress = location.homeLocation.address.id;
    newPayload.homeLocations.push(location.homeLocation);
    newPayload.homeAddresses.push(location.homeLocation.address);
    delete location.homeLocation.address;

    return newPayload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this;
    var newPayload = {
      homeLocations: [],
      homeAddresses: []
    };

    payload.homeLocations.forEach(function(location) {
      var singlePayload = serializer.munge({homeLocation: location});

      newPayload.homeLocations.push(singlePayload.homeLocations[0]);
      newPayload.homeAddresses.push(singlePayload.homeAddresses[0]);
    });

    return this._super(store, type, newPayload, id, requestType);
  }
});

export default HomeLocationSerializer;
