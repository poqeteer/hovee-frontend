import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var MemberProfileMainController = Ember.ObjectController.extend(Ember.Evented, {
  needs: ['application', 'member', 'login'],

  initialAddress: null,
  memberId: null,

  mobileHeaderString: null,

  locationLookup: function() {
//    if (!Ember.isNone(this.get('initialAddress'))) return;
//
//    var controller = this;
//
//    // Get the location of the user's browser using the
//    // native geolocation service. When we invoke this method
//    // only the first callback is required. The second
//    // callback - the error handler - and the third
//    // argument - our configuration options - are optional.
//    window.navigator.geolocation.getCurrentPosition(
//      function( position ){
//
//        // Log that this is the initial position.
//        var geocoder = new window.google.maps.Geocoder();
//
//        var latlng = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//        geocoder.geocode({'latLng': latlng}, function(results, status) {
//          if (status === window.google.maps.GeocoderStatus.OK) {
//            if (results[1]) {
//              controller.set('initialAddress', results[1].formatted_address.split(','));
//
//            } else {
//              Ember.Logger.debug('No results found');
//            }
//          } else {
//            Ember.Logger.debug('Geocoder failed due to: ' + status);
//          }
//        });
//      },
//      function( error ){
//        Ember.Logger.debug( "Something went wrong: ", error );
//      },
//      {
//        timeout: (5 * 1000),
//        maximumAge: (1000 * 60 * 15),
//        enableHighAccuracy: true
//      }
//    );
  },

  // ************************************************************************
  // Mobile Stuff...
  // ************************************************************************

  init: function() {
    var controller = this;
    var firstTime = true;   // first time through this routine, the "collapsed" value is wrong...
    var actions = ['linkedIn', 'work', 'about', 'driving', 'start', 'destination', 'schedule', 'ideal'];

    // Have to wait a half second for the page to render
    setTimeout(function(){
      // When panel disabled, don't allow clicks to occur... Else will get link not found errors and browser address will update
      var createClick = function (i) {
        $('#aCollapse' + i).on('click', function (e) {
          if (controller.get('dataToggle' + i) === '') {
            e.preventDefault();
          } else {
            // Ok... This is a little game called, 'Close the panel'. This makes it so only one panel is open at a time,
            // but also allows for an open panel to be closed.
            var collapsed = $('#aCollapse' + i).attr('class') === "collapsed";  // First see if panel was open
            $('.panel-collapse').collapse('hide');                              // Close all panels

            // If panel was not closed...
            if (!collapsed && !firstTime) {
              // Fool the collapse.js to think it is still open... So it will close it.
              $('#collapse' + i).collapse('show');
            } else {
              firstTime = false;
              // Now we have to wait a tick to scroll the top of the panel into view...
              setTimeout(function(){
                $('html, body').animate({ scrollTop: $("#collapse" + i).offset().top - 80}, 1000);
              }, 100);
            }
            controller.send(actions[i]);
          }
        });
      };
      // All panels...
      for(var i = 1; i < 9; i++) {
        createClick(i);
      }
    }, 500);
  },

  // "data-toggle" flags for each panel
  dataToggle1: 'collapse',  // LinkedIn
  dataToggle2: 'collapse',  // Work
  dataToggle3: 'collapse',  // About
  dataToggle4: 'collapse',  // Driving
  dataToggle5: 'collapse',  // Start
  dataToggle6: 'collapse',  // Destination
  dataToggle7: 'collapse',  // Schedule
  dataToggle8: 'collapse',  // Ideal

  // The following are keyed to the disabled state of the "crumb"...

  disable1: function() {
    var disabled = this.get('disableLinkedIn');
    if (disabled) this.set('dataToggle1', ''); else this.set('dataToggle1', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableLinkedIn'),

  disable2: function() {
    var disabled = this.get('disableWork');
    if (disabled) this.set('dataToggle2', ''); else this.set('dataToggle2', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableWork'),

  disable3: function() {
    var disabled = this.get('disableAbout');
    if (disabled) this.set('dataToggle3', ''); else this.set('dataToggle3', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableAbout'),

  disable4: function() {
    var disabled = this.get('disableDriving');
    if (disabled) this.set('dataToggle4', ''); else this.set('dataToggle4', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableDriving'),

  disable5: function() {
    var disabled = this.get('disableStart');
    if (disabled) this.set('dataToggle5', ''); else this.set('dataToggle5', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableStart'),

  disable6: function() {
    var disabled = this.get('disableDestination');
    if (disabled) this.set('dataToggle6', ''); else this.set('dataToggle6', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableDestination'),

  disable7: function() {
    var disabled = this.get('disableSchedule');
    if (disabled) this.set('dataToggle7', ''); else this.set('dataToggle7', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableSchedule'),

  disable8: function() {
    var disabled = this.get('disableIdeal');
    if (disabled) this.set('dataToggle8', ''); else this.set('dataToggle8', 'collapse');
    return 'display: block; color:'+ (disabled ? '#cccccc' : '#000000');
  }.property('disableIdeal'),

  // ************************************************************************
  // LinkedIn Stuff...
  // ************************************************************************

  memberLinkedInData: null, // assigned in route (if exists)
  hasLinkedInData: false, // set in memberLinkedInData observer

  linkedInObject: {
    linkedInProfile: {
      linkedInMemberId: null,
      pictureUrl: null,
      publicProfileUrl: null
    }
  },

  isLinkedIn: null,
  firstPage: true,

  foundMemberLinkedInData: function() {
    if (!Ember.isNone(this.get('memberLinkedInData'))) {
      // has LinkedIn data in member data
      this.set('hasLinkedInData', true);
    }
  }.observes('memberLinkedInData'),

  // receive this from linkedinsignin view
  // and assign to currentMember
  headline: function(key, value) {
    this.set('isLinkedIn', true);
    if (arguments.length > 0) {
      this.set('jobHeadline', value);
    }
    return this.get('jobHeadline');
  }.property('jobHeadline'),

  // receive this from linkedinsignin view
  // and assign to currentMember
  linkedInPhoto: function(key, value) {
    if (arguments.length > 0) {

      this.set('photoUrl', value);
      this.set('linkedInObject.linkedInProfile.pictureUrl', value);
    }
    return this.get('photoUrl');
  }.property('photoUrl', 'linkedInObject.linkedInProfile.pictureUrl'),


  linkedInProfileUrl: function() {
    return this.get('linkedInProfile.publicProfileUrl');
  }.property('linkedInProfile.publicProfileUrl'),


  watchLinkedInRequirements: function() {
    var hasRequirements = !Ember.isNone(this.get('isLinkedIn')) && this.get('isLinkedIn');

    this.set('hasLinkedInRequirements', hasRequirements || this.get('onBoardingProcess'));

    this.set('disableLinkedIn', !hasRequirements);
  }.observes('isLinkedIn'),

  // ************************************************************************
  // Work Stuff...
  // ************************************************************************

  workHeadlineFromLinkedIn: '',
  companyName:'',

  watchWorkRequirements: function() {
    var hasRequirements = !Ember.isNone(this.get('jobHeadline')) && this.get('jobHeadline').trim() !== '';// && this.get('jobHeadline').trim().length <= 64 && !Ember.isNone(this.get('companyTeam.name'));
    if (hasRequirements && Ember.isNone(this.get('company')) && this.get('companyName').trim().length < 3) {
      hasRequirements = false;
    }
    this.set('hasWorkRequirements', hasRequirements);

    this.set('disableWork', !this.get('hasLinkedInRequirements'));

    // if we have all the requirements enable the next crumb
    this.set('disableAbout',!(this.get('hasLinkedInRequirements') && hasRequirements));
  }.observes('jobHeadline', 'companyTeam.name', 'hasLinkedInRequirements', 'companyName'),

  // ************************************************************************
  // About Stuff...
  // ************************************************************************

  tagLineText: '',
  phoneNumber: '',
  genderContent: [
    {label: '', value: 'female', img: '//hovee001.s3.amazonaws.com/resources/gender-female.png'},
    {label: '', value: 'male', img: '//hovee001.s3.amazonaws.com/resources/gender-male.png'}
  ],
  genderPrefContent: [
    {label: '', value: 'female', img: '//hovee001.s3.amazonaws.com/resources/gender-female.png'},
    {label: '', value: 'male', img: '//hovee001.s3.amazonaws.com/resources/gender-male.png'},
    {label: '', value: 'either', img: '//hovee001.s3.amazonaws.com/resources/gender-either.png'}
  ],

  watchAboutRequirements: function() {
    var hasRequirements = !Ember.isEmpty(this.get('gender')) && !Ember.isNone(this.get('genderPreference')) &&
      this.get('phoneNumber').length === 10 &&
      !Ember.isNone(this.get('firstName')) && !Ember.isNone(this.get('lastName'));
    if (this.get('onBoardingProcess')) {
      hasRequirements = hasRequirements && this.get('hasAnAutomobile') !== '';
      if (this.get('hasAnAutomobile') !== '') {
        this.set('isLicensed', this.get('hasAnAutomobile'));
      }
    }
    this.set('hasAboutRequirements', hasRequirements);

    // if we have all the requirements enable the next crumb
    this.set('disableDriving', !(this.get('hasLinkedInRequirements') && this.get('hasWorkRequirements') && hasRequirements));
  }.observes('firstName', 'lastName', 'gender', 'genderPreference', 'phoneNumber', 'hasWorkRequirements', 'hasLinkedInRequirements', 'hasAnAutomobile'),

  // ************************************************************************
  // Driving Stuff...
  // ************************************************************************

  yesNoContent: [{label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}],

  yearsContent: [],
  colorContent: [
    {label: 'Beige', value: 'Beige'}, {label: 'Black', value: 'Black'}, {label: 'Blue', value: 'Blue'}, {label: 'Brown', value: 'Brown'}, {label: 'Burgundy', value: 'Burgundy'}, {label: 'Green', value: ' Green'},
    {label: 'Grey', value: 'Grey'}, {label: 'Red', value: 'Red'}, {label: 'Silver', value: 'Silver'}, {label: 'White', value: 'White'}, {label: 'Yellow', value: 'Yellow'}, {label: 'Other', value: 'Other'}
  ],

  memberCar: null,

  carMakes: null,           // Will contain the list of makes for PS
  encodedPolicy: "",        // S3 Photo stuff...?
  calculatedSignature: "",  // S3 More photo stuff?
  makeCar: null,

  isLicensed: null,

  hasALicense: function() {
    return this.get('isLicensed') === 'true';
  }.property('isLicensed'),

  hasNoLicense: function() {
    return this.get('isLicensed') === 'false';
  }.property('isLicensed'),

  hasAnAutomobile: '',

  hasACar: function() {
    return this.get('hasAnAutomobile') === 'true' && this.get('isLicensed') === 'true';
  }.property('hasAnAutomobile', 'isLicensed'),

  hasNoCar: function() {
    return this.get('hasAnAutomobile') === 'false' && this.get('isLicensed') === 'true';
  }.property('hasAnAutomobile', 'isLicensed'),

  isInsured: '',
  hasInsurance: function(){
    return this.get('isInsured') === 'true';
  }.property('isInsured'),

  watchDrivingRequirements: function () {
    var hasRequirements = (this.get('isLicensed') === 'true' && this.get('hasAnAutomobile') !== '') || this.get('isLicensed') === 'false';
//    if (hasRequirements && this.get('hasAnAutomobile') !== '') {
//      if (this.get('isLicensed') === 'true' && Ember.isNone(this.get('licenseState'))) {
//        hasRequirements = false;
//      } else if ((Ember.isNone(this.get('isInsured')) && this.get('hasAnAutomobile') === 'true') || (this.get('isInsured') === 'true' && Ember.isNone(this.get('insuranceState')))) {
//        hasRequirements = false;
//      }
//    }
    this.set('hasDrivingRequirements', hasRequirements);

    // if we have all the requirements enable the next crumb
    this.set('disableStart', !(this.get('hasLinkedInRequirements') && this.get('hasWorkRequirements') && this.get('hasAboutRequirements') && hasRequirements));
  }.observes('hasAnAutomobile', 'isLicensed', 'licenseState', 'isInsured', 'insuranceState', 'hasLinkedInRequirements', 'hasWorkRequirements', 'hasAboutRequirements'),

  // ************************************************************************
  // Start Stuff...
  // ************************************************************************

  homeLocations: null,              // List of home locations for the member from the server
  editStartLocation: false,         // Flag to display the edit field
  startAddress: 'dummy',            // Binding var for the edit field, address string
  neighborhood: null,               // Binging var for the edit field, automatically set with the name when user selects a location from the list
  startLocationNickName: '',        // Binding var for the edit field, name given to the location

  modifiedStartLocation: null,      // holds modifying location info, null if adding location

  // startLocation is an object of address info from the google results (lat/long/country)
  // It is set when a single google result is found or when the user selects a neighborhood
  startLocation: null,              // Binding var for the edit field, address input
                                    // {street, address, neighborhood, latitude, longitude, country}

  hasValidatedAddress: false,       // true === user has validated the address by click button
  cannotSaveAddress: true,          // true === disable the save button on the edit

  watchStartAddress: function() {
    this.set('startLocation', null);
  }.observes('startAddress'),

  watchStartLocation: function() {
    var startLocation = this.get('startLocation');
    this.set('hasValidatedAddress', !Ember.isNone(startLocation));
    if (startLocation) {
      this.set('neighborhood', startLocation.neighborhood);
    } else {
      this.set('neighborhood', '');
    }
  }.observes('startLocation'),

  // Kludgy... But since you can't have a function in handlebars {{bind-attr}}
  setCannotSaveAddress: function() {
    this.set('cannotSaveAddress', !(this.get('hasValidatedAddress') && !Ember.isNone(this.get('startLocationNickName')) && this.get('startLocationNickName').trim().length > 1));
  }.observes('hasValidatedAddress', 'startLocationNickName'),

  oldHomeLocation: null,
  homeLocationChange: false,
  watchHomeLocationChange: function() {
//    if(!Ember.isNone(this.get('oldHomeLocation')) && !Ember.isNone(this.get('homeLocation')) && this.get('oldHomeLocation') !== this.get('homeLocation')) {
//      this.send('changeStartPrimary', this.get('homeLocation'), this.get('oldHomeLocation'));
//    }
    this.set('homeLocationChange', !Ember.isNone(this.get('oldHomeLocation')) && !Ember.isNone(this.get('homeLocation')) && this.get('oldHomeLocation') !== this.get('homeLocation'));
  }.observes('homeLocation'),

  watchStartRequirements: function () {
    var hasRequirements = (this.get('hasValidatedAddress') || this.get('homeLocations.length') > 0) &&
      (!this.get('onBoardingProcess') || (!Ember.isEmpty(this.get('startLocationNickName')) && this.get('startLocationNickName').trim().length > 1));
    this.set('hasStartRequirements', hasRequirements);

    // if we have all the requirements enable the next crumb
    this.set('disableDestination', !(this.get('hasLinkedInRequirements') && this.get('hasWorkRequirements') && this.get('hasAboutRequirements') &&
                                     this.get('hasDrivingRequirements') && hasRequirements));
  }.observes('startAddress', 'hasValidatedAddress', 'startLocationNickName', 'hasLinkedInRequirements', 'hasWorkRequirements', 'hasAboutRequirements', 'hasDrivingRequirements'),

  // ************************************************************************
  // Destination Stuff...
  // ************************************************************************

  workLocations: null,                  // List of office locations for the company
  editDestinationLocation: false,       // Flag to display the edit field
  destinationAddress: null,             // Binding var for the edit field, address string
  destinationNeighborhood: null,        // Binging var for the edit field, automatically set with the name when user selects a location from the list
  destinationLocationNickName: null,    // Binding var for the edit field, name given to the location

  oldCompanyLocation: null,             // holds modifying location info, null if adding location

  destinationLocation: null,            // Binding var for the edit field, address input
                                        // {street, address, neighborhood, latitude, longitude, country}

  hasValidatedDestination: false,       // true === user has validated the address by click button
  cannotSaveDestination: true,          // true === disable the save button on the edit

  watchDestinationAddress: function() {
    this.set('destinationLocation', null);
  }.observes('destinationAddress'),

  watchDestinationLocation: function() {
    var destinationLocation = this.get('destinationLocation');
    this.set('hasValidatedDestination', !Ember.isNone(destinationLocation));
    if (destinationLocation) {
      this.set('destinationNeighborhood', destinationLocation.neighborhood);
    } else {
      this.set('destinationNeighborhood', '');
    }
  }.observes('destinationLocation'),

  setCannotSaveDestination: function() {
    this.set('cannotSaveDestination', !(this.get('hasValidatedDestination') && !Ember.isNone(this.get('destinationLocationNickName')) && this.get('destinationLocationNickName').trim().length > 1));
  }.observes('hasValidatedDestination', 'destinationLocationNickName'),

  watchDestinationRequirements: function () {
    var hasRequirements = !Ember.isNone(this.get('workLocation'));
    this.set('hasDestinationRequirements', hasRequirements);

    // if we have all the requirements enable the next crumb
    this.set('disableSchedule', !(this.get('hasLinkedInRequirements') && this.get('hasWorkRequirements') && this.get('hasAboutRequirements') &&
                                  this.get('hasDrivingRequirements') && this.get('hasStartRequirements') && hasRequirements));
  }.observes('workLocation', 'destinationAddress', 'destinationLocationNickName', 'hasLinkedInRequirements', 'hasWorkRequirements', 'hasAboutRequirements', 'hasDrivingRequirements', 'hasStartRequirements'),

  // For some reason the work location is being set to null and I can't find where it is...
  watchWorkLocation: function() {
    if (Ember.isNone(this.get('workLocation'))) {
      this.set('workLocation', this.get('oldCompanyLocation'));
    }
  }.observes('workLocation'),

  // ************************************************************************
  // Schedule Stuff...
  // ************************************************************************

  homeDepartureTime: "09:00 am",
  workDepartureTime: "05:00 pm",

  weeklyScheduleId: undefined,

  mon: false,  tue: false,  wed: false,  thu: false,  fri: false,  sat: false,  sun: false,

  timesAreBad: function() {
    return (new Date('January 1, 1970 ' + this.get('homeDepartureTime')).getTime()) > (new Date('January 1, 1970 ' + this.get('workDepartureTime')).getTime());
  }.property('homeDepartureTime', 'workDepartureTime'),

  watchScheduleRequirements: function () {
    var hasRequirements = (this.get('mon') || this.get('tue') || this.get('wed') || this.get('thu') || this.get('fri') || this.get('sat') || this.get('sun')) &&
      (new Date('January 1, 1970 ' + this.get('homeDepartureTime')).getTime()) < (new Date('January 1, 1970 ' + this.get('workDepartureTime')).getTime());
    this.set('hasScheduleRequirements', hasRequirements);

    // if we have all the requirements enable the next crumb
    this.set('disableIdeal', !(this.get('hasLinkedInRequirements') && this.get('hasWorkRequirements') && this.get('hasAboutRequirements') &&
                               this.get('hasDrivingRequirements') && this.get('hasStartRequirements') && this.get('hasDestinationRequirements') &&
                               hasRequirements && this.get('onBoardingPageId') > 6));
  }.observes('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'onBoardingPageId', 'homeDepartureTime', 'workDepartureTime', 'hasLinkedInRequirements', 'hasWorkRequirements', 'hasAboutRequirements', 'hasDrivingRequirements', 'hasStartRequirements', 'hasDestinationRequirements'),

  // ************************************************************************
  // Ideal Stuff...
  // ************************************************************************

  listeningPref: null,
  musicPrefs: null,

  listeningPrefSettings: [],
  musicPrefSettings: [],

  // ************************************************************************
  // General for everybody Stuff...
  // ************************************************************************

  unitedStates: [
    {id: 'AL', name: 'Alabama'},         {id: 'AK', name: 'Alaska'},        {id: 'AZ', name: 'Arizona'},
    {id: 'AR', name: 'Arkansas'},        {id: 'CA', name: 'California'},    {id: 'CO', name: 'Colorado'},
    {id: 'CT', name: 'Connecticut'},     {id: 'DE', name: 'Delaware'},      {id: 'DC', name: 'District Of Columbia'},
    {id: 'FL', name: 'Florida'},         {id: 'GA', name: 'Georgia'},       {id: 'HI', name: 'Hawaii'},
    {id: 'ID', name: 'Idaho'},           {id: 'IL', name: 'Illinois'},      {id: 'IN', name: 'Indiana'},
    {id: 'IA', name: 'Iowa'},            {id: 'KS', name: 'Kansas'},        {id: 'KY', name: 'Kentucky'},
    {id: 'LA', name: 'Louisiana'},       {id: 'ME', name: 'Maine'},         {id: 'MD', name: 'Maryland'},
    {id: 'MA', name: 'Massachusetts'},   {id: 'MI', name: 'Michigan'},      {id: 'MN', name: 'Minnesota'},
    {id: 'MS', name: 'Mississippi'},     {id: 'MO', name: 'Missouri'},      {id: 'MT', name: 'Montana'},
    {id: 'NE', name: 'Nebraska'},        {id: 'NV', name: 'Nevada'},        {id: 'NH', name: 'New Hampshire'},
    {id: 'NJ', name: 'New Jersey'},      {id: 'NM', name: 'New Mexico'},    {id: 'NY', name: 'New York'},
    {id: 'NC', name: 'North Carolina'},  {id: 'ND', name: 'North Dakota'},  {id: 'OH', name: 'Ohio'},
    {id: 'OK', name: 'Oklahoma'},        {id: 'OR', name: 'Oregon'},        {id: 'PA', name: 'Pennsylvania'},
    {id: 'RI', name: 'Rhode Island'},    {id: 'SC', name: 'South Carolina'},{id: 'SD', name: 'South Dakota'},
    {id: 'TN', name: 'Tennessee'},       {id: 'TX', name: 'Texas'},         {id: 'UT', name: 'Utah'},
    {id: 'VT', name: 'Vermont'},         {id: 'VA', name: 'Virginia'},      {id: 'WA', name: 'Washington'},
    {id: 'WV', name: 'West Virginia'},   {id: 'WI', name: 'Wisconsin'},     {id: 'WY', name: 'Wyoming'}
    ],

  // ************************************************************************
  // Bread Crumb Stuff...
  // ************************************************************************

  onBoardingProcess:          true,

  // Are all page requirements met flags
  hasAboutRequirements:       false,
  hasDestinationRequirements: false,
  hasDrivingRequirements:     false,
  hasIdealRequirements:       false,
  hasLinkedInRequirements:    false,
  hasScheduleRequirements:    false,
  hasStartRequirements:       false,
  hasWorkRequirements:        false,

  // Bread crumb button disabled flags
  disableAbout:       true,
  disableDestination: true,
  disableDriving:     true,
  disableIdeal:       true,
  disableLinkedIn:    true,
  disableSchedule:    true,
  disableStart:       true,
  disableWork:        true,

  // Page display state flags
  aboutState:       false,
  destinationState: false,
  drivingState:     false,
  idealState:       false,
  linkedInState:    true,
  scheduleState:    false,
  startState:       false,
  workState:        false,

  onBoardingPageId: 0,

  // Set page display state
  clearTabStates: function(controller) {

    // transition save/update to current page
    if (controller.get('aboutState') && controller.get('hasAboutRequirements')) {
      controller.send('saveAbout');
    }
    if (controller.get('destinationState') && controller.get('hasDestinationRequirements')) {
      if (Ember.isNone(controller.get('oldCompanyLocation')) || controller.get('oldCompanyLocation.id') !== controller.get('workLocation.id')) {
        controller.set('oldCompanyLocation', controller.get('workLocation'));
        var member = {member: {companyLocationId: controller.get('workLocation.id')}};
        controller.send('saveMember', controller, member, true);
      }
    }
    if (controller.get('drivingState') && controller.get('hasDrivingRequirements')) {
      if (!controller.saveDriving(controller)) {return false;}
    }
    if (controller.get('idealState') && controller.get('hasIdealRequirements')) {
      controller.send('saveIdeal');
    }
    if (controller.get('scheduleState') && controller.get('hasScheduleRequirements')) {
      controller.send('saveSchedule');
    }
    if (controller.get('startState') && controller.get('hasStartRequirements')) {
      if (controller.get('homeLocationChange')) {
        controller.send('changeStartPrimary', controller.get('homeLocation'), controller.get('oldHomeLocation'));
      }
    }
    if (controller.get('workState') && controller.get('hasWorkRequirements')) {
      if (!controller.saveWork(controller)) {return false;}
    }
    if (controller.get('linkedInState') && controller.get('hasLinkedInRequirements')){
      var memberName = {member: {firstName: controller.get('firstName'), lastName: controller.get('lastName')}};
      controller.send('saveMember', controller, memberName, true);
      if (!Ember.isNone(controller.get('company'))) {controller.saveWork(controller);}
    }

    $('.panel-collapse').collapse('hide');

    controller.set('aboutState',       false);
    controller.set('destinationState', false);
    controller.set('drivingState',     false);
    controller.set('idealState',       false);
    controller.set('linkedInState',    false);
    controller.set('scheduleState',    false);
    controller.set('startState',       false);
    controller.set('workState',        false);
    return true;
  },

  // Save the driving information
  saveDriving: function(controller) {

    var proceed = true;
    if (!Ember.isNone(controller.get('hasAnAutomobile')) && controller.get('hasAnAutomobile') === 'true' &&
      !Ember.isNone(controller.get('isLicensed')) && controller.get('isLicensed') === 'true' &&
      (Ember.isNone(controller.get('isInsured')) || controller.get('isInsured') === 'false')) {
      new GenericModalDialog().modalDialog(
        {
          dialogTitle: Em.I18n.translations.error.profile.car.noInsurance.title,
          dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
          dialogImageTitle: Em.I18n.translations.error.profile.car.noInsurance.id,
          dialogText: Em.I18n.translations.error.profile.car.noInsurance.message
        });
      controller.set('hasAnAutomobile', 'false');
      proceed = false;
    }

    if (Ember.isNone(controller.get('memberCar.carMake'))) {
      controller.saveDrivingCallBack(controller);
      return proceed;
    }

    var car = {car: {
      nickname: controller.get('memberCar.nickname'),
      make: controller.get('memberCar.carMake.make'),
      makeId: controller.get('memberCar.carMake.id'),
      model: controller.get('memberCar.model'),
      year: controller.get('memberCar.year'),
      color: controller.get('memberCar.color'),
      photoUrl: controller.get('memberCar.photoUrl')
    }};

    var type = 'POST';
    var url = '/members/' + controller.get('id') + '/cars';

    if (!Ember.isNone(controller.get('car'))) {
      type = 'PUT';
      url = '/cars/' + controller.get('car.id');
    } else {
      controller.set('car', controller.store.createRecord('car', {
        nickname: controller.get('memberCar.nickname'),
        make: controller.get('memberCar.carMake.make'),
        makeId: controller.get('memberCar.carMake.id'),
        model: controller.get('memberCar.model'),
        year: controller.get('memberCar.year'),
        color: controller.get('memberCar.color'),
        photoUrl: controller.get('memberCar.photoUrl')
      }));
    }

    controller.get('controllers.login').send('refreshToken', false);

    controller.send('EmberAjax', controller, type, url, JSON.stringify(car),
      Em.I18n.translations.error.profile.car.submit.message, Em.I18n.translations.error.profile.car.submit.title, Em.I18n.translations.error.profile.car.submit.id, controller.saveDrivingCallBack);
    return proceed;
  },

  saveWork: function(controller) {
    // Is there a company?
    if (Ember.isNone(controller.get('company')) && controller.get('companyName').trim().length > 3) {
      var company = {'company': {name: controller.get('companyName'), shortName: controller.get('email').substr(controller.get('email').indexOf('@'))}};

      Ember.$.ajax({
        type: 'POST',
        url: Ember.ENV.APIHOST + '/companies',
        data: JSON.stringify(company),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        async: false
      }).
        then(function (result) {
          var company = controller.store.createRecord('company', {name: controller.get('companyName')});
          controller.set('company', company);
          var member = {member: {jobHeadline: controller.get('jobHeadline'), companyId: result.company.id, freeTextJob: controller.get('freeTextJob')}};
          controller.send('saveMember', controller, member);
          return true;
        }).fail(function (e) {
          new GenericModalDialog().modalDialog(
            {
              dialogTitle: Em.I18n.translations.error.administration.company.submit.title,
              dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
              dialogImageTitle: Em.I18n.translations.error.administration.company.submit.id,
              dialogText: 'Sorry but there was an error while trying to create your company. Please report the following error to customer service: ' + e.status + ' - ' + e.statusText
            });
          return false;
        });
    } else {
      var member = {member: {jobHeadline: controller.get('jobHeadline'), companyTeamId: controller.get('companyTeam.id'), freeTextJob: controller.get('freeTextJob')}};
      controller.send('saveMember', controller, member);
      return true;
    }
  },
  
  saveDrivingCallBack: function(controller) {
//    var member = controller.get('model');
//    member.setProperties({
//      hasCar: Ember.isNone(this.get('hasAnAutomobile')) ? null : this.get('hasAnAutomobile') === 'true',
//      hasLicense: Ember.isNone(this.get('isLicensed')) ? null : this.get('isLicensed') === 'true',
//      hasInsurance: Ember.isNone(this.get('isInsured')) ? null : this.get('isInsured') === 'true',
//      mobilePhone: this.get('phoneNumber').replace(/\D+/g, '')
//    });

    var member = {member: {
      hasCar: Ember.isNone(controller.get('hasAnAutomobile')) ? null : controller.get('hasAnAutomobile') === 'true',
      hasLicense: Ember.isNone(controller.get('isLicensed')) ? null : controller.get('isLicensed') === 'true',
      hasInsurance: Ember.isNone(controller.get('isInsured')) ? null : controller.get('isInsured') === 'true',
      insuranceState: controller.get('insuranceState'),
      licenseState: controller.get('licenseState')
    }};
    controller.send('saveMember', controller, member);
  },

  actions: {

    toggleGenderPref: function(gender, id, other, otherOther) {
      this.set('genderPreference', gender);
      $(id).addClass('active');
      $(other).removeClass('active');
      $(otherOther).removeClass('active');
    },

    toggleTwoButtons: function(name, value, id, other) {
      this.set(name, value);
      $(id).addClass('active');
      $(other).removeClass('active');
    },



    // ===========================================
    // Bread Crumb Control...

    // Set bread crumb buttons
    setDisables: function(value) {
      this.set('disableAbout', value);
      this.set('disableDestination', value);
      this.set('disableDriving',     value);
      this.set('disableIdeal',       value);
      this.set('disableSchedule',    value);
      this.set('disableStart',       value);
      this.set('disableWork',        value);
    },
    // ===========================================

    // ===========================================
    // Page Control...

    /**
       new member = 0 or null
       linked in = 1
       your work = 2
       about you = 3
       driving = 4
       where from = 5
       where to = 6
       schedule = 7
       ride = 8
       thanks/congrats = 9
     */

    // Display page actions
    about: function() {
      if (!this.clearTabStates(this)) return;
      this.set('aboutState', true);
      $('#collapse3').collapse('show');
      this.send('UpdateTrack', 3);
    },
    destination: function() {
      if (!this.clearTabStates(this)) return;
      this.set('destinationState', true);
      $('#collapse6').collapse('show');
      this.send('UpdateTrack', 6);
    },
    driving: function() {
      if (!this.clearTabStates(this)) return;
      this.set('drivingState', true);
      $('#collapse4').collapse('show');
      this.send('UpdateTrack', 4);
    },
    ideal: function() {
      if (!this.clearTabStates(this)) return;
      this.set('idealState', true);
      $('#collapse8').collapse('show');
      this.send('UpdateTrack', 8);
    },
    linkedIn: function() {
      if (!this.clearTabStates(this)) return;
      this.set('linkedInState', true);
      $('#collapse1').collapse('show');
      this.send('UpdateTrack', 1);
    },
    schedule: function() {
      if (!this.clearTabStates(this)) return;
      this.set('scheduleState', true);
      $('#collapse7').collapse('show');
      this.send('UpdateTrack', 7);
    },
    start: function() {
      if (!this.clearTabStates(this)) return;
      this.locationLookup();
      this.set('startState', true);
      $('#collapse5').collapse('show');
      this.send('UpdateTrack', 5);
    },
    work: function() {
      if (!this.clearTabStates(this)) return;
      this.set('workState', true);
      $('#collapse2').collapse('show');
      this.send('UpdateTrack', 2);
    },
    // ===========================================

    // ===========================================
    // Inner page actions...

    // Sets the start (home) address of the member to the google found address
    setStartAddress: function() {
      this.set('startAddress', this.get('startLocation.address'));
      this.set('hasValidatedAddress', true);
    },

    // Sets the destination (work) address of the member to the google found address
    setOfficeAddress: function() {
      this.set('destinationAddress', this.get('destinationLocation.address'));
      this.set('hasValidatedDestination', true);
    },

    // Display the add new start location fields
    addNewHomeLocation: function() {
      this.set('startAddress', '');
      this.set('neighborhood', '');
      this.set('startLocationNickName', '');

      this.set('modifiedStartLocation', null);
      this.set('editStartLocation', true);
    },

    // Display the existing start location fields
    modifyHomeLocation: function(location) {
      this.set('startAddress', location.get('homeAddress.address1') + ', ' + location.get('homeAddress.city') + ', ' + location.get('homeAddress.state') + ' ' + location.get('homeAddress.zip'));
      this.set('neighborhood', location.get('neighborhood'));
      this.set('startLocationNickName', location.get('name'));
      this.set('modifiedStartLocation', location);
      this.set('editStartLocation', true);
    },

    // Cancel the save of edited start location
    cancelSaveStart: function() {
      this.set('hasValidatedAddress', this.get('homeLocations.length') > 0);
      this.set('editStartLocation', false);
    },

    // Display the add new destination location fields
    addNewWorkLocation: function() {
      this.set('editDestinationLocation', true);
    },

    // Cancel the save of edited destination location
    cancelSaveDestination: function() {
      this.set('hasValidatedDestination', Ember.isNone(this.get('workLocation')));
      this.set('editDestinationLocation', false);
    },

    // ===========================================

    // ===========================================
    // Save functionality

    UpdateTrack: function(stage, force, done) {

      if (stage > this.get('onBoardingPageId') || force) {
        var controller = this;
        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/members/' + this.get('memberId') + '/tracking',
          data: '{"tracking":{ "fullyOnboarded": ' + (done ? 'true' : 'false') + ', "onboardingPageId": ' + stage + ' }}',
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).then(function(){
          controller.set('onBoardingPageId', stage);
        }).fail(function (error) {
          Ember.Logger.debug('profile_main track error ' + stage + ' :: ' + error.responseText);
        });
      }
    },

    // Okay just to short things up a bit
    EmberAjax: function (controller, type, url, dataStr, errMsg, errTitle, errId, callBack) {
      this.get('controllers.login').send('refreshToken', false);

      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + url,
        data: dataStr,
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(result){
          // if you need to save the member you have to do here else you may have locking problem in the DB
          if (callBack) {
            callBack(controller, result);
          }
        }).
        fail(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          }
          if (e.status === 409 && dataStr.indexOf('mobilePhone') > -1) {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.profile.phone.duplicate.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.profile.phone.duplicate.id,
                dialogText: Em.I18n.translations.error.profile.phone.duplicate.message
              });
            controller.send('UpdateTrack', 3, controller.get('onBoardingProcess'));
            controller.send('about');
          } else
          // For some reason delete returns fail eventhough they didn't.
          if (type !== 'DELETE' && e.status !== 401) {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: errTitle || Em.I18n.translations.common.warning,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: errId,
                dialogText: errMsg
              });
          }
          Ember.Logger.error('profile save: ' + JSON.stringify(e));
        });
    },

    saveAbout: function() {
      var member = {member: { gender: this.get('gender'), genderPreference: this.get('genderPreference'),         
                              mobilePhone: this.get('phoneNumber').replace(/\D+/g, ''),
                              freeTextPersonal: this.get('freeTextPersonal'),
                              firstName: this.get('firstName'),
                              lastName: this.get('lastName')}};
      if (this.get('onBoardingProcess')) {
        member.member.hasCar = Ember.isNone(this.get('hasAnAutomobile')) ? null : this.get('hasAnAutomobile') === 'true';
      }

      this.send('saveMember', this, member);

      var tagLine = JSON.stringify({tagline: {text: this.get('tagLineText')}});
      var type = 'PUT', url = '/taglines/' + this.get('tagline.id');
      if (Ember.isNone(this.get('tagline.id'))) {
        type = 'POST';
        url = '/members/' + this.get('model.id') + '/taglines';
      }
      this.send('EmberAjax', this, type, url, tagLine,
        Em.I18n.translations.error.profile.tagline.message,
        Em.I18n.translations.error.profile.tagline.title,
        Em.I18n.translations.error.profile.tagline.id);
    },

    // Save only the member information passed
    saveMember: function(controller, member, force) {

//      if (controller.get('model.isDirty') || force) {
        controller.get('controllers.login').send('refreshToken', false);

        controller.send('EmberAjax', this, 'PUT', '/members/' + controller.get('model.id'), JSON.stringify(member),
          Em.I18n.translations.error.profile.member.submit.message,
          Em.I18n.translations.error.profile.member.submit.title,
          Em.I18n.translations.error.profile.member.submit.id);
//      }
    },

    // Save the start (home) information
    saveStart: function() {

      this.get('controllers.login').send('refreshToken', false);

      var controller = this;
      var wa = this.get('startLocation');
      if (Ember.isNone(wa.address)) return; // if null user didn't do anything...
      var waa = wa.address.split(', ');
      var sz = waa[2].split(' ');
      var homeLocation = {
        homeLocation: {
          address: {
            street: wa.street,
            address1: waa[0],
            city: waa[1],
            state: sz[0],
            zip: sz[1],
            country: wa.country
          },
          latitude: wa.latitude,
          longitude: wa.longitude,
          neighborhood: wa.neighborhood,
          name: this.get('startLocationNickName'),
          tag: (new Date().getTime()) + 'x'       // No need for timezoneJS, this is just to put something unique in here
        }
      };

      var type = 'POST';
      var url = '/members/' + this.get('model.id') + '/homeLocations';

      if (Ember.isNone(this.get('modifiedStartLocation'))) {
        if (this.get('homeLocations.length') === 0) {
          homeLocation.homeLocation.tag = 'PRIMARY';
        }
      } else {
        type = 'PUT';
        url = '/homeLocations/' + this.get('modifiedStartLocation.id');
        homeLocation.homeLocation.tag = this.get('modifiedStartLocation.tag');
      }

      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + url,
        data: JSON.stringify(homeLocation),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(home){
          controller.store.findQuery('homeLocation', {memberId: controller.get('model.id')}).
            then(function(locations){
              controller.set('homeLocations', locations);
              var i;
              if (homeLocation.homeLocation.tag === 'PRIMARY') {
                // should only be one...
                for (i=0; i < locations.get('length'); i++) {
                  if (locations.objectAt(i).get('tag') === 'PRIMARY') {
                    controller.set('homeLocation', locations.objectAt(i));
                    controller.set('oldHomeLocation', locations.objectAt(i));
                    break;
                  }
                }
              } else {
                for (i=0; i < locations.get('length'); i++) {
                  if (locations.objectAt(i).get('tag') === homeLocation.homeLocation.tag) {
                    controller.set('homeLocation', locations.objectAt(i));
                    break;
                  }
                }
              }
            });
        }).
        fail(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          } else {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.profile.from.submit.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.profile.from.submit.id,
                dialogText: Em.I18n.translations.error.profile.from.submit.message
              });
          }
          Ember.Logger.error('start save: ' + JSON.stringify(e));
       });
      this.set('editStartLocation', this.get('onBoardingProcess'));
      if (this.get('onBoardingProcess')) {
        this.send('destination');
      }
    },

    // Changes the home primary to location passed in
    changeStartPrimary: function(newPrimary, oldPrimary) {
      this.get('controllers.login').send('refreshToken', false);

      function makeLocationPrimary(controller) {
        var homeLocation = {
          homeLocation: {
            address: {
              street: newPrimary.get('homeAddress.street'),
              address1: newPrimary.get('homeAddress.address1'),
              city: newPrimary.get('homeAddress.city'),
              state: newPrimary.get('homeAddress.state'),
              zip: newPrimary.get('homeAddress.zip'),
              country: newPrimary.get('homeAddress.country')
            },
            latitude: newPrimary.get('latitude'),
            longitude: newPrimary.get('longitude'),
            neighborhood: newPrimary.get('neighborhood'),
            name: newPrimary.get('startLocationNickName'),
            tag: 'PRIMARY'
          }
        };
        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/homeLocations/' + newPrimary.get('id'),
          data: JSON.stringify(homeLocation),
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          then(function(){
            controller.set('homeLocations', controller.store.findQuery('homeLocation', {memberId: controller.get('model.id')}));
          }).
          fail(function(e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.from.changePrimary.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.from.changePrimary.id,
                  dialogText: Em.I18n.translations.error.profile.from.changePrimary.message
                });
            }
            Ember.Logger.error('change primary: ' + JSON.stringify(e));
          });
        
      }
      
      // Need to find the old primary first...
      if (!Ember.isNone(oldPrimary)) {
        var controller = this;
        var homeLocation = {
          homeLocation: {
            address: {
              street: oldPrimary.get('homeAddress.street'),
              address1: oldPrimary.get('homeAddress.address1'),
              city: oldPrimary.get('homeAddress.city'),
              state: oldPrimary.get('homeAddress.state'),
              zip: oldPrimary.get('homeAddress.zip'),
              country: oldPrimary.get('homeAddress.country')
            },
            latitude: oldPrimary.get('latitude'),
            longitude: oldPrimary.get('longitude'),
            neighborhood: oldPrimary.get('neighborhood'),
            name: oldPrimary.get('startLocationNickName'),
            tag: (new Date().getTime()) + 'x'       // No need for timezoneJS, this is just to put something unique in here
          }
        };
        Ember.$.ajax({
          type: 'PUT',
          url: Ember.ENV.APIHOST + '/homeLocations/' + oldPrimary.get('id'),
          data: JSON.stringify(homeLocation),
          dataType: 'json',
          contentType: 'application/json; charset=UTF-8'
        }).
          then(function(){
            makeLocationPrimary(controller);
          }).
          fail(function(e) {
            if (e.status === 401) {
              controller.get('controllers.login').send('refreshToken');
            } else {
              new GenericModalDialog().modalDialog(
                {
                  dialogTitle: Em.I18n.translations.error.profile.from.changePrimary.title,
                  dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                  dialogImageTitle: Em.I18n.translations.error.profile.from.changePrimary.id,
                  dialogText: Em.I18n.translations.error.profile.from.changePrimary.message
                });
            }
            Ember.Logger.error('change ~primary: ' + JSON.stringify(e));
          });
      } else {
        makeLocationPrimary(this);
      }

      this.set('oldHomeLocation', newPrimary);
      this.set('homeLocation', newPrimary);
    },

    // Save the new office location
    saveDestination: function() {
      this.get('controllers.login').send('refreshToken', false);

      var memberId = this.get('content.id');
      var wa = this.get('destinationLocation');
      var waa = wa.address.split(', ');
      var sz = waa[2].split(' ');
      var controller = this;
      var location = {
        workLocation: {
          address: {
            street: wa.street,
            address1: waa[0],
            city: waa[1],
            state: sz[0],
            zip: sz[1],
            country: wa.country
          },
          latitude: wa.latitude,
          longitude: wa.longitude,
          name: this.get('destinationLocationNickName')
        }
      };

      Ember.$.ajax({
        type: 'POST',
        url: Ember.ENV.APIHOST + '/members/' + memberId+ '/workLocations',
        data: JSON.stringify(location),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(result) {
          // Reload the work locations
          controller.store.findQuery('workLocation', {memberId: controller.get('model.id')}).
            then(function(locations) {
              controller.set('workLocations', locations);
              // Set the work location to the new location
              for (var i=0; i < locations.get('length'); i++){
                if (parseInt(locations.objectAt(i).get('id'), 10) === result.workLocation.id) {
                  controller.set('workLocation', locations.objectAt(i));
                  break;
                }
              }
            }).catch(function(){
              window.console.error('work locations lookup did not work');
            });
        }).
        fail(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          } else {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.profile.destination.submit.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.profile.destination.submit.id,
                dialogText: Em.I18n.translations.error.profile.destination.submit.message
              });
          }
          Ember.Logger.error('new office save: ' + JSON.stringify(e));
        });

      // Hide the edit fields
      this.set('editDestinationLocation', false);
    },

    // Save schedule information
    saveSchedule: function() {
      this.get('controllers.login').send('refreshToken', false);

      var controller = this;
      var weeklySchedule = '{"weeklySchedule": ';
      var dailySchedule = '{"dailySchedules":[';
      var departures = '"homeDepartureTime":"' + this.get('homeDepartureTime') + '","workDepartureTime":"' + this.get('workDepartureTime') + '"}';
      var days = '';
      var week = [this.get('mon'),this.get('tue'),this.get('wed'),this.get('thu'),this.get('fri'),this.get('sat'),this.get('sun')];
      var dates = ["mon","tue","wed","thr","fri","sat","sun"];
      for (var i = 0; i < week.length; i++){
        if (week[i]) {
          if (days.length > 0) {days += ',';}
          days += '{"day":"' + dates[i] + '",' + departures;
        }
      }
      if (days.length > 0) {
        weeklySchedule += dailySchedule + days + '],"tag":"PRIMARY"}}';
      } else {
        weeklySchedule += 'null}';
      }

      var type = "POST",
        postFix = '/commute-preferences/schedules';
      var weeklyScheduleId = this.get('weeklyScheduleId');
      if (!Ember.isNone(weeklyScheduleId)) {
        type = "PUT";
        postFix += '/' + weeklyScheduleId;
      }
      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + '/members/' + controller.get('model.id') + postFix,
        data: weeklySchedule,
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).
        then(function(result){
          controller.set('weeklyScheduleId', result.weeklySchedule.id);
        }).
        fail(function(e) {
          if (e.status === 401) {
            controller.get('controllers.login').send('refreshToken');
          } else {
            new GenericModalDialog().modalDialog(
              {
                dialogTitle: Em.I18n.translations.error.profile.schedule.submit.title,
                dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                dialogImageTitle: Em.I18n.translations.error.profile.schedule.submit.id,
                dialogText: Em.I18n.translations.error.profile.schedule.submit.message
              });
          }
          Ember.Logger.error('schedule save: ' + JSON.stringify(e));
        });
    },

    // Save the ride preferences
    saveIdeal: function() {
      this.get('controllers.login').send('refreshToken', false);

      var controller = this;
      var changed = false;
      var memberId = this.get('content.id');

      // for "During the drive, I most often like to"
      var listeningPrefs = this.get('listeningPrefs');
      var listeningPrefSettings = this.get('listeningPrefSettings');
      listeningPrefSettings.forEach(function(listeningPrefSet) {
        listeningPrefSet.forEach(function(listeningPrefSetting){
          if (listeningPrefSetting.display) {
            if (listeningPrefSetting.isSet && listeningPrefSetting.oldId < 0) {
              changed = true;
              Ember.$.ajax({
                type: 'POST',
                url: Ember.ENV.APIHOST + '/members/' + memberId + '/listeningPrefs',
                data: '{"listeningPref":{"optionId": "' + listeningPrefSetting.id + '"}}',
                dataType: 'json',
                async: false,
                contentType: 'application/json; charset=UTF-8'
              }).
                then(function(result){
                  listeningPrefSetting.oldId = result.listeningPref.id;
                }).
                fail(function(e){
                  if (e.status === 401) {
                    controller.get('controllers.login').send('refreshToken');
                  } else {
                    new GenericModalDialog().modalDialog(
                      {
                        dialogTitle: Em.I18n.translations.error.profile.ride.listening.submit.title,
                        dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                        dialogImageTitle: Em.I18n.translations.error.profile.ride.listening.submit.id,
                        dialogText: Em.I18n.translations.error.profile.ride.listening.submit.message
                      });
                  }
                  Ember.Logger.error('listening save: ' + JSON.stringify(e));
                });
            } else if (listeningPrefSetting.oldId > -1 && !listeningPrefSetting.isSet) {
              controller.send('EmberAjax', this, 'DELETE', '/listeningPrefs/' + listeningPrefSetting.oldId, '',
                Em.I18n.translations.error.profile.ride.listening.delete.message, Em.I18n.translations.error.profile.ride.listening.delete.title, Em.I18n.translations.error.profile.ride.listening.delete.id);
              listeningPrefSetting.oldId = -1;
            }
          }
        });
      });

      // Have to loop and save/delete music preferences one at a time
      var musicPrefs = this.get('musicPrefs');
      var musicPrefSettings = this.get('musicPrefSettings');
      musicPrefSettings.forEach(function(musicPrefSet) {
        musicPrefSet.forEach(function(musicPrefSetting){
          if (musicPrefSetting.display) {
            if (musicPrefSetting.isSet && musicPrefSetting.oldId < 0) {
              changed = true;
              Ember.$.ajax({
                type: 'POST',
                url: Ember.ENV.APIHOST + '/members/' + memberId + '/musicPrefs',
                data: '{"musicPref":{"optionId": "' + musicPrefSetting.id + '"}}',
                dataType: 'json',
                async: false,
                contentType: 'application/json; charset=UTF-8'
              }).
                then(function(result){
                  musicPrefSetting.oldId = result.musicPref.id;
                }).
                fail(function(e){
                  if (e.status === 401) {
                    controller.get('controllers.login').send('refreshToken');
                  } else {
                    new GenericModalDialog().modalDialog(
                      {
                        dialogTitle: Em.I18n.translations.error.profile.ride.music.submit.title,
                        dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                        dialogImageTitle: Em.I18n.translations.error.profile.ride.music.submit.id,
                        dialogText: Em.I18n.translations.error.profile.ride.music.submit.message
                      });
                  }
                  Ember.Logger.error('music save: ' + JSON.stringify(e));
                });
            } else if (musicPrefSetting.oldId > -1 && !musicPrefSetting.isSet) {
              controller.send('EmberAjax', this, 'DELETE', '/musicPrefs/' + musicPrefSetting.oldId, '',
                Em.I18n.translations.error.profile.ride.music.delete.message, Em.I18n.translations.error.profile.ride.music.delete.title, Em.I18n.translations.error.profile.ride.music.delete.id);
              musicPrefSetting.oldId = -1;
            }
          }
        });
      });

      if (this.get('onBoardingProcess')) {
        this.send('UpdateTrack', 9, false, true);
        this.get('controllers.login').set('isOnBoardingProfile', false);
        this.transitionToRoute('member.thank_you', this.get('model'));
      } else {
        // Have to wait a sec else music changes won't show up in the profile page...
        setTimeout(function () {
          controller.transitionToRoute('member.profile', controller.get('model'));
        }, 1000);
      }
    },

    // ===========================================

    nope:function() {
      window.IN.User.logout();
      this.set('isLinkedIn', this.get('onBoardingProcess'));
    },
    noLinkedIn: function() {
      this.set('firstPage', !this.get('firstPage'));
    },

    // save LinkedIn info (from linkinsignin.js view)
    saveLinkedIn: function() {
      var data = this.get("linkedInObject");
      var memberId = this.get('id');
      //Ember.Logger.debug("> Linkedin: Sending user info to Hovee PS.");
      //Ember.Logger.debug('> Headline from LinkedIn:', headline);

      var type = "POST",
        postFix = '/linkedInProfiles';

      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + '/members/' + memberId + postFix,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(response) {
        // Ember.Logger.debug("> Linkedin: Save to PS successful");
        // view.rerender();

      }).fail(function(error) {
        var err = JSON.parse(error.responseText);
        Ember.Logger.error('error sending to PS:', err.error.errorText);
      }); // end Ember.$.ajax chain
    }
  }
});

export default MemberProfileMainController;
