var Member = DS.Model.extend({

  // Regular DS data
  registrationKey: DS.attr('string'),

  email: DS.attr('string'),
  firstName: DS.attr('string'),
  freeTextJob: DS.attr('string'),
  freeTextPersonal: DS.attr('string'),
  gender: DS.attr('string'),
  genderPreference: DS.attr('string'),
  jobHeadline: DS.attr('string'),
  hasCar: DS.attr('boolean'),
  hasInsurance: DS.attr('boolean'),
  hasLicense: DS.attr('boolean'),
  insuranceState: DS.attr('string'),
  lastName: DS.attr('string'),
  licenseState: DS.attr('string'),
  mobilePhone: DS.attr('string'),
  photoUrl: DS.attr('string'),

  // Model relation data
  car: DS.belongsTo('car'),
  company: DS.belongsTo('company', { async: true }),
  workLocation: DS.belongsTo('workLocation', {async: true}),
  companyTeam: DS.belongsTo('team'),
  homeLocation: DS.belongsTo('homeLocation'),
  linkedInProfile: DS.belongsTo('linkedInProfile'),
  tagline: DS.belongsTo('tagline'),

  // 'cause Ember refuses to load the workLocation right away
  companyLocationId: DS.attr('number'),

  // Special cases
  conversationPrefs: DS.attr(),
  listeningPrefs: DS.attr(),
  musicPrefs: DS.attr(),

  // Relationships
  recommendations: DS.hasMany('recommendation'),

  // This needed if we aren't deserializing the values to save... See profile_main controller.
//  companyTeamId: DS.attr('number'),
//  companyLocationId: DS.attr('number'),

  // Functions
  profilePhotoUrl: function() {
    var str = "";
    if(!Ember.isNone(this.get('linkedInProfile'))) {
      str = this.get('linkedInProfile.pictureUrl');
    } else {
      str = this.get('photoUrl');
    }
    return str;
  }.property('photoUrl'),

  fullName: function() {
    if (Ember.isNone(this.get('firstName'))) {
      return "";
    }
    return this.get('firstName') + ' ' + this.get('lastName');
  }.property('firstName', 'lastName'),

  possessiveFirstName: function() {
    var firstName = this.get('firstName');
    if (firstName.substr(firstName.length-1) === 's'){
      return firstName + "'";
    }
    return firstName + "'s";
  }.property('firstName'),

  formattedMobilePhone: function(){
    var phone = this.get('mobilePhone');
    if (Ember.isNone(phone)) return 'n/a';
    return phone.substr(0, 3) + "." + phone.substr(3, 3) + "." + phone.substr(6);
  }.property('mobilePhone'),

  listeningPrefsList: function() {
    var prefs = 'none';
    var p = this.get('listentingPrefs');
    if (!Ember.isNone(p)) {
      for (var i = 0; i < p.length; p++) {
        prefs += (prefs === 'none' ? '' : ', ') + p[i].option;
      }
    }
    return prefs;
  }.property('listeningPrefs'),

  musicPrefsList: function() {
    var prefs = 'none';
    var p = this.get('musicPrefs');
    if (!Ember.isNone(p)) {
      prefs = '';
      for (var i = 0; i < p.length; i++) {
        prefs += p[i].option;
        if(i < p.length-1){ prefs += ', ';}
      }
    }
    if(prefs === ''){ prefs = "No preferences";}
    return prefs;
  }.property('musicPrefs')
});

export default Member;
