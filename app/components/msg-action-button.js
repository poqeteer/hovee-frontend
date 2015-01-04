var MsgActionButtonComponent = Ember.Component.extend({
  tagName           : 'button',
  attributeBindings : ['msgTypes', 'action', 'messageId', 'unread', 'msgTypeId', 'tripId', 'senderId', 'parentTripId', 'actionLink'],
  classNames        : ['btn', 'btn-primary'],
  msgActionButtonTitle: 'More',

  initialize: function() {
    var msgTypes = this.get('msgTypes');
    var msgTypeId = this.get('msgTypeId') + '';
    for (var i = 0; i < msgTypes.get('length'); i++) {
      if (msgTypes.objectAt(i).get('id') === msgTypeId) {
        this.set('msgActionButtonTitle', msgTypes.objectAt(i).get('buttonText'));
        break;
      }
    }
  },

  click: function() {
    this.sendAction(undefined, this.get('messageId'), this.get('unread'), this.get('msgTypeId'), this.get('tripId'), this.get('senderId'), this.get('parentTripId'), this.get('actionLink'));
  },

  didInsertElement: function() {
    this.initialize();
  }
});

export default MsgActionButtonComponent;

