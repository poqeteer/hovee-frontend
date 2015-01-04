var TipActionSerializer = DS.RESTSerializer.extend({
/*
  {
    "tipActions":[
    {
      "id":1350,
      "messageTimestamp":1384536838725,
      "recipientId":763,
      "recipientMessage":"This trip is completed",
      "senderId":817,
      "senderMessage":"This trip is completed",
      "status":5,
      "tripId":1346
    },
    {
      "id":1347,
      "messageTimestamp":1384536724861,
      "recipientId":763,
      "recipientMessage":"Julia has left her house and is on her way to you",
      "senderId":817,
      "senderMessage":"You left your house to pick up Jennifer",
      "status":1,
      "tripId":1346
    },
    {
      "id":1348,
      "messageTimestamp":1384536756674,
      "recipientId":817,
      "recipientMessage":"Jennifer has joined the trip",
      "senderId":763,
      "senderMessage":"You joined the trip",
      "status":3,
      "tripId":1346
    },
    {
      "id":1349,
      "messageTimestamp":1384536814164,
      "recipientId":817,
      "recipientMessage":"Jennifer arrived at work",
      "senderId":763,
      "senderMessage":"You have arrived at work",
      "status":4,
      "tripId":1346
    }
  ]
  }
*/

  extractSingle: function(store, type, payload, id, requestType) {

    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function (payload) {
    payload.tipAction.recipient = payload.tipAction.recipientId;
    delete payload.tipAction.recipientId;

    payload.tipAction.sender = payload.tipAction.senderId;
    delete payload.tipAction.senderId;

    payload.tipAction.trip = payload.tipAction.tripId;
    delete payload.tipAction.tripId;

    return payload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this,
        singlePayload,
        newPayload = {
          tipActions: []
        };

    payload.tipActions.forEach(function(tipAction) {
      singlePayload = serializer.munge({ tipAction: tipAction });


      newPayload.tipActions.push(singlePayload.tipAction);
    });


    return this._super(store, type, newPayload, id, requestType);
  },

  serialize: function(trip, options) {
    var json = this._super(trip, options);

    json.recipientId = json.recipient;
    json.senderId = json.sender;
    json.tripId = json.trip;

    delete json.recipient;
    delete json.sender;
    delete json.trip;

    return json;
  }
});

export default TipActionSerializer;