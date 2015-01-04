function standaloneModalDialog(dialogTitle, dialogImageUrl, dialogText, closeActionLink) {
  /*jshint multistr: true */
  var dialogHtml = '<div id="dialogMessageDisplay" class="modal fade">\
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
                            <button tid="btnCloseDialog" type="button" class="btn btn-primary" data-dismiss="modal" >Close</button>\
                          </div>\
                        </div>\
                      </div>\
                    </div>';

  // if we have a image, display it
  if(dialogImageUrl) {
    var imgHtml = '<img src="$dialogImageUrl" style="width: 50px; height: 50px; margin-right: 16px;" class="pull-left">';
    imgHtml = imgHtml.replace('$dialogImageUrl', dialogImageUrl);
    dialogHtml = dialogHtml.replace('$dialogImagePlaceholder', imgHtml);
  }
  // if we have a close action link, display the 'View' button
  var btnHtml = (closeActionLink) ? '<button id="btnViewProposal" type="button" class="btn btn-success" data-dismiss="modal" >View</button>' : '';
  dialogHtml = dialogHtml.replace('$dialogButtonPlaceholder', btnHtml);
  // display the dialog title
  dialogHtml = dialogHtml.replace('$dialogTitle', dialogTitle);
  // display the dialog text
  dialogHtml = dialogHtml.replace('$dialogText', dialogText);

  // remove the previous dialog form the dom, the current behaviour is that the dialog is closed and replaced by the new dialog
  // -> TODO better handling of incoming messages while dialog is still open
  var prevDialog = $('#dialogMessageDisplay');
  if(prevDialog.length > 0) {
    prevDialog.modal('hide');
    $('#dialogMessageDisplay').remove();
  }

  var dialog = $(dialogHtml);
  dialog.on('show.bs.modal', function (e) {
    $(document).on('click', '#btnViewProposal', function(e){
      if(closeActionLink) {
        window.location.href = closeActionLink;
      }
    });
  });
  dialog.on('hide.bs.modal', function (e) {
  });
  dialog.modal({"show": true});
}

export default standaloneModalDialog;

