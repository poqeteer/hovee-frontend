function modalMenu(selections) {
  Ember.assert("'selections' param doesn't pass basic sanity check",
    selections instanceof Array && selections.length > 0 && selections[0].hasOwnProperty("title"));

  /*jshint multistr: true */
  var dialogHtml = '<div id="popupMenu" class="modal fade options">\
                      <div class="modal-dialog">\
                        <div class="modal-content">\
                          <div class="modal-body">\
                            <ul>\
                            $listItemsGoHere\
                            </ul>\
                          </div>\
                        </div>\
                      </div>\
                    </div>';

  var menuSelections = "";
  $.each(selections, function(arrayIndex, menuOption) {
    menuSelections += '<li data-dismiss="modal"><i class="' + menuOption.iconClass + '"/> ' + 
      menuOption.title + "</li>";
  });

  dialogHtml = dialogHtml.replace('$listItemsGoHere', menuSelections);
  var dialog = $(dialogHtml);

  // Make sure the previous instances of this thing are removed...
  var prevDialog = $('#popupMenu');
  if(prevDialog.length > 0) {
    prevDialog.modal('hide');
    $('#popupMenu').remove();
  }

  // assign interactivity to each list item
  dialog.find('li').each(function(index) {
    var li          = $(this);
    var itemLabel   = li.text();
    var handler     = selections[index].handler;
    var transition  = selections[index].transition;

    li.hover(function(){
      li.css('cursor', 'pointer');
    });

    li.on('click', function() {
      if(handler) {
        handler();
      }
      if(transition) {
        transition();
      }
    });
  });

  dialog.modal();

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
}

export default modalMenu;
