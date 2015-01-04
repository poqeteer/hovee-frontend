import Spinner from 'appkit/utils/spinner';

var ApplicationRoute = Ember.Route.extend({

  actions: {

    loading: function() {
      //Ember.Logger.debug("... Loading ...");
      var spinner = new Spinner().create();

      this.router.one('didTransition', function() {
        spinner.stop();
      });
    },

    willTransition: function(transition) {
      // close mobile menu when transitioning
      this.send('closeMobileMenu');
    },

    didTransition: function() {
      // analytics call (window.ga = Google Analytics object)
      Ember.run.once(this, function() {
        //if(!trackingRoute) return;

        // make array of url pieces
        var segments = this.router.get('url').split('/');

        // does the url have '/members/' in it?
        if(segments.indexOf('members') > -1) {
          // locate member ID
          var indexOfMemberID = segments.indexOf('members') + 1;
          // window.console.log("$$ index of member ID: " + indexOfMemberID + ", value: " + segments[indexOfMemberID]);
          // make new array sans member ID
          segments.splice(indexOfMemberID, 1);
          var memberAgnosticUrl = segments.join("/");
          Ember.Logger.info("[ Analytics: pageview:" + memberAgnosticUrl + " ]");
          window.ga('send', 'pageview', memberAgnosticUrl);
        } 

        window.ga('send', 'pageview', this.router.get('url'));
        
        Ember.Logger.info("[ Analytics: pageview:" + this.router.get('url') + " ]");
      });
    },

    openMobileMenu: function() {
      var r = this;
      var $b = Ember.$('body'),
        $h = Ember.$('.mobile #mainHeader'),
        $f = Ember.$('.mobile .trip-footer'),
        $fs = Ember.$('.mobile .trip-footer-sched'),
        $s = Ember.$('.mobile .sidebar');
      $b.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd");
      $b.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
        // $b.css({'position': 'static'});
        $('html, body').css('overflow', 'hidden');
        $b.one('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          r.send('closeMobileMenu');
          Ember.Logger.debug("e",e.target, e.relatedTarget, e.currentTarget);
        });
      });

      $b.css({'left': '-87%'});
      $h.css({'left': '-87%'});
      $f.css({'left': '-87%'});
      $fs.css({'left': '-87%'});
      $s.css({'left': '13%'});

      $b.addClass("side-menu-open");
    },

    closeMobileMenu: function() {
      if (Ember.$('.mobile .sidebar').length > 0) {
        var $b = Ember.$('body'),
          $h = Ember.$('.mobile #mainHeader'),
          $f = Ember.$('.mobile .trip-footer'),
          $fs = Ember.$('.mobile .trip-footer-sched'),
          $s = Ember.$('.mobile .sidebar');

        $b.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
          $b.attr('onclick','').unbind('click');
          $('html, body').css('overflow', 'initial');
          $('body').css('overflow-x', 'hidden');
          $b.removeClass("side-menu-open");
        });
        $b.css({'left': '0%'});
        $h.css({'left': '0%'});
        $f.css({'left': '0%'});
        $fs.css({'left': '0%'});
        $s.css({'left': '100%'});
      }
    },

    toggleMobileMenu: function() {
      var $b = Ember.$('body');
      if ($b.offset().left === 0) {
        Ember.Logger.debug(">>> open menu");
        this.send('openMobileMenu');
      } else {
        Ember.Logger.debug("<<< close menu");
        this.send('closeMobileMenu');
      }
    },

    logout: function() {


      /***
       * Blank on purpose....
       */


      this.transitionTo('login');
    },

    mobileLogout: function() {
      this.send('logout');
      this.send('closeMobileMenu');
    }
  }
});

export default ApplicationRoute;
