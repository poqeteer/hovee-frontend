var CalendarWeeks = Ember.View.extend({

  $weeks: null,
  isMobile: null,

  didInsertElement: function() {
    var view = this,
      $this = view.$(),
      controller = view.get('controller');
    view.$weeks = $this.find('.calendarWeek');
    view.isMobile = ! controller.get('controllers.login.onDesktop');

    // show default week on insert
    view.$weeks.each(function(index) {
      var $w = $(this);
      var $i = $w.find('.arrowHolder>i');
      var $c = $w.find('.weekControls');

      $i.addClass('fa-angle-down');
      $c.addClass('expanded');

      if(index > 0){
        $w.find('.weekDays').toggle();
        $c.toggleClass('expanded');
        $i.toggleClass('fa-angle-down');
        $i.toggleClass('fa-angle-left');
        $c.find('button.togglePast').hide();
      }

      // hook up expand/contract functionality
      $c.click(function() {
        if(! Ember.$('body').hasClass('side-menu-open')){
          var $this = $(this);
          $this.parent().find('.weekDays').slideToggle(150);
          $this.find('.arrowHolder>i').toggleClass('fa-angle-down fa-angle-left');
          $this.toggleClass('expanded');

          if($this.parent().is(view.$weeks.first()) && !view.isMobile) {
            $this.find('button.togglePast').toggle();
          }
        }
      });

      // hide past days:
      if(!view.isMobile){
        $w.find('.calendarDay.true').toggle();
        $c.find('button.togglePast').click(function(e) {
          var $b = $(this);
          e.stopPropagation();
          // show past days in button parent's week
          $b.parent().parent().parent().find('.calendarDay.true').slideToggle(150);

          var text = $b.html();
          $b.html(text === '<i class="fa fa-eye-slash"></i> Hide Past Days' ? '<i class="fa fa-eye"></i> Show Past Days' : '<i class="fa fa-eye-slash"></i> Hide Past Days');
        });
      }
    });
  }
});

export default CalendarWeeks;

