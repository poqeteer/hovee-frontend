import MapDirections from 'appkit/mixins/map_directions';
var MapDialog = Ember.Object.extend(MapDirections, {

  /**
   * Map in a dialog box...
   *
   * @param options this is an object that contains the options for the dialog
   *
   * options are:
   *
   *  dialogTitle - What is placed in the header of the dialog
   *  dialogImageUrl - URL of the image to put the left of the dialogTitle
   *  dialogText - Text placed above the map
   *  from - Address (street, city, state) of the starting location
   *  to - Address (street, city, state) of the destination location
   *  waypoints - array of location objects ({location: 'addresstext'}) points along the way between from and to
   *  controller - Pointer to the calling controller
   *  callBack - Function to call on "Compare Schedules" click
   *
   *  All options are optional, but then what is the point? To be useful, you must at least set the "from" and "to" options.
   *
   * Example call...
   *
   *  import MapDialog from 'appkit/utils/map_dialog';
   *
   *  ...
   *
   *     var from, to, waypoints;
   *     if (this.get('memberIsDriver')) {
   *       waypoints =  [{location: this.get('partner.homeLocation.addressCityState')}, {location: this.get('partner.workLocation.addressCityState')}];
   *       from = this.get('currentMember.homeLocation.addressCityState');
   *       to = this.get('currentMember.workLocation.addressCityState');
   *     } else {
   *       waypoints =  [{location: this.get('currentMember.homeLocation.addressCityState')}, {location: this.get('currentMember.workLocation.addressCityState')}];
   *       from = this.get('partner.homeLocation.addressCityState');
   *       to = this.get('partner.workLocation.addressCityState');
   *     }
   *     new MapDialog().modalDialog(
   *     {
   *       dialogTitle: 'Trip Map',
   *       dialogImageUrl: '/assets/img/icon-car-blue.png',
   *       dialogText: 'Your trip with ' + this.get('partner.firstName'),
   *       from: from,
   *       to: to,
   *       waypoints: waypoints
   *     });
   *
   */
  modalDialog: function (options, isMobile) {

    this.set('isMobile', isMobile);

    /*jshint multistr: true */
    var dialogHtml = '<div id="dialogMapDisplay" class="modal fade">\
                        <div class="modal-dialog">\
                          <div class="modal-content">\
                            <div class="modal-header centerAlign" style="height: 80px; margin-top: -7px;">\
                              $dialogImagePlaceholder\
                              <h3 class="centerAlign">$dialogTitle</h3>\
                            </div>\
                            <div class="modal-body" style="margin-top: -15px">\
                              <div class="pull-left" style="padding-top: 10px;">$dialogText</div>\
                              <div class="pull-right onboarding" style="padding: 0 0 5px 0;">\
                                <div class="btn-group" data-toggle="buttons">\
                                  <label id="homeBtn" class="btn btn-default"><input name="options" type="radio">home</label>\
                                  <label id="fullBtn" class="btn btn-default active"><input name="options" type="radio">full route</label> \
                                  <label id="workBtn" class="btn btn-default"><input name="options" type="radio">work</label>\
                                </div>\
                              </div> \
                              <div id="map_canvas" style="width:100%; height:400px; border: 1px solid;"></div>\
                            </div>\
                            <div class="modal-footer" style="height: 50px;">\
                              $dialogButtonPlaceholder\
                            </div>\
                          </div>\
                        </div>\
                      </div>';

    var imgStyle = "width: 50px; height: 50px; margin-right: 16px;";
    if( isMobile ) {
      dialogHtml = dialogHtml.replace('height:400px', 'height:250px');
      dialogHtml = dialogHtml.replace(/btn-default/g, 'btn-default btn-xs');
      imgStyle = "width: 35px; height: 35px; margin-right: 10px; margin-top: 12px; padding-right: 5px;";
    }

    var title = 'map';
    if (options.dialogTitle) {
      if (isMobile) {
        title = 'Your trip with ' + options.dialogTitle;
      } else {
        title = 'Your trip with ' + options.dialogTitle;
      }
    }

    // if we have a image, display it
    if(options.dialogImageUrl) {
      var imgHtml = '<img src="$dialogImageUrl" style="' + imgStyle + '" class="pull-left">';
      imgHtml = imgHtml.replace('$dialogImageUrl', options.dialogImageUrl);
      dialogHtml = dialogHtml.replace('$dialogImagePlaceholder', imgHtml);
    }
    var uniqueId = 'btnAction' + new Date().getTime();

    // set action button display...
    var btnHtml = '';
    if (options.callBack) {
      btnHtml = '<button id="' + uniqueId + '" type="button" class="btn btn-success" data-dismiss="modal" style="margin-top: -12px" >Pick a Day</button>';
    }

    btnHtml += '<button tid="btnCloseDialog" type="button" class="btn btn-default" data-dismiss="modal" style="margin-top: -12px">Close</button>';

    dialogHtml = dialogHtml.replace('$dialogButtonPlaceholder', btnHtml);

    // set the dialog title
    dialogHtml = dialogHtml.replace('$dialogTitle', title);
    // set the dialog text
    dialogHtml = dialogHtml.replace('$dialogText', options.dialogText || '');

    // Make sure the previous instances of this thing are removed else the map will not show...
    var prevDialog = $('#dialogMapDisplay');
    if(prevDialog.length > 0) {
      prevDialog.modal('hide');
      $('#dialogMapDisplay').remove();
    }

    var dialog = $(dialogHtml);
    var shutdown = options.disableOptions || false;
    var self = this;

    $('#fullButton').button('toggle');

    // If we have the "Pick a Day" button, add the click event
    if(options.callBack) {
      dialog.on('show.bs.modal', function (e) {
        $(document).on('click', '#' + uniqueId, function(e){
          options.callBack(options.controller);
        });
      });
    }

    // Add the click events for the home, full, and work zoom buttons
    dialog.on('show.bs.modal', function (e) {
      $(document).on('click', '#homeBtn', function(e){
        self.zoomHome(self);
      });
    });
    dialog.on('show.bs.modal', function (e) {
      $(document).on('click', '#fullBtn', function(e){
        self.zoomFull(self);
      });
    });
    dialog.on('show.bs.modal', function (e) {
      $(document).on('click', '#workBtn', function(e){
        self.zoomWork(self);
      });
    });

    // Note: This has to be done after the dialog is shown else the map_canvas doesn't exist
    dialog.on('shown.bs.modal', function() {
      self.initialize(Ember.$('#map_canvas').get(0), options.icons, options.from, options.to, options.waypoints, shutdown);
    });

    dialog.on('hide.bs.modal', function (e) {
    });
    dialog.modal({"show": true});

    // The following will center the menu to the screen...
    function adjustModalMaxHeightAndPosition(){
      $('.modal').each(function(){
        if($(this).hasClass('in') === false){
          $(this).show(); /* Need this to get modal dimensions */
        }
        var contentHeight = $(window).height() - 60;
        var headerHeight = $(this).find('.modal-header').outerHeight() || 2;
        var footerHeight = $(this).find('.modal-footer').outerHeight() || 2;

        $(this).find('.modal-content').css({
          'max-height': function () {
            return contentHeight;
          }
        });

        $(this).find('.modal-body').css({
          'max-height': function () {
            return (contentHeight - (headerHeight + footerHeight));
          }
        });

        $(this).find('.modal-dialog').addClass('modal-dialog-center').css({
          'margin-top': function () {
            return -($(this).outerHeight() / 2);
          },
          'margin-left': function () {
            return -($(this).outerWidth() / 2);
          }
        });
        if($(this).hasClass('in') === false){
          $(this).hide(); /* Hide modal */
        }
      });
    }
    if ($(window).height() >= 320){
      $(window).resize(adjustModalMaxHeightAndPosition).trigger("resize");
    }

  },

  generateMapDialog: function(member, partner, trip, tripId, tripMode, memberIsDriver) {
    var mHomeLocation = '';
    var mWorkLocation = '';
    var pHomeLocation = '';
    var pWorkLocation = '';

    if (tripId === 0) {
      mHomeLocation = member.get('homeLocation.addressCityState');
      mWorkLocation = member.get('workLocation.addressCityState');
      pHomeLocation = partner.get('homeLocation.addressCityState');
      pWorkLocation = partner.get('workLocation.addressCityState');
    } else {
      var companyLocationLookup = function (companyLocationId) {
        var address = '';
        Ember.$.ajax({
          type: 'GET',
          url: Ember.ENV.APIHOST + '/locations/' + companyLocationId,
          async: false
        }).then(function (result) {
          address = result.location.address.address1 + ', ' + result.location.address.city + ', ' + result.location.address.state;
        });
        return address;
      };

      var homeLocationLookup = function (homeLocationId) {
        var address = '';
        Ember.$.ajax({
          type: 'GET',
          url: Ember.ENV.APIHOST + '/homeLocations/' + homeLocationId,
          async: false
        }).then(function (result) {
          address = result.homeLocation.address.address1 + ', ' + result.homeLocation.address.city + ', ' + result.homeLocation.address.state;
        });
        return address;
      };

      var isOwnerCurrentMember = trip.get('isOwnerCurrentMember');
      mHomeLocation = isOwnerCurrentMember ? homeLocationLookup(trip.get('memberHomeLocationId')) : homeLocationLookup(trip.get('riderHomeLocationId'));
      mWorkLocation = isOwnerCurrentMember ? companyLocationLookup(trip.get('memberWorkLocationId')) : companyLocationLookup(trip.get('riderWorkLocationId'));
      pHomeLocation = isOwnerCurrentMember ? homeLocationLookup(trip.get('riderHomeLocationId')) : homeLocationLookup(trip.get('memberHomeLocationId'));
      pWorkLocation = isOwnerCurrentMember ? companyLocationLookup(trip.get('riderWorkLocationId')) : companyLocationLookup(trip.get('memberWorkLocationId'));

      memberIsDriver = trip.get('isDriver');
      tripMode = -trip.get('oneWayStatus');
    }

    var from, to, waypoints;
    var home1, home2, work1, work2;
    var address1, address2, address3, address4;
    var icons = [];

    // One way home?
    if (tripMode === -2) {
      if (memberIsDriver) {
        address4 = mHomeLocation;
        address3 = pHomeLocation;
        address2 = pWorkLocation;
        address1 = mWorkLocation;

        home2 = partner.get('firstName') + ' home';
        home1 = member.get('firstName') + ' home';
        work2 = partner.get('firstName') + ' work';
        work1 = member.get('firstName') + ' work';
      } else {
        address4 = pHomeLocation;
        address3 = mHomeLocation;
        address2 = mWorkLocation;
        address1 = pWorkLocation;

        home1 = partner.get('firstName') + ' home';
        home2 = member.get('firstName') + ' home';
        work1 = partner.get('firstName') + ' work';
        work2 = member.get('firstName') + ' work';
      }
      icons = [
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-1-blue.png", title: work1, address: address1, type: 'w'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-" + (address1 === address2 ? "1" : "2") + "-blue.png", title: work2, address: address2, type: 'w'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-3-green.png", title: home2, address: address3, type: 'h'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-" + (address3 === address4 ? "3" : "4") + "-green.png", title: home1, address: address4, type: 'h'}
      ];
    } else {
      if (memberIsDriver) {
        address1 = mHomeLocation;
        address2 = pHomeLocation;
        address3 = pWorkLocation;
        address4 = mWorkLocation;

        home2 = partner.get('firstName') + ' home';
        home1 = member.get('firstName') + ' home';
        work1 = partner.get('firstName') + ' work';
        work2 = member.get('firstName') + ' work';
      } else {
        address1 = pHomeLocation;
        address2 = mHomeLocation;
        address3 = mWorkLocation;
        address4 = pWorkLocation;

        home1 = partner.get('firstName') + ' home';
        home2 = member.get('firstName') + ' home';
        work2 = partner.get('firstName') + ' work';
        work1 = member.get('firstName') + ' work';
      }
      icons = [ {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-1.png", title: home1, address: address1, type: 'h'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-" + (address1 === address2 ? "1" : "2") + ".png", title: home2, address: address2, type: 'h'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-3.png", title: work1, address: address3, type: 'w'},
        {url: "//hovee001.s3.amazonaws.com/resources/maps/map-marker-" + (address3 === address4 ? "3" : "4") + ".png", title: work2, address: address4, type: 'w'} ];
    }

    // Technically this isn't necessary but if/when we do multiple address, this structure would work...
    from = address1;
    waypoints = [
      {location: address2, stopover: true},
      {location: address3, stopover: true}
    ];
    to = address4;

    return {from: from, to: to, waypoints: waypoints, icons: icons};
  }
});

export default MapDialog;
