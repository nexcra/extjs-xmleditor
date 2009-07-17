/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* Author: Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk */

/* class definition */
/* Keeps original XML file (transformed using XMLTransformation) */

var XMLController = function() {
	this.init();
};

Ext.extend(XMLController, Ext.Element, {
	//Variables
	views : null,
	init_arr : null,
	textNodeHashTable : null, //keeps a relation id->dom
	nodeHashTable : null,
	snapshot : null,	
	marker : ['fxe_id','fxe_attr','fxe_attr_ns'], //the first marker makes a node being editable, the following are optional in order to differ nodes
	markerClassName : ['fxe_editable','fxe_editable_a','fxe_editable_a'],
	
	//Functions
	init: function() {
		this.views = new Array();
	},
	
	getDom: function() {
		return this.dom;
	},
	
	/**
	* Loads XML from an URL to be used for the base
	*/	
	loadXMLurl: function(url) {
		this.init_arr = arguments;
		var that = this;
		loadXML(url, function(dom) {that.loadXMLdom(dom);} );
	},

	/**
	* Loads XML from a dom to be used for the base
	*/		
	loadXMLdom: function(dom) {
		if (arguments.length>1)
			this.init_arr = arguments;	
		this.dom = dom;
		this.process();
	},
	
	/**
	* Adds a new view for the current XML
	*/
	addView: function(view) {
		this.views[this.views.length] = view;
		view.controller = this;
		//link IDs with breadcrumbs
	},

	/**
	* Removes a view for the current XML
	*/
	removeView: function(view) {
		this.views = this.views.remove(view);
	},
	
	initSnapshot: function() {
		this.snapshot = new Array();
		this.snapshot.current_snap_pos = undefined;
	},
	
	addSnapshot: function() {
		if (this.snapshot.current_snap_pos!=undefined) {
			this.snapshot.trim(this.snapshot.current_snap_pos+1);
		}

		var pos = this.snapshot.length;
		this.snapshot[pos] = new Object();
		var snap = this.dom.cloneNode(true);
		this.snapshot[pos].snap = snap;
		this.snapshot.current_snap_pos = pos;
		
		for (var i=0;i<this.views.length;i++)
			this.views[i].addSnapshot.apply(this.views[i],arguments);
	},
	
	recallSnapshot: function(step) {
		var s_n = this.snapshot.current_snap_pos+step;
		if (s_n>=this.snapshot.length) return;
		if (s_n<0) return;
		var ptr = this.snapshot[s_n];
		this.snapshot.current_snap_pos = s_n;

		removeAllChildren(this.dom);

		this.dom = ptr.snap.cloneNode(true);
		this.parseDocument(this.dom);
		
		for (var i=0;i<this.views.length;i++)
			this.views[i].recallSnapshot.apply(this.views[i],arguments);
			
		if (s_n==0) ContentEditor.initCaret(); //the very first snapshot does not have caret so once we are at the very first snapshot we have to re-initiate the caret as we destroyed it by issuing removeAllChildren
	},
	
	/**
	* Updates value of an element and propagates to the rest of views
	* view - view that the issue originates from
	*/
	updateElement: function(/*value + markers values*/) {
		//console.log(arguments);
		if (arguments[2]) { //looking for node (marker[1])
			this.nodeHashTable[arguments[1]].setAttributeNS(arguments[3],arguments[2],arguments[0]);
		}
		else { //looking for textNode
			this.textNodeHashTable[arguments[1]].nodeValue = arguments[0];
		}

		for (var i=0;i<this.views.length;i++)
			this.views[i].updateElement.apply(this.views[i],arguments);
		
		this.addSnapshot();
	},
	
	parseDocument: function(root) {
		this.nodeHashTable = new Array();
		this.textNodeHashTable = new Array();
		this._parseDocument(root);
	},
	
	_parseDocument: function(root) {
		if (!root) return;
		
		var bc = XMLAux.parseElement(root);
		
		if (bc && root.nodeType==7)
			this.textNodeHashTable[bc.id] = root.nextSibling;

		else if (bc && root.nodeType==1) this.nodeHashTable[bc.id] = root;
		
		var c = root.childNodes;
		for (var i=0;i<c.length;i++)
			this._parseDocument(c.item(i));
	},
	
	updateViews: function() {
		this.refreshContent();
	},	
	
	refreshContent: function() {
		for (var i=0;i<this.views.length;i++)
			this.views[i].refreshContent.apply(this.views[i]);
		ContentEditor.initCaret();
	},
	
	getScrollable: function(node) {
		return Ext.get(node).up("div.x-panel-body");
	},
	
	/**
	* Function transforms the dom using removeBC transformation (reverse of xml_transformation)
	* Returns: dom!
	*/
	output: function() {
		var processor = XSLTProcessor(); //create XSLTProcessor
		processor.importStylesheet(XSLTSet.rXMLTransform);
		var ret = processor.transformToDocument(this.dom);
		//return ret
		console.log(new XMLSerializer().serializeToString(ret));
	},
	
	process: function() {
		//append IDs
		
		for (var i=1;this.init_arr && i<this.init_arr.length;i++) {
			var processor = new XSLTProcessor(); //create XSLTProcessor
			processor.importStylesheet(this.init_arr[i]);
			this.dom = processor.transformToDocument(this.dom);
		}	
		/** And at the end always apply XMLTransform! */
		var processor = new XSLTProcessor(); //create XSLTProcessor
		processor.importStylesheet(XSLTSet.XMLTransform);
		this.dom = processor.transformToDocument(this.dom);

		this.parseDocument(this.dom);
		
		this.initSnapshot();
		this.addSnapshot();
	},
	
});
