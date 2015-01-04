var Plank = Ember.View.extend({

  c : null, // controller reference, set in didInsertElement()

  didInsertElement: function() {
    var view = this,
        $plank = this.$().find('.plank');

    view.set('thisObj', $plank);

    var controller = this.get("controller");
    view.set('c', this.get("controller"));
    // Ember.Logger.debug(this.get("controller"));

    var $shuttle = $plank.find('.buttonShuttle');
    $shuttle.hoverIntent(function(){
      window.clearTimeout(window.autoExpand);
      $(this).animate({'left':0}, 150);
    }, function(){
      //$(this).animate({'left':98}, 150);
    });

    // $plank.click(function(){
    //   view.expandPlank($(this));
    // });

    // is this the first child view?
    // if so, set a 5-second timeout to auto-click first plank.
    if(this.get('parentView').get('childViews')[0] === this){
      window.autoExpand = setTimeout(function(){
        if(controller.get('hasntInteracted') === true){
          $shuttle.animate({'left':0}, 150, view.expandPlank($plank));
        }
      },8000);
    }

    // set up miles / carbs tooltips:
    var $miles = $plank.find('.metrics');

    var $alltips = $plank.find('.planktip');
    var $milestip = $plank.find('.milestip');
    $alltips.css( { 'display': 'none', position: 'fixed', 'z-index': 999 } );
    $miles.hoverIntent( function() {
      Ember.Logger.debug(">> miles hover");
      // x is trigger's x
      var x = $miles.offset().left;
      // center tip horizontally related to trigger
      x = x + ($miles.outerWidth() / 2) - ($milestip.outerWidth() / 2);
      var y = $miles.offset().top + $miles.outerHeight() - Ember.$(document).scrollTop();
      $milestip.css( { top: y, left: x } ).fadeIn(200);
    }, function() {
      Ember.Logger.debug("<< miles hover OFF");
      $milestip.fadeOut(100);
    });

    $plank.hoverIntent(function() {
      /* Stuff to do when the mouse enters the element */
      window.clearTimeout(window.autoExpand);
      $shuttle.animate({'left':0}, 150);
    }, function() {
      /* Stuff to do when the mouse leaves the element */
      if(! $plank.hasClass("focused")){
        $shuttle.animate({'left':108}, 150);
      }
    });


    $plank.click(function(e) {
      Ember.Logger.debug("plank click event:", e);
      if(! $plank.hasClass('focused')) {
        view.expandPlank($plank);
        window.ga('send', 'event', 'button', 'RideMatch', 'Plank Open');
      } else {
        view.collapsePlank($plank);
        window.ga('send', 'event', 'button', 'RideMatch', 'Plank Close');
      }
    });
  },

  expandPlank : function($plank) {

    var view = this;

    var $shuttle = $plank.find('.buttonShuttle');
    $shuttle.unbind("mouseenter").unbind("mouseleave");

    //$plank.unbind(); // remove expand functionality
    $plank.css({
      // cursor: 'default',
      'z-index': 100
    });
    $plank.animate({
        height: '237px'
      },
      250,
      function() {
        view.showExpandedContents($plank);
      }
    );
  },

  showExpandedContents : function($plank) {

    var view = this;
    $plank.addClass('focused');

    $plank.find('a.arrow').html('<i class="fa fa-caret-up fa-2x" style="line-height: 15px;"></i> Less Info');
    $plank.find('.linkedInLink').show();
    $plank.find('.ridePrefs').show();
    if($(document).width() > 992){
      $plank.find('.workLocation').show();
    }
    // $plank.find('.actions').show();

  },

  collapsePlank : function($plank) {
    Ember.Logger.debug("[-] collapsePlank");
    var view = this;
    $plank.find('.linkedInLink').hide();
    $plank.find('.ridePrefs').hide();
    $plank.find('.workLocation').hide();
    // $plank.find('.actions').hide();
    $plank.removeClass('focused');
    $plank.css({
      'z-index': ''
    });
    $plank.animate({
        height: '120px'
      },
      100,
      function(){
        var $shuttle = $plank.find('.buttonShuttle');
        $shuttle.hoverIntent(function(){
          $(this).animate({'left':0}, 150);
        }, function(){
          $(this).animate({'left':108}, 150);
        });

        $plank.find('a.arrow').html('<i class="fa fa-caret-down fa-2x"></i> More Info');
      }
    );
  }
});

export default Plank;
