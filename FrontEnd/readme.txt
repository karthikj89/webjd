Descriptions of files:
-LawSage_Rocket.html ~ One of two main files. Controls the html / organization / placement of everything

-rocket.js ~ Second of two main files. Javascript that adds in the widgets, and sends the requests to Solr

-jquery-1.11.1.js , jquery-ui.js, jquery-ui.css ~ the standard (not AJAX related) jquery files that the other files take advantage of

-Search widget files that are used to make the widgets that were in the Legal Informatics Tech Demo:
ResultWidget.js
PagerWidget.js
TextWidget.js
StateDropdownWidget.js
LegalAreaDropdownWidget.js
ShowFiltersWidget.js

-AJAX files that are being built on top of (these are the javascript files that contain the functions that are called by rocket.js, etc. in order to send and receive requests): AbstractFacetWidget.jsAbstractManager.jsAbstractSpatialWidget.jsAbstractSpellcheckWidget.jsAbstractTextWidget.jsAbstractWidget.jsCore.jsParameter.jsParameterHashStore.jsParameterStore.js  



Resources:
AJAX/Reuter’s Tutorial - https://github.com/evolvingweb/ajax-solr/wiki/reuters-tutorial
