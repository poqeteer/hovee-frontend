var MessageDialog = Ember.Object.extend({

  modalDialog: function (options, isMobile) {
    /*jshint multistr: true */
    var dialogHtml = '<div id="dialogMessageDisplay" class="modal fade" $dialogDisplayStyle>\
                        <div class="modal-dialog" $dialogStyle>\
                          <div class="modal-content" $dialogContentStyle>\
                            <div class="modal-header centerAlign">\
                              $dialogImagePlaceholder\
                              <h2 class="centerAlign">$dialogTitle</h2>\
                            </div>\
                            <div class="modal-body">\
                              <div class="pull-left">\
                              <span class="lead">$dialogText</span>\
                              </div>\
                              <div class="pull-right">\
                              <span id="messageCC">0/160</span>\
                              </div>\
                              <textarea id="messageTA" style="width: 100%; height: 200px;" maxlength="160" ></textarea> \
                            </div>\
                            <div class="modal-footer">\
                              $dialogButtonPlaceholder\
                            </div>\
                          </div>\
                        </div>\
                      </div>';

    if (isMobile) {
      dialogHtml = dialogHtml.replace('$dialogDisplayStyle', 'style="max-height: 460px; width: 100%; overflow-y: auto; padding-right: 10px;"');
      dialogHtml = dialogHtml.replace('$dialogStyle', 'style="max-height: 460px; width: 100%; overflow-y: auto; padding-right: 10px;"');
      dialogHtml = dialogHtml.replace('$dialogContentStyle', 'style="max-height: 460px; width: 100%; overflow-y: auto;"');
    }

    if (options.limit) {
      dialogHtml = dialogHtml.replace('160', options.limit);
    } else {
      options.limit = 160;
    }

    // if we have a image, display it
    if(options.dialogImageUrl) {
      var imgHtml = '<img src="$dialogImageUrl" style="width: 50px; height: 50px; margin-right: 16px;" class="pull-left" title="$dialogImageTitle">';
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
    dialog.on('show.bs.modal', function () {
      $(document).on('click', '#' + uniqueId, function(){
        if(options.func) {
          options.func(options.controller, $('#messageTA').val());
        }
      });
    });

    dialog.on('hide.bs.modal', function () {});
    dialog.modal({"show": true});

    // add event watcher to do the character count
    $('#messageTA').keyup(function() {
      var len = $('#messageTA').val().length;
      $('#messageCC').text(len + "/" + options.limit);
    });

    // if old message...
    if (options.message) {
      $('#messageTA').val(options.message);
      $('#messageTA').select();
      $('#messageCC').text(options.message.length + "/" + options.limit);
    }

    // Set the cursor in the textarea
    $('#messageTA').focus();
  }
});

export default MessageDialog;
