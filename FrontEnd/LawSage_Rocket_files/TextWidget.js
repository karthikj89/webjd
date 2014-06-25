//this is what takes the input in the search box.  It uses the parent-js file abstracttextwidget, where things like self.set calls the abstracttextwidget.js function set.  Combined, they take the input and sends it as a 'q' to Solr.

(function ($) {

AjaxSolr.TextWidget = AjaxSolr.AbstractTextWidget.extend({
  init: function () {
    var self = this;
    $(this.target).find('textarea').bind('keydown', function(e) {  //this is called when user presses enter 
      if (e.which == 13) {
        var value = $(this).val();
        if (value && self.set(value)) {
          self.doRequest();
        }
      }
    });
  },

  afterRequest: function () {
    $(this.target).find('textarea').val('');
  }
});

})(jQuery);
