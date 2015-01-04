import AuthenticatedRoute from 'appkit/routes/authenticated';
import TaglineMixinRoute from 'appkit/mixins/tagline_mixin_route';

var MemberNotificationsRoute = AuthenticatedRoute.extend(TaglineMixinRoute, {

  beforeModel: function() {
    this.controllerFor('login').send('refreshToken', false);
  },

  model: function() {
    return Ember.RSVP.hash({
      messages: this.store.findQuery('message', {memberId: this.modelFor('member').get('id')}),
      msgTypes: this.store.findQuery('msgType')
    });
  },

  afterModel: function(hash) {
    var controller = this.controllerFor('member.notifications');

    controller.set('hasMessages', hash.messages.get('length') > 0);

    controller.set('msgTypes', hash.msgTypes);
    controller.set('messages', hash.messages);

    controller.set('startIndex', 1);
    controller.set('endIndex', hash.messages.get('length'));
    controller.set('disablePrevious', true);
    controller.set('disableFirst', true);
    controller.set('disableNext', false);
    controller.set('disableLast', false);

    for (var i = 0; i < hash.messages.get('length'); i++) {
      if (hash.messages.objectAt(i).get('unread') === 'true') {
        controller.set('disableMarkAllAsRead', false);
        break;
      }
    }
  },

  actions: {
    didTransition: function(){
      this.controllerFor('login').set('updateMessageCount', false);
    },
    willTransition: function(){
      this.controllerFor('login').set('updateMessageCount', true);

      // The willTransition isn't firing in application so need to do it here...
      this.controllerFor('application').send('closeMobileMenu');
    }
  }
});

export default MemberNotificationsRoute;
