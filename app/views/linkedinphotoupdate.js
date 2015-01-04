import GenericModalDialog from 'appkit/utils/generic_modal_dialog';

var LinkedInPhotoUpdate = Ember.View.extend({

  fName: null,
  lName: null,

  willDestroyElement: function() {
    // Ember.Logger.debug("--LI WILL BE DESTROYED.--");
    window.IN = null;
    Ember.$('.useImage').unbind( "click" );
  },

  didInsertElement: function() {

    var view = this,
      timeout,
      LinkedIn; // used to access the IN object in a wider scope

    view.$('.onlyWhenConnected').hide(0);
    view.$('.noPhoto').hide(0);

    // ON LINKEDIN AUTH (Window has popped up, and you've entered credentials + OK'ed)
    window.App.onLinkedInAuth = function() {
      Ember.Logger.debug('+ onLinkedInAuth');

      // get original-sized photo from LinkedIn
      // http://api.linkedin.com/v1/people/~:(id,publicProfileUrl,headline,picture-urls::(original))?secure-urls=true
      LinkedIn.API.Profile("me").fields(["first-name", "last-name"])
        .result(function(data) {

          Ember.Logger.debug("Linkedin NAME request result:", data.values[0], view.get("fName"));

          LinkedIn.API.Raw("/people/~/picture-urls::(original)?secure=true")
              .result(function(pic) {
                Ember.Logger.debug("Linkedin photo request result:", pic, "LI pic total:",pic._total);
                // callback once LI API has given us something
                
                // show the update button + thumbnail pic
                view.$('.onlyWhenConnected').show(0);
                view.set("fName", data.values[0].firstName);
                view.set("lName", data.values[0].lastName);

                if(pic._total >= 1){ // photo returned
                  if(pic.values[0]){
                    window.App.onRetrievedLinkedInPhoto(pic.values[0]);
                  }
                } else { // no photo returned
                  // show our default mystery-man photo
                  Ember.$('img.linkedInPic').hide(0); 
                  view.$('.noPhoto').show();
                  view.$('.useImage').hide();
                }

                // rig up interactivity to the 'use this' button:
                
                view.$('.useImage').unbind( "click" );
                view.$('.useImage').click(function(){

                  // initially just show one image in the other images' slot:
                  new GenericModalDialog().modalDialog(
                    {
                      dialogTitle: 'Update Photo from LinkedIn',
                      dialogImageUrl: '/assets/img/ios-bookmark-icon.png',
                      dialogText: 'Update your Photo?',
                      controller: view.get('controller'),
                      actionText: Em.I18n.translations.common.yes, actionClass: 'btn-primary', func: window.App.changePhotoConfirmed,
                      cancelText: Em.I18n.translations.common.no, cancelClass: 'btn-default'
                    });
              });
          });

        });

    };

    window.App.changePhotoConfirmed = function() {
      window.App.useNewPhoto();
    };

    window.App.useNewPhoto = function(){
      var controller = view.get('controller');

      // alter button UI while attempting to save
      view.$('.useImage').html("<i class=\"fa fa-refresh fa-spin\"></i> Saving...");
      view.$('.useImage').attr('disabled', 'disabled');

      // put together our data object for the API call
      var data = {
            linkedInProfile: {
              pictureUrl: view.$('img.linkedInPic').attr('src')
            }
          };
      var linkedInID = controller.get('content').get('linkedInProfile.id');

      var type = "PUT";

      // make the API call (PUT- only updating one field in one object)
      Ember.$.ajax({
        type: type,
        url: Ember.ENV.APIHOST + '/linkedInProfiles/' + linkedInID,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8'
      }).then(function(response) {
        
        // indicate success on the UI:
        view.$('.useImage').html("Updated!");
        // set 5-second timer to revert UI to 'waiting' state
        timeout = setTimeout(function(){
          view.$('.useImage').html("Use This");
          view.$('.useImage').removeAttr('disabled');
        }, 5000);


        // show the updated image as our 'hovee' image
        view.$('img.hoveePic').attr('src', view.$('img.linkedInPic').attr('src'));

        // Ok this is ugly, but it seems the only way to get the data loaded properly is to reload the page...
        location.reload(true);


      }).fail(function(error) {
        var err = JSON.parse(error.responseText);
        Ember.Logger.error('error sending to PS:', err.error.errorText);
        view.$('.useImage').html("Error!");
      }); // end Ember.$.ajax chain
    };

    window.App.unsetLinkedInInfo = function(){

      view.set("fName", "");
      view.set("lName", "");
      view.$('.onlyWhenConnected').hide();

      // reset 'card' to default state
      Ember.$('img.linkedInPic').attr('src', "//hovee001.s3.amazonaws.com/profile_images/default.jpg"); 

      view.$('.useImage').html("Use This");
    };

    window.App.onRetrievedLinkedInPhoto = function(response) {

      Ember.Logger.debug('+ onRetrievedLinkedInPhoto response', response);

      view.$('img.linkedInPic').attr('src', response);   

      if(view.$('img.hoveePic').attr('src') === view.$('img.linkedInPic').attr('src')){
        view.$('.useImage').html("Photo Updated");
        view.$('.useImage').attr('disabled', 'disabled');
      } else {
        view.$('.useImage').html("Use This");
        view.$('.useImage').removeAttr('disabled');
      }

      var interval = window.setInterval(function(){
        if(view.$('img.linkedInPic').attr('src') !== response){
          view.$('img.linkedInPic').attr('src', response); 
        } else {
          window.clearInterval(interval);
        }
      }, 500);
    };

    window.App.onLinkedInInit = function(){
      Ember.Logger.debug('+ onLinkedInInit');
      LinkedIn.Event.on(window.IN, "auth", window.App.onLinkedInAuth);
      LinkedIn.Event.on(window.IN, "logout", function() {
        Ember.Logger.info("LINKED IN LOGGED OUT");
        window.App.unsetLinkedInInfo();
      });
    };

    // linkedin script load callback
    window.App.onLinkedScriptLoad = function(){
      Ember.Logger.debug('+ onLinkedScriptLoad');
      LinkedIn = window.IN;
      // initialize a connection with our API key
      window.IN.init({
        api_key: "sz9tos5dmdkr",
        onLoad: "App.onLinkedInInit",
        authorize: false
      });
    };

    // see if LinkedIN's already been loaded
    // if (typeof (window.IN) !== 'undefined') {
    //   // if already loaded, re-run the onload callback
    //   window.App.onLinkedScriptLoad();
    // } else {
      // not loaded, load the script
      Ember.$.getScript("//platform.linkedin.com/in.js?async=true", function success() {

        window.App.onLinkedScriptLoad();

        // set a 1-second timer for checking adblock presence
        // window.setTimeout( function() {
        //   var liWidget = $('.IN-widget');
        //   if (liWidget.length === 1) {
        //     if (!liWidget.is(':visible')) {
        //       // adblocker active
        //       // window.alert('Adblocker detected.');
        //     } else {
        //       // no adblocker
        //     }
        //   }      
        // }, 2000);

      }).done(function( script, textStatus ) {

      }).fail(function( jqxhr, settings, exception ) {
        Ember.Logger.error("> Linkedin: platform script failed:", exception);
      });
    // }
  }

});

export default LinkedInPhotoUpdate;
