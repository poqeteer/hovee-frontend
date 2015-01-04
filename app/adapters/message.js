import ApplicationAdapter from "appkit/adapters/rest";

var MessageAdapter = ApplicationAdapter.extend({
  findQuery: function(store, type, query) {

    if (Ember.isNone(query.memberId)) {
      var amount = 25;

      if(!Ember.isNone(query.amount)){
        amount = query.amount;
      }
      if(!Ember.isNone(query.start)){
        return Ember.$.get(Ember.ENV.APIHOST +  '/messages?limit=' + amount + '&offset=' + query.start);
      }
      return Ember.$.get(Ember.ENV.APIHOST + '/messages');
    } else {
      if(!Ember.isNone(query.start)){
        return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/messages?limit=25&offset=' + query.start);
      }
      return Ember.$.get(Ember.ENV.APIHOST + '/members/' + query.memberId + '/messages');
    }
  },

  defaultSerializer: 'message'
});

export default MessageAdapter;
