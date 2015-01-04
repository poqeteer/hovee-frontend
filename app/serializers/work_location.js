var WorkLocationSerializer = DS.RESTSerializer.extend({
  /*
    Format from the server:
    We're going to change the locations to be sideloaded.

    {
      "workLocations": [
      {
        "address": {
          "address1": "2071 Stierlin Court",
          "address2": null,
          "address3": null,
          "city": "Mountain View",
          "country": "USA",
          "id": 2080,
          "state": "CA",
          "street": "Stierlin Ct",
          "zip": "94043"
        },
        "id": 2079,
        "latitude": 37.42401,
        "longitude": -122.07344,
        "name": "second office",
        "owner": "member"
      },
      {
        "address": {
          "address1": "1 Market",
          "address2": null,
          "address3": null,
          "city": "San Francisco",
          "country": "US",
          "id": 203,
          "state": "CA",
          "street": null,
          "zip": "94115"
        },
        "id": 191,
        "latitude": 37.33174,
        "longitude": -122.030334,
        "name": "appleHQ",
        "owner": "company"
      }
    ]}

   */

  extractSingle: function(store, type, payload, id, requestType) {
    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(location) {
    var newPayload = {
      workLocations: [],
      workAddresses: []
    };

    location.workLocation.workAddress = location.workLocation.address.id;
    newPayload.workLocations.push(location.workLocation);
    newPayload.workAddresses.push(location.workLocation.address);
    delete location.workLocation.address;

    return newPayload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this;
    var newPayload = {
      workLocations: [],
      workAddresses: []
    };

    payload.workLocations.forEach(function(location) {
      var singlePayload = serializer.munge({workLocation: location});

      newPayload.workLocations.push(singlePayload.workLocations[0]);
      newPayload.workAddresses.push(singlePayload.workAddresses[0]);
    });

    return this._super(store, type, newPayload, id, requestType);
  }
});

export default WorkLocationSerializer;
