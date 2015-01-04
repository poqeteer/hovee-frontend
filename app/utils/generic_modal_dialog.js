var GenericModalDialog = Ember.Object.extend({

  modalDialog: function (options) {
    /*jshint multistr: true */
    var dialogHtml = '<div id="dialogMessageDisplay" class="modal fade" tabindex="-1">\
                        <div class="modal-dialog">\
                          <div class="modal-content">\
                            <div class="modal-header centerAlign">\
                              $dialogImagePlaceholder\
                              <h2 class="centerAlign">$dialogTitle</h2>\
                            </div>\
                            <div class="modal-body">\
                              <span class="lead">$dialogText</span>\
                            </div>\
                            <div class="modal-footer">\
                              $dialogButtonPlaceholder\
                            </div>\
                          </div>\
                        </div>\
                      </div>';

    // if we have a image, display it
    if(options.dialogImageUrl) {
      var imgHtml = '<img src="$dialogImageUrl" style="width: 50px; height: 50px; margin-right: 16px;" class="pull-left" onerror="this.onerror=null;this.src=\'/assets/img/ios-bookmark-icon.png\';" title="$dialogImageTitle">';
      imgHtml = imgHtml.replace('$dialogImageUrl', options.dialogImageUrl);
      imgHtml = imgHtml.replace('$dialogImageTitle', options.dialogImageTitle || '');
      dialogHtml = dialogHtml.replace('$dialogImagePlaceholder', imgHtml);
    } else {
      dialogHtml = dialogHtml.replace('$dialogImagePlaceholder', '');
    }
    var uniqueId = 'btnAction' + new Date().getTime();

    // set action button display...
    var btnHtml = '';
    if (options.actionText) {
      btnHtml = '<button id="' + uniqueId + '" type="button" class="btn ' + options.actionClass + '" data-dismiss="modal" >' + options.actionText + '</button>';
    }
    if (options.cancelText) {
      btnHtml += '<button tid="btnCloseDialog" type="button" class="btn ' + options.cancelClass + '" data-dismiss="modal" >' + options.cancelText + '</button>';
    } else {
      btnHtml += '<button tid="btnCloseDialog" type="button" class="btn btn-primary" data-dismiss="modal" >Close</button>';
    }

    dialogHtml = dialogHtml.replace('$dialogButtonPlaceholder', btnHtml);

    // set the dialog title
    dialogHtml = dialogHtml.replace('$dialogTitle', options.dialogTitle);
    // set the dialog text
    dialogHtml = dialogHtml.replace('$dialogText', options.dialogText);

    // Make sure the previous instances of this thing are removed...
    var prevDialog = $('#dialogMessageDisplay');
    if(prevDialog.length > 0) {
      prevDialog.modal('hide');
      $('#dialogMessageDisplay').remove();
    }

    var dialog = $(dialogHtml);
    dialog.on('show.bs.modal', function (e) {
      $(document).on('click', '#' + uniqueId, function(e){
        if(options.func) {
          options.func(options.controller);
        }
      });
    });

    dialog.on('hide.bs.modal', function (e) {
    });
    dialog.modal({"show": true});
  }


});

export default GenericModalDialog;
