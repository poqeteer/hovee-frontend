/**
 * Created by lancemock on 4/3/14.
 */
var Password = Ember.Mixin.create({
  password: '',
  passwordConfirmation: '',
  passwordStrength: 'progress-bar-none',
  passwordStrengthLabel: '',
  doPasswordsMatch: true,
  cannotSubmitPassword: true,

  checkPasswordStrength: function() {
    var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
    var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
    var enoughRegex = new RegExp("(?=.{6,}).*", "g");
    var password = this.get('password');
    this.set('cannotSubmitPassword', password.length < 6);
    if (!enoughRegex.test(password)) {
      this.set('passwordStrength', 'progress-bar-danger');
      this.set('passwordStrengthLabel', password.length < 6 ? 'Short' : 'Weak');
    } else if (strongRegex.test(password)) {
      this.set('passwordStrength', 'progress-bar-success');
      this.set('passwordStrengthLabel', 'Strong!');
    } else if (mediumRegex.test(password)) {
      this.set('passwordStrength', 'progress-bar-warning');
      this.set('passwordStrengthLabel', 'Medium');
    } else {
      this.set('passwordStrength', 'progress-bar-danger');
      this.set('passwordStrengthLabel', 'Weak');
    }

  }.observes('password'),

  checkPasswordsMatch: function() {
    this.set('doPasswordsMatch', this.get('passwordConfirmation') === this.get('password'));
  }.observes('password', 'passwordConfirmation')

});

export default Password;