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

/**
* After processing each final TextNode is wrapped with SPAN 
*/

var XMLPanelEditable = Ext.extend(PanelEditable, {
	url : null,
	rdom : null, //resulting dom (after applying all transformations and transforming the controller document)
	xslt : null, //source xslt
	init_arr : null, //transformations to apply to xslt
	rxslt : null, //resulting xslt
	hashTable: null, //maps: id->node_ref
	controller : null,
	initComponent: function () {
		XMLPanelEditable.superclass.initComponent.apply(this, arguments);
	},
	
	/**
	* Loads XSLT from an URL to be used for this view 
	*/
	loadXSLTurl: function(url) {
		this.url = url;
		this.init_arr = arguments;
		if (!url) {
			this.loadXSLTdom(null);
			return;
		}
		var that = this;
		loadXML(url, function(dom) {that.loadXSLTdom(dom);} );
	},
	
	/**
	* Loads XSLT from dom to be used for this view 
	*/
	loadXSLTdom: function(dom) {
		if (arguments.length>1)
			this.init_arr = arguments;
		this.rxslt = null;
		this.xslt = dom;
		this.process();
	},
	
	/**
	* Pulls markers from controller
	*/
	pullMarkers: function() {
		this.marker = this.controller.marker;
		this.markerClassName = this.controller.markerClassName;
	},
	
	refreshContent: function() { //if contains caret it will be vanished as the method generates a totally new dom tree
		this.unhook(this.content);
		removeAllChildren(this.content); //removes caret as well!
		this.process();
	},
	
	addSnapshot: function() {
		XMLPanelEditable.superclass.addSnapshot.apply(this, arguments);
	},
	
	recallSnapshot: function(step) {
		XMLPanelEditable.superclass.recallSnapshot.apply(this, arguments);
		this.rdom = this.content;
		this.createHashTable(this.content);
	},
	
	/**
	* function to be called internally by XMLEditor
	* Note: arguments[0] is a new value for a node described by markers and it does not contain caret!
	*/
	updateElement: function(/*value + markers*/) {
		var caret = ContentEditor.getCaretDetails(this.content); //will be null in all cases except of current content having caret
		
		if (arguments[2]) {
			if (!this.hashTable[arguments[1]+arguments[2]+arguments[3]]) return;
			this.hashTable[arguments[1]+arguments[2]+arguments[3]].innerHTML = arguments[0]; //xml context
		}else {
			if (!this.hashTable[arguments[1]]) return;
			this.hashTable[arguments[1]].innerHTML = arguments[0]; //xml context
		}
		
		ContentEditor.displayCaret(caret);
	},
	
	parseDocument: function(root) {
		if (!root) return;
		
		if (root.nodeType==3) { //for each textNode wrap it into span!
			var bc = XMLAux.parseElement(root.previousSibling);
			var x = document.createElement('span');
			x.appendChild(root.cloneNode(true));
			root.parentNode.replaceChild(x,root);
			//if the textnode is the follower of our breadcrumb - add attribute
			if (bc) {
				x.setAttribute(this.marker[0],bc.id);
				x.className = this.markerClassName[0];
				if (bc.attr) {
					x.setAttribute(this.marker[1],bc.attr);
					x.setAttribute(this.marker[2],bc.attr_ns);
					x.className = this.markerClassName[1];
				}
			}
		}
	
		var c = root.childNodes;
		for (var i=0;i<c.length;i++)
			this.parseDocument(c.item(i));
	},
	
	createHashTable: function(root) {
		this.hashTable = new Array();
		this._createHashTable(root);
	},
	
	/**
	* Hash table has to be created once all nodes are within document (references are valid!)
	*/
	_createHashTable: function(root) {
		if (!root) return;
	
		if (root.nodeType==3) { //for each textNode wraped it into span!
			var pnode = root.parentNode;
			var id = pnode.getAttribute(this.marker[0]);
			var attr = pnode.getAttribute(this.marker[1]);
			var attr_ns = pnode.getAttribute(this.marker[2]);
			if (!attr) this.hashTable[id] = pnode;
			else this.hashTable[id+attr+attr_ns] = pnode;
		}

		var c = root.childNodes;
		for (var i=0;i<c.length;i++)
			this._createHashTable(c.item(i));
	},
	
	/**
	* Process & Display children
	*/
	process: function() {
		if (!this.controller) {
			console.log("Error: XMLPanelEditable not attached to XMLEditor!");
			return;
		}
		this.pullMarkers();

		var doc = this.controller.getDom();

		if (!this.rxslt && this.xslt) { //create resulting xslt TODO
			this.rxslt = this.xslt;
			for (var i=1;this.init_arr && i<this.init_arr.length;i++) {
				var processor = new XSLTProcessor(); //create XSLTProcessor
				processor.importStylesheet(this.init_arr[i]);
				this.rxslt = processor.transformToDocument(this.rxslt);
			}
			
			/** And at the end always apply XSLTTransform! **/
			var processor = new XSLTProcessor(); //create XSLTProcessor
			processor.importStylesheet(XSLTSet.XSLTTransform);
			this.rxslt = processor.transformToDocument(this.rxslt);
		}
		if (this.rxslt) { //create resulting document rxslt(doc)
			var processor = new XSLTProcessor();
			processor.importStylesheet(this.rxslt);
			this.rdom = processor.transformToDocument(doc);
		} else {
			console.log("Error: no transformation!");
			return;
		}
		this.parseDocument(this.rdom); //get id's properly //have to construct hash table after inserted!
		this.initContent(new XMLSerializer().serializeToString(this.rdom));	
		this.rdom = this.content;
		this.createHashTable(this.rdom);
		this.makeEditable();
	},
});

Ext.reg('XMLPanelEditable', XMLPanelEditable); 
