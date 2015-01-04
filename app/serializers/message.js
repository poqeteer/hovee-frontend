var MessageSerializer = DS.RESTSerializer.extend({
/*
{ "messages" : [
  { "actionLink" : "https://hovee-integration-web.herokuapp.com/#/members/90/trip_detail/142/762",
    "channel" : "email",
    "id" : 782,
    "message" : "Hello, Arlo! Lance Mock from Hovee wants to ride with you. Check them out  - this could be your next best friend! Click http://tiny.cc/5vdrfx to see details. Your friends at Hovee",
    "messageTimestamp" : 1399917957679,
    "msgTypeId" : 2001,
    "recipientId" : 90,
    "senderId" : 142,
    "template" : "2001",
    "tripId" : 762,
    "unread" : true
  },
  { "actionLink" : "https://hovee-integration-web.herokuapp.com/#/members/90/trip_detail/142/762",
    "channel" : "sms",
    "id" : 783,
    "message" : "Hi, Arlo. You have a new Ride Proposal from Lance Mock. Click the link below to see details. http://tiny.cc/6vdrfx",
    "messageTimestamp" : 1399917958465,
    "msgTypeId" : 2001,
    "recipientId" : 90,
    "senderId" : 142,
    "template" : "2001",
    "tripId" : 762,
    "unread" : true
  }
] }
*/
  extractSingle: function(store, type, payload, id, requestType) {

    payload = this.munge(payload);
    return this._super(store, type, payload, id, requestType);
  },

  munge: function(payload) {
    if(!Ember.isNone(payload.message.recipientId)) {
      payload.message.recipient = payload.message.recipientId;
      delete payload.message.recipientId;
    }

    if(!Ember.isNone(payload.message.senderId)) {
      payload.message.sender = payload.message.senderId;
      delete payload.message.senderId;
    }

    if(!Ember.isNone(payload.message.tripId)) {
      payload.message.trip = payload.message.tripId;
      delete payload.message.tripId;
    }

    return payload;
  },

  extractArray: function(store, type, payload, id, requestType) {
    var serializer = this,
        singlePayload,
        newPayload = {
          messages: []
        };

    payload.messages.forEach(function(message) {
      singlePayload = serializer.munge({ message: message });

      newPayload.messages.push(singlePayload.message);
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

export default MessageSerializer;