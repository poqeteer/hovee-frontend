import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var TaglineMixinController = Ember.Mixin.create({
  needs: ['application', 'login', 'currentMember', 'member'],

  taglineText: null,
  editingTagline: false,

  textLenMax: 100,
  textLenCountDown: 100,

  isTextEmpty: true,

  currentMember: function() {
    return this.get('controllers.currentMember.member');
  },

  watchTaglineText: function() {
    if (Ember.isNone(this.get('taglineText'))) {
      this.set('textLenCountDown', this.get('textLenMax'));
    } else {
      this.set('textLenCountDown', this.get('textLenMax') - this.get('taglineText').length);
    }
    this.set('isTextEmpty', Ember.isNone(this.get('taglineText')) || Ember.isEmpty(this.get('taglineText').trim()));
  }.observes('taglineText'),

  actions: {
    clickTaglineLabel: function() {
      this.set('editingTagline', true);
    },
    saveTagline: function() {
      var controller = this;
      var EmberAjax = function (type, url, dataStr) {
        controller.get('controllers.login').send('refreshToken', false);

        Ember.$.ajax({
          type: type,
          url: Ember.ENV.APIHOST + url,
          data: dataStr,
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          then(function(result){
            if (Ember.isNone(controller.get('currentMember.tagline'))) {
              var tagline = controller.store.createRecord('tagline');
              tagline.set('id', result.tagline.id);
              controller.set('currentMember.tagline', tagline);
            }
            controller.set('currentMember.tagline.text', controller.get('taglineText'));
            controller.set('editingTagline', false);
          }).
          fail(function(e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            }
            // For some reason delete returns fail eventhough they didn't.
            if (type !== 'DELETE' && e.status !== 401) {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.tagline.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.tagline.id,
                  dialogText: Em.I18n.translations.error.profile.tagline.message
                });
            }
            Ember.Logger.error('profile save: ' + JSON.stringify(e));
          });
      };

      var tagLine = JSON.stringify({tagline: {text: controller.get('taglineText')}});
      if (Ember.isNone(controller.get('currentMember.tagline'))) {
        new EmberAjax('POST', '/members/' + controller.get('currentMember.id') + '/taglines', tagLine);
      } else {
        new EmberAjax('PUT', '/taglines/' + controller.get('currentMember.tagline.id'), tagLine);
      }
    },
    cancelTagline: function() {
      this.set('editingTagline', false);
    }
  }
});

export default TaglineMixinController;
