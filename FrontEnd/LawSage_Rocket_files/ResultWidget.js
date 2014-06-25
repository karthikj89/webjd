(function ($) {

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,

  beforeRequest: function () {
    $(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
	//JSON.stringify(facet_values, null, 4);
	 //Use document.write(variable) for debugging purposes
    if (facet_values) { //if the document had labels
		//document.write(facet_values)
		    links.push(  //This whole links.push() (a) returns the website back to the top when clicked, (b) has the text of the tags, (c) and calls facetHandler when clicked which sends a query for all other documents with the same tag that was clicked.   Generally: the push() method adds one or more elements to the end of an array and returns the new length of the array
            $('<a href="#"></a>')
            .text(facet_values)
            .click(this.facetHandler(facet_field, facet_values)) //callls facet handler ?when tag is clicked upon?, and basically takes the "fq" that was clicked, and finds all other queries with that fq
          );
    }
	 else {
          links.push('no items found in current selection');
        }
	//document.write(facet_values);
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store.remove('fq'); //deletes a parameter
      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value)); //if parameter can be specified multiple times, creates parameter using given name and value
      self.doRequest();  //proxy to manager's doRequest method ?takes in the particular tag that was clicked on, and sends a query to Solr with q: *.* and fq: [whatever clicked tag]?
      return false;
    };
  },

  afterRequest: function () {
    $(this.target).empty();
	//var x = 0
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {  //ONLY DOES THIS FOR THE FIRST 10 that show up in results, this is specified.... AJAX Solr sends a size-restricted query with a size limited to the # of search results you've set for a page
      var doc = this.manager.response.response.docs[i];
      $(this.target).append(this.template(doc));
      var items = [];
      items = items.concat(this.facetLinks('subject', doc.subject));  //calls the facetLinks function with every document's subject/state tag. R and adds it to the items array.  
      items = items.concat(this.facetLinks('category', doc.category)); //calls the facetLinks function with every document's category/legal area selection
		//x+=1
      var $links = $('#links_' + doc.id);  //Associates the search result with whatever tags it has + the id.
      $links.empty();
      for (var j = 0, m = items.length; j < m; j++) {
        $links.append($('<li></li>').append(items[j])); //appending the various tags to links
      }
    }
	//document.write(x)
  },

  template: function (doc) {
    var snippet = '';
    /*if (doc.title.length > 15) {
      snippet += doc.category + ' ' + doc.title.substring(0, 15);
      snippet += '<span style="display:none;">' + doc.title.substring(0, 15);
      snippet += '</span> <a href="#" class="more">more</a>';
    }*/
    snippet += doc.title; //need to remove category
	//titleString = doc.title;
	//document.write(titleString.toString().substring(0,15));
	//titleSnippet = doc.title.substring(0, 15);  //doc.title.substring is not an actual function
	//document.write(titleSnippet);
	trimmedTitle = trim_words(doc.title.toString(), 15) //will trim the title to 15 words
	if (doc.title.toString().length > 15) {  //if the title was more than 15 words originally, then appends a ... to the end
		trimmedTitle += "...";
	}
	//document.write(trimmedTitle);
	var output = '<div><h2><a href="'+doc.links+'"> '+ trimmedTitle +' </a></h2>'; //**This is the syntax for creating a hyperlink with a link variable and a title variable.  TAKEAWAY: use normal syntax and where you would otherwise put a string, put '+ _var_+'      ;  Need to make sure the links tag is http:// or else will be weird
	output += '<h1>Tags:  <p style="display:inline;" id="links_' + doc.id + '" class="links">Cool</h1></p>';  //outputs the "links" aka the tags.  The "display:inline allows you to keep things withint the same line or else <p> will make new lines
    //output += '<p id="links_' + doc.id + '" class="links"></p>';  //outputs the "links" aka the tags
    output += '<p>' + snippet + '</p></div>';
    return output;
	
	
  },
  
  init: function () {
    $(document).on('click', 'a.more', function () {
      var $this = $(this),
          span = $this.parent().find('span');

      if (span.is(':visible')) {
        span.hide();
        $this.text('more');
      }
      else {
        span.show();
        $this.text('less');
      }

      return false;
    });
  }
});

  function trim_words(theString, numWords) {
	  expString = theString.split(/\s+/,numWords);
	  theNewString=expString.join(" ");
	  return theNewString;
  }

})(jQuery);