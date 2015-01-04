var LinkedInSignIn = Ember.View.extend({

  linkedInMemberId: null,
  publicProfileURL: null,
  pictureUrl: null,
  headline: null,
  receivedInfoResponse: false,
  receivedPhotoResponse: false,

  willDestroyElement: function() {
    // Ember.Logger.debug("--LI WILL BE DESTROYED.--");
    window.IN = null;
  },

  didInsertElement: function() {

    var view = this,
      LinkedIn; // used to access the IN object in a wider scope

    // hide duplicate account message initially
    view.$('.duplicate').hide();

    // ON LINKEDIN AUTH (CLICK + PERMIT OR COOKIED AUTH)
    window.App.onLinkedInAuth = function() {
      // Ember.Logger.debug("3. onLinkedInAuth()");

      Ember.$('.no-account').hide();
      // Ember.Logger.debug("> Linkedin: onLinkedInAuth.");
      // declare linkedin field vars
      var linkedInMemberId = "",
        publicProfileUrl = "",
        headline = "",
        pictureUrl = "",
        sentData = false;
      // retrieve profile fields from LinkedIn
      LinkedIn.API.Profile("me").fields(["id", "first-name", "last-name", "publicProfileUrl", "headline"])
        .result(function(data) {

          // handle visual updating
          if(data.values[0].id) {
            window.App.onRetrievedBasicLinkedInInfo(data.values[0]);
          }

          view.set('receivedInfoResponse', true); // no longer used
        });
        //http://api.linkedin.com/v1/people/~:(id,publicProfileUrl,headline,picture-urls::(original))?secure-urls=true
      // get large photo
      LinkedIn.API.Raw("/people/~/picture-urls::(original)?secure=true")
        .result(function(pic) {
          // Ember.Logger.debug("LI pic total:",pic._total);
          // handle visual updating
          if(pic._total === 0){ // no photo

          } else {
            if(pic.values[0]){
              window.App.onRetrievedLinkedInPhoto(pic.values[0]);
            }
          }

        });

    };

    // handles response from 
    window.App.onRetrievedBasicLinkedInInfo = function(response) {
      view.set('linkedInMemberId', response.id);
      view.set('publicProfileURL', response.publicProfileUrl);
      view.set('headline', response.headline);
      view.set('fName', response.firstName);
      view.set('lName', response.lastName);

      Ember.$('.linkedin-card .name').text(response.firstName + ' ' + response.lastName);
      Ember.$('.linkedin-card .title').text(view.get('headline'));
      Ember.$('.linkedin-card .label').removeClass("hidden");    
      Ember.$('.linkedin-card').addClass('complete');

      window.App.sendLinkedInTextInfoToController();
    };

    window.App.onRetrievedLinkedInPhoto = function(response) {

      // Ember.Logger.debug('onRetrievedLinkedInPhoto response', response);
      Ember.$('img.avatar').attr('src', response);   
      view.set('pictureUrl', response);


      window.App.sendLinkedInPhotoInfoToController();
    };


    window.App.unsetLinkedInInfo = function(){

      var controller = view.get('controller');
      
      // clear view vars (thus far only for UI display)
      view.set('linkedInMemberId', null);
      view.set('publicProfileURL', null);
      view.set('headline', null);      
      view.set('pictureUrl', null);

      // clear controller vars (which get sent when user hits 'next')
      controller.set('linkedInObject', {linkedInProfile: { linkedInMemberId: null, pictureUrl: null, publicProfileUrl: null}});

      // reset 'card' to default state
      Ember.$('img.avatar').attr('src', null);   
      Ember.$('.linkedin-card .name').text("Your Name");
      Ember.$('.linkedin-card .title').text("Your LinkedIn Headline");
      Ember.$('.linkedin-card .label').addClass("hidden");    
      Ember.$('.linkedin-card').removeClass('complete');
    };

    window.App.checkForExistingAccount = function() {
      //is this LinkedIn account already in our system?
      Ember.$.ajax({
        type: "GET",
        url: Ember.ENV.APIHOST + '/linkedInProfiles/linkedInKey/' + view.get('linkedInMemberId'),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(response) {
        Ember.Logger.debug("LinkedIn ID found (this LI account already exists in our system), notify user!");
        view.$('.duplicate').show();

        // not good- account already exists
      }).fail(function(error) {
        var err = JSON.parse(error.responseText);
        //Ember.Logger.error('LinkedIn ID not found.  PS responded with', error.status);
        if(error.status === 404){
          // good, account not found
          Ember.Logger.error('LinkedIn ID not found.  PS responded with', error.status);
        } else {
          // lookup failed for some other reason
          Ember.Logger.error('LinkedIn query failure.  PS responded with', error.status);
        }
      }); // end Ember.$.ajax chain
    };

    // send LinkedIn text-only info back up to controller
    window.App.sendLinkedInTextInfoToController = function() {

      // window.App.checkForExistingAccount();
      // return;

      var controller = view.get('controller');   

      Ember.Logger.debug("view.get('headline')", view.get('headline'));
      controller.set('headline', view.get('headline'));

      controller.set('firstName', view.get('fName'));
      controller.set('lastName', view.get('lName'));

      controller.set('linkedInObject.linkedInProfile.linkedInMemberId', view.get('linkedInMemberId'));
      controller.set('linkedInObject.linkedInProfile.publicProfileUrl', view.get('publicProfileURL'));
      // controller.set('linkedInObject.linkedInProfile.headline', view.get('headline'));
      
    };

    // send LinkedIn PHOTO info back up to controller
    window.App.sendLinkedInPhotoInfoToController = function() {

      // window.App.checkForExistingAccount();
      // return;

      var controller = view.get('controller');
      controller.set('linkedInPhoto', view.get('pictureUrl'));
      
    };

    window.App.onLinkedInInit = function(){
      Ember.Logger.debug("2. onLinkedInInit()");
      LinkedIn.Event.on(window.IN, "auth", window.App.onLinkedInAuth);
      LinkedIn.Event.on(window.IN, "logout", function() {
        Ember.Logger.info("LINKED IN LOGGED OUT");
        window.App.unsetLinkedInInfo();
      });
    };

    // linkedin script load callback
    window.App.onLinkedScriptLoad = function(){
      Ember.Logger.debug("1. onLinkedScriptLoad()");
      LinkedIn = window.IN;
      // initialize a connection with our API key
      window.IN.init({
        api_key: "sz9tos5dmdkr",
        onLoad: "App.onLinkedInInit",
        authorize: false
      });
    };

    // see if LinkedIN's already been loaded
    // if (typeof (window.IN) != 'undefined') {
    //   // if already loaded, re-run the onload callback
    //   window.App.onLinkedScriptLoad();
    // } else {
      // not loaded, load the script
      Ember.$.getScript("//platform.linkedin.com/in.js?async=true", function success() {

        window.App.onLinkedScriptLoad();

        // set a 1-second timer for checking adblock presence
        window.setTimeout( function() {
          var liWidget = $('.IN-widget');
          if (liWidget.length === 1) {
            if (!liWidget.is(':visible')) {
              // adblocker active
              // window.alert('Adblocker detected.');
            } else {
              // no adblocker
            }
          }      
        }, 2000);

      }).done(function( script, textStatus ) {

      }).fail(function( jqxhr, settings, exception ) {
        Ember.Logger.error("> Linkedin: platform script failed:", exception);
      });
    // }
  }

});

export default LinkedInSignIn;
