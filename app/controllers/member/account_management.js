import Password from 'appkit/mixins/password';
import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var AccountManagementController = Ember.ObjectController.extend(Password, {
  needs: ['application', 'login'],

  //////////////////////////////////////
  // Note: Password vars are in Mixin //
  //////////////////////////////////////
  oldPassword: '',

  needsRequirements: function() {
    var password = this.get('password');
    var oldPassword = this.get('oldPassword');

    return  Ember.isNone(oldPassword) || oldPassword.trim() === '' || Ember.isNone(password) || password.trim() === '' || !this.get('doPasswordsMatch') || this.get('cannotSubmitPassword');
  }.property('oldPassword', 'password', 'doPasswordsMatch', 'cannotSubmitPassword'),

  actions: {
    save: function() {

      if (this.get('oldPassword') === this.get('password')) {
        new GenericModalDialog().modalDialog(
          {
            dialogTitle: Em.I18n.translations.error.account.management.old.password.matching.title,
            dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
            dialogText: Em.I18n.translations.error.account.management.old.password.matching.message
          });
        return;
      }
      var controller = this;
      var data = {account: {
        username: this.get('email'),
        oldPassword: this.get('oldPassword'),
        password: this.get('password')
      }};


      /***
       * Blank on purpose....
       */

      Ember.Logger.debug('password save: ' + e.statusText);
      });
    }
  }
});

export default AccountManagementController;
