var Manager;

(function ($) {

  $(function () {
    Manager = new AjaxSolr.Manager({
      solrUrl: 'http://localhost:8983/solr/'
    });
    Manager.addWidget(new AjaxSolr.ResultWidget({
      id: 'result',
      target: '#docs'
    }));
    Manager.addWidget(new AjaxSolr.PagerWidget({
      id: 'pager',
      target: '#pager',
      prevLabel: '&lt;',
      nextLabel: '&gt;',
      innerWindow: 1,
      renderHeader: function (perPage, offset, total) {
        $('#pager-header').html($('<span></span>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
      }
    }));
	Manager.addWidget(new AjaxSolr.TextWidget({
		id: 'text',
		target: '#search'
	}));
	
	Manager.addWidget(new AjaxSolr.StateDropdownWidget({ //Remember, when adding a widget to rocket.js, if you later change the name of the widjet, YOU MUST CHANGE THE NAME OF THE WIDGET IN THE .JS FILE THAT IS CREATING A NEW INSTANCE OF IT
  		id: 'state',
  		target: '#state',
  		field: 'subject'
	}));
	Manager.addWidget(new AjaxSolr.LegalAreaDropdownWidget({ //Remember, when adding a widget to rocket.js, if you later change the name of the widjet, YOU MUST CHANGE THE NAME OF THE WIDGET IN THE .JS FILE THAT IS CREATING A NEW INSTANCE OF IT
  		id: 'legalArea',
  		target: '#legalArea',
  		field: 'category'
	}));
	Manager.addWidget(new AjaxSolr.ShowFiltersWidget({
 		id: 'currentsearch',
 		target: '#selection',
	}));
  
  
    Manager.init();
    Manager.store.addByValue('q', '*:*');
	
    var params = { //storing the various facets in order to be able to get the drop-down menus
      facet: true,
      'facet.field': [ 'subject' , 'category' ],
      //'facet.limit': 20,
      //'facet.mincount': 5,
      //'f.topics.facet.limit': 50,
      'f.subject.facet.limit': -1, //might need to set this later to get all of the availabel options
	  'f.category.facet.limit': -1,
      //'json.nl': 'map'
    };
    for (var name in params) {
	  Manager.store.addByValue(name, params[name]);
	  //document.write(name)
    }
	
	
    Manager.doRequest();
  });

})(jQuery);
