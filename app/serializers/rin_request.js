var RinRequetSerializer = DS.RESTSerializer.extend({
/*
{
  "rinRequests": [
    {
      "id": 1875,
      "messageTimestamp": 1392419260459,
      "personalMessage": "Testing this personal message",
      "recipientId": 149,
      "recipientMessage": "You have a new ride request",
      "senderId": 37,
      "senderMessage": "You sent a new ride request",
      "status": 0,
      "tripChange": null,
      "tripId": 1874
    },
    {
      "id": 1880,
      "messageTimestamp": 1392420412480,
      "personalMessage": "Another personal message",
      "recipientId": 37,
      "recipientMessage": "Ride is scheduled",
      "senderId": 149,
      "senderMessage": "Ride is scheduled",
      "status": 2,
      "tripChange": null,
      "tripId": 1874
    }
  ]
}
*/
  extractSingle: function(store, type, payload, id, requestType) {

    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(payload) {
    if(!Ember.isNone(payload.rinRequest.recipientId)) {
      payload.rinRequest.recipient = payload.rinRequest.recipientId;
      delete payload.rinRequest.recipientId;
    }

    if(!Ember.isNone(payload.rinRequest.senderId)) {
      payload.rinRequest.sender = payload.rinRequest.senderId;
      delete payload.rinRequest.senderId;
    }

    if(!Ember.isNone(payload.rinRequest.tripId)) {
      payload.rinRequest.trip = payload.rinRequest.tripId;
      delete payload.rinRequest.tripId;
    }

    return payload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this,
      singlePayload,
      newPayload = {
        rinRequests: []
      };

    payload.rinRequests.forEach(function(rinRequest) {
      singlePayload = serializer.munge({ rinRequest: rinRequest });

      newPayload.rinRequests.push(singlePayload.rinRequest);
    });


    return this._super(store, type, newPayload, id, requestType);
  },

  serialize: function(message, options) {
    var json = this._super(message, options);

    json.recipientId = json.recipient;
    json.senderId = json.sender;
    json.tripId = json.trip;

    delete json.recipient;
    delete json.sender;
    delete json.trip;

    return json;
  }
});

export default RinRequetSerializer;
