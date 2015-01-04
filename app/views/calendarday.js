var CalendarDay = Ember.View.extend({
  didInsertElement: function() {
    var $this       = this.$().find('.calendarDay'),
      isInThePast   = $this.hasClass('true'),
      $dayHeader    = $this.find('.calendarPlankGroupHeader'),
      $todayHeader  = $this.find('.todayBadge'),
      $daysContainer = $this.find('.planksContainer'),
      c             = this.get('controller'),
      isMobile      = !c.get('controllers.login.onDesktop');

    if($dayHeader.hasClass('status') && !isMobile) {
      $daysContainer.hide();
    }
    if($todayHeader[0] === undefined && isMobile) { // start with all non-today planks closed on mobile
      $daysContainer.hide();
    }
    if (isInThePast && !isMobile) {
      $daysContainer.hide();
    }

    $dayHeader.click(function(e) {
      // if(! $(this).hasClass('status')){
        expandDay($daysContainer);
      // }
    });
    $todayHeader.click(function(e) {
      // if(! $(this).hasClass('status')){
        expandDay($daysContainer);
      // }
    });
  }
});

var expandDay = function($daysContainer) {
  if(! Ember.$('body').hasClass('side-menu-open')){
    $daysContainer.slideToggle(100);
  }
};

export default CalendarDay;

