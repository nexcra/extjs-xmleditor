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
 * @fileOverview File defines a basic editable component based on Ext.Panel
 * @author Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk
 * @version 0.1 (13/07/2009)
 */
 
/**
 * @description Basic Ext component that is editable with REDO/UNDO support; extends Ext.Panel<BR/>
 * Any content can be made editable by:<BR/>
 * 1) {@link #initContent} to place some content within the panel<BR/>
 * 2) {@link #process} to prepare nodes<BR/>
 * 3) {@link #makeEditable} to notify ContentEditor<BR/>
 * @class PanelEditable
 * @constructor
 * @requires Ext.Panel {@link ContentEditor}
 * @extends Ext.Panel
 */
var PanelEditable = Ext.extend(Ext.Panel, {
	/** @lends PanelEditable.prototype */
	
	content : null,
	snapshot : null,
	/** @type Array of strings
	 * @description node attribute that ContentEditor looks for to make a node editable;<BR/>
	 * Can have more markers; however only the first one (if set) indicates 'editability'; the reminder is passed over to {@link .updateElement} - can be used to unique identification of editable nodes
	 * Note! only textnodes can be made editable
	 */
	marker : ['myEditable'], 
	/** @type Array of strings
	 * @description Depending on marker set bound to a node, ContentEditor sets nodes CSS names taken from the array
	 */
	markerClassName : ['cssMyEditable'],
	
	/**
	* @ignore
	* @description initializes component; please see Ext.Panel for more information
	*/	
	initComponent: function () {
		PanelEditable.superclass.initComponent.apply(this, arguments);
		this.content = document.createElement("div");
		this.contentEl = this.content;
	},

	/**
	* @description Adds content to the component
	* @param {DOM/DOM string} content content to be placed within the panel
	*/
	initContent: function(content) {
		if (content.nodeType)
			this.content.appendChild(content);
		else this.content.innerHTML = content;
	},
	
	/**
	* @description Initializes snapshots
	* Function called by makeEditable
	*/
	initSnapshot: function() {
		this.snapshot = new Array();
		this.snapshot.current_snap_pos = undefined;
	},

	/**
	* @description Function to refresh/regenerate current content.
	* Usually not used!
	* <BR/>Interface function.
	*/
	refreshContent: function() {
	},
	
	/**
	* @description
	* Function called by ContentEditor every time an editable element is changed
	* @param {string} value new value
	* @param {} markers identification of the node as set by {@link #process} (marker value) {@link #marker}
	*/
	updateElement: function(/*value + values for each of the markers*/) {
		/* Suggestion:
		* 1) store caret position
		* 2) remove caret
		* 3) update value
		* 4) place caret back
		*/
		var caret = ContentEditor.getCaretDetails(this.content);
		/*...*/
		
		ContentEditor.displayCaret(caret);
		this.addSnapshot();
	},
	
	/**
	* @description function to store current state of the document for the purpose of UNDO/REDO<BR/>
	* Should be called from {@link #updateElement}
	*/
	addSnapshot: function() {
		if (!this.snapshot) return;
		if (this.snapshot.current_snap_pos!=undefined) {
			this.snapshot.trim(this.snapshot.current_snap_pos+1);
		}

		var pos = this.snapshot.length;
		this.snapshot[pos] = new Object();
		var snap = this.content.cloneNode(true);
		this.snapshot[pos].snap = snap;
		this.snapshot.current_snap_pos = pos;
	},
	
	/**
	* @description Retrieves stored snapshot and replace current document
	* @param {int} step The snapshot to use relative to the current state
	*/
	recallSnapshot: function(step) {
		var s_n = this.snapshot.current_snap_pos+step;
		if (s_n>=this.snapshot.length) return;
		if (s_n<0) return;
		var ptr = this.snapshot[s_n];
		this.snapshot.current_snap_pos = s_n;
		removeAllChildren(this.content);
		
		/* dont add the whole snapshot but only the inner part of it! */
		/* have to keet this.content element intacked as it might be bound to something else in Ext.Panel? */
		for (var i=0;i<ptr.snap.childNodes.length;i++)
			this.initContent(ptr.snap.childNodes[i].cloneNode(true));
		
		ContentEditor.bindCaret(this.content); //will be bound only if exists
		//since a snapshot is a copy any hashTable to store id's etc has to be rebuild!
	},
	
	/** 
	* @description returns copy of the current document
	* @returns {DOM} copy of the current document
	*/
	getDom: function() {
		if (!this.content) return null;
		var ret_dom = this.content.cloneNode(true);
		ret_dom = ContentEditor.removeHooks(ret_dom);
		return ret_dom[0];
	},
	
	/**
	* @description prints into console the copy of the current document
	*/	
	output: function() {
		console.log(this.getDom());
	},
	
	
	/**
	* @description returns the container of a node that is scrollable
	* @default null
	* @returns scrollabel component
	*/	
	getScrollable: function() {
		return Ext.get(this.content).up("div.x-panel-body");
	},
	
	/**
	* @description processes the current document in order to append markers
	* Note! Editable nodes have to be wrapped using span with a marker!
	* @param {DOM} root DOM node to process
	*/
	process: function(root) {
		if (!root) return;
	
		if (root.nodeType==3) { //for each textNode wrap it into a span with marker!
			var x = document.createElement('span');
			x.appendChild(root.cloneNode(true));
			x.setAttribute(this.marker[0],1);
			root.parentNode.replaceChild(x,root);
		}
		//textNode has not children so
		//implicit else
		var c = root.childNodes;
		for (var i=0;i<c.length;i++)
			this.process(c.item(i));
	},
	
	/**
	* @description method makes a node being editable<BR/>
	* Note! content has to be prepared in order to make it Editable<BR/>
	* Can implement own function that wrapes editable nodes with spans
	* and gives them attribute marker[0]<BR/>
	* Please see: {@link #process}
	*/
	makeEditable: function() {
		ContentEditor.makeEditable.apply(this,[this.content]);
		
		this.initSnapshot();
		this.addSnapshot();
	},
	
	/**
	* @description unhooks any events bound to current content<BR/>
	* method usually used when re-processing content
	*/
	unhook: function() {
		ContentEditor.unhook.apply(this,[this.content]);
	},	
});

Ext.reg('paneleditable', PanelEditable); 
