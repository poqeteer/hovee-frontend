import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var ResponseKey = Ember.Mixin.create({
  key: null,
  email: null,

  needsRequirements: true,

  watchKey: function() {
    var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.set('needsRequirements', Ember.isNone(this.get('key')) || this.get('key').trim() === '' || Ember.isNone(this.get('email')) || !pattern.test(this.get('email').trim()));
  }.observes('key', 'email'),

  actions: {
    save: function() {
      var controller = this;
      var key = this.get('key').toUpperCase();
      var email = encodeURIComponent(this.get('email'));
      return Ember.$.ajax({
        type: 'GET',
        url: Ember.ENV.APIHOST + '/registrants/' + key + '/' + email + '/validate'
      }).then(function() {
        controller.transitionToRoute('registrant.new_member', key, email);
      }).catch(function(e) {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.registrant.key.submit.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogImageTitle: Em.I18n.translations.error.registrant.key.submit.id,
            dialogText: Em.I18n.translations.error.registrant.key.submit.message
          });
        Ember.Logger.debug("key:: "  + e.responseText);
      });
    }
  }
});

export default ResponseKey;