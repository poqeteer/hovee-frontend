var Header = Ember.View.extend({
  templateName: 'header',

  initialize: function() {
    var view = this,
      $trigger = Ember.$('#dropdownTrigger'),
      $menu = Ember.$('#headerDropdown');

    function showMenu() {
      // position menu
      $menu.css({
        position: 'fixed',
        top: Ember.$('#mainHeader').outerHeight() + 'px',
        left: $trigger.offset().left - ($menu.outerWidth() - $trigger.outerWidth()) +  'px',
        zIndex: 1000
      });
      // big reveal!
      $menu.slideDown(250);
    }

    function hideMenu() {
      // hide menu
      $menu.hide();
    }

    var hoverIntentConfig = {
      over: function() {
        Ember.$(this).addClass('focused');
        showMenu();
      },
      out: function() {
        $trigger.removeClass('focused');
        hideMenu();
      },
      timeout: 100
    };

    $trigger.hoverIntent(hoverIntentConfig);

    view.$('#headerDropdown a').click(function(){
      Ember.Logger.debug(">>> clicked header link");
      $trigger.removeClass('focused');
      hideMenu();
    });
    $menu.hide();
  },

  didInsertElement: function() {
    this.initialize();
  }
});

export default Header;

