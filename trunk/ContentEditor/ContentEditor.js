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
 * @fileOverview File defines static editor
 * @author Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk
 * @version 0.1 (13/07/2009)
 */
 
/**
 * @description Main component to provide editing fascility without the use of 'content editable' <BR/>
 * Please refer to {@link PanelEditable} for details on how an Editor can be used. <BR/>
 * Any content can be made editable by:<BR/>
 * The basic idea is as follows:<BR/>
 * 1) issue ContentEditor.init() on a component that features scrolling<BR\>
 * 2) issue ContentEditor.makeEditable() on a dom node of the component<BR>\><BR\>
 * <B>Requires editor.css</B>
 * @class ContentEditor
 * @constructor
 */
function ContentEditor() {}
/** @lends ContentEditor */
	
/** CSS class name for nodes that are not editable */
ContentEditor.nEditable_className = ['node_notEditable'];

/* load required files (if not already loaded) */
if (!document.ContentEditor_defined) {

/** caret className */
ContentEditor.caret_className = "fxe_caret";


ContentEditor.prefix_id = "node:editable:"; //have to mark editable nodes in a way that is unique (i.e. tX, where X:N)
ContentEditor.prefix_tmp_id = "temporary:"; //temporary market for nodes that are split (this prefix is appended to prefix_id)
ContentEditor.counter_id = 0; //used when constructing full prefix_id
ContentEditor.counter_tmp_id = 0;	 //used when consturcting full prefix_tmp_id
ContentEditor.tmp = null; //used for creating links for nodes
ContentEditor.current_scrollable_component = null; //for scrolling purpose
ContentEditor.current_epanel = null; //current editable XMLView reference

ContentEditor.initCaret = function() {
	ContentEditor.caret = document.createElement('span');
	ContentEditor.caret.className = ContentEditor.caret_className;
	ContentEditor.caret.innerHTML = "&nbsp;";
};

ContentEditor.initCaret(); //init caret straight away

/**
 * @description Method to associate {@link EditableComponent} with the editor.<BR/>
 * Editor has to know which component we are editing. 
 * @param {PanelEditable Object} epanel PanelEditable object - a compound of the editor
 */
ContentEditor.init = function(epanel) {
	ContentEditor.current_epanel = epanel;
};

/**
 * @description Activate 'clickability' for the dom
 * @param {DOM Object} dom dom to active the editability for
 */ 
ContentEditor.makeEditable = function(dom) {
	ContentEditor.tmp = null;
	ContentEditor.installHooks(dom);
	Ext.get(dom).on("click",ContentEditor.handleClick,arguments.caller);
	ContentEditor.tmp = null;
};

/**
 * @description Remove 'clickability' for the dom
 * @param {DOM Object} dom dom to remove the editability for
 */
ContentEditor.unhook = function(dom) {
	Ext.get(dom).un("click",ContentEditor.handleClick,arguments.caller);
};

/**
 * @description Internal method executed every time a text is clicked<BR>
 * It check if a node has editabe property, calculates new carret position and places the carret
 * @param {Event Object} e Event Object associate with a mouse click.
 */
ContentEditor.handleClick = function(e) {
	//TextRange info: http://www.quirksmode.org/dom/range_intro.html
	if (!window.getSelection()) return;
	var node = window.getSelection().anchorNode.parentNode;
	//console.log(node);
	//console.log(new XMLSerializer().serializeToString(ContentEditor.current_epanel.views[1].content));
	if (!ContentEditor.isNodeOfType(node,0)) return;
	
	//console.log(ContentEditor.getCaretDetails());

	var new_caret_pos = window.getSelection().anchorOffset; //position in the current node
	new_caret_pos+=ContentEditor.adjustPos(node,new_caret_pos);
	ContentEditor.current_scrollable_component = ContentEditor.current_epanel.getScrollable(node); //need the container for scrolling purposes

	// in the case we clicked in a -already-split-node-, after rejoin the position will change accordingly to the previous node
	if (ContentEditor.isNodeOfType(node,1)) { //check if it is a -already-split-node-
		if (ContentEditor.isNodeOfType(node.prevTextNode,1)) //check if the previous one is as well temporary
			new_caret_pos += node.prevTextNode.innerHTML.length; //if yes - adjust the position
		node = Ext.get(node).parent().dom; //from now refer to parent
		ContentEditor.removeCaret(); //rejoin nodes
	}
	ContentEditor.displayCaret({node:node,pos:new_caret_pos});
};

/**
* @description Function calls the {@link PanelEditable#refreshContent} function for associatd PanelEditable 
*/
ContentEditor.updateViews = function() {
	ContentEditor.current_epanel.refreshContent();
};

/** 
* @description Function finds a caret in the given dom and binds it to the ContentEditor carret object
* @param {DOM Object} root DOM object to look for caret object
* @default Does nothing.
*/
ContentEditor.bindCaret = function(root) {
	var caret_obj = ContentEditor.getCaretDetails(root);
	if (caret_obj) ContentEditor.caret = caret_obj.caret;
};

/**
 * @description Function to recall a snapshot and set it as a current document
 * @param {int} step Step to recall, relative to the current stage. Negative = Undo; Positive = Redo;
 */
ContentEditor.recallSnapshot = function(step) {
	ContentEditor.current_epanel.recallSnapshot(step);
};

/**
* Output str to current node (pointed by caret's parentNode
*/
ContentEditor.output = function(str) {
	var item = ContentEditor.caret.parentNode.childNodes.item(0);
	item.innerHTML+=str;
};

ContentEditor.commitChange = function(node) {
	var value = node.cloneNode(true);
	value = mergeNodeTextArray(ContentEditor.removeHooks(value));
	
	var args = new Array();
	args[0] = value;
	for (var i=0;i<ContentEditor.current_epanel.marker.length;i++)
		args[i+1] = node.getAttribute(ContentEditor.current_epanel.marker[i]);

	/* and update other views */
	ContentEditor.current_epanel.updateElement.apply(ContentEditor.current_epanel,args);

};

/* defaults to 1 */
ContentEditor.nextCharLength = function(node,pos) {
	var ret = ContentEditor.isSpecialChar(node.innerHTML,pos);
	if (ret>0) return ret;
	else return 1;
};

/* defaults to 1 */	
ContentEditor.prevCharLength = function(node,pos) {
	if (pos<=0) return 1;
	var i=1;
	if (node.innerHTML[pos-i]==';') { //might be
		while ((pos-i>=0) && (node.innerHTML[pos-i]!='&')) i++; //looking for '&'
		if (pos-i<0) return 1;
		return i;
	}
	return 1;
};	

ContentEditor.handleKey = function(e) {
	if (!ContentEditor.caret.parentNode) return;
	var caret_obj = ContentEditor.getCaretDetails();
	if (e.isNavKeyPress()) {
		e.preventDefault();
		switch (e.getKey()) {
			case e.RIGHT: //arrow right 
				caret_obj.pos += ContentEditor.nextCharLength(caret_obj.next_node,0);
				ContentEditor.displayCaret(caret_obj); 
			break;
			case e.UP: //arrow up - place it at the end of previous node
				caret_obj.pos = -1;
				ContentEditor.displayCaret(caret_obj); 
			break;
			case e.LEFT: //arrow left 
				caret_obj.pos -= ContentEditor.prevCharLength(caret_obj.prev_node,caret_obj.pos);
				ContentEditor.displayCaret(caret_obj);
			break;
			case e.DOWN: //arrow down - place it at the end of current node
				caret_obj.pos = caret_obj.node.innerHTML.length;
				ContentEditor.displayCaret(caret_obj); 
			break;
			case e.TAB: //arrow down
				if (e.shiftKey) {
					caret_obj.pos = -1;
					ContentEditor.displayCaret(caret_obj); 
				} else {
					caret_obj.pos = caret_obj.node.innerHTML.length;
					ContentEditor.displayCaret(caret_obj); 
				}
			break;
			case e.ENTER:		
			break;
			default: console.log(e);
		}
	}
	else if (e.isSpecialKey()) {
		switch (e.getKey()) {
			case e.BACKSPACE: //backspace 
				if (caret_obj.pos>0) {  //if there is something to delete - get its length and delete it
					var c_width = ContentEditor.prevCharLength(caret_obj.prev_node,caret_obj.prev_node.innerHTML.length);
					caret_obj.prev_node.innerHTML = caret_obj.prev_node.innerHTML.substring(0,caret_obj.pos-c_width);
					ContentEditor.commitChange(caret_obj.node);
				}
				e.preventDefault();
			break;
		}
	}
	else {
		switch (e.getKey()) {

			case e.SPACE:
				ContentEditor.output("&nbsp;");
				ContentEditor.commitChange(caret_obj.node);
			break;
			default:
				ContentEditor.output(String.fromCharCode(e.getCharCode()));
				ContentEditor.commitChange(caret_obj.node);
		}
		e.preventDefault();
	}
	Ext.get(caret_obj.caret).scrollIntoView(ContentEditor.current_scrollable_component); //adjust view	
};


Ext.get(document).on('keypress',ContentEditor.handleKey);

ContentEditor.isNodeOfType = function(node,type) { //node of type 1 is also node of type 0, vice-versa does not apply!
	if (!node) return false;
	switch (type) {
		case 0: //editable
			if (!node.id) return false;
			if (node.id.substring(0,ContentEditor.prefix_id.length)==ContentEditor.prefix_id)
				return true;
		break;
		case 1: //editable-temporary
			if (!node.id) return false;
			var template = ContentEditor.prefix_id + ContentEditor.prefix_tmp_id;
			if (node.id.substring(0,template.length)==template)
				return true;
		break;	
		case 2: //caret
			if (node.className==ContentEditor.caret_className) return true;
		break;
	}
	return false;
};

/**
* Create linked list with ids; a node with an id=ContentEditor.prefix_id is editable/clickable..
* 
*/

ContentEditor.installHooks = function(node) {
	var i;
	if (!node) return;
	
	if (node.nodeType==3 && node.parentNode && node.parentNode.getAttribute(ContentEditor.current_epanel.marker[0])) { //make editable only nodes with marker[0] attribute)
		var p_node = node.parentNode; //span
		p_node.id = ContentEditor.prefix_id+ContentEditor.counter_id++;
		p_node.prevTextNode = ContentEditor.tmp;
		p_node.nextTextNode = null;
		ContentEditor.tmp = p_node;
		if (p_node.prevTextNode)
			p_node.prevTextNode.nextTextNode = p_node;
	} else if (node.nodeType==3) {
		node.parentNode.className = ContentEditor.nEditable_className;
	}
	
	for(i=0; node.childNodes.item(i); i++) 
		ContentEditor.installHooks(node.childNodes.item(i));
};


ContentEditor.removeHooks = function(node) {
	var ret = new Array();
	if (!node) return ret;
	
	var i=0;j=0;
	
	if (ContentEditor.isNodeOfType(node,2)) return ret;
	
	for (i=node.childNodes.length-1;i>=0;i--) {
		var child = node.childNodes.item(i);
		var n_child = ContentEditor.removeHooks(child);
		for (j=0;j<n_child.length;j++)
			node.insertBefore(n_child[j],child);
		node.removeChild(child);	
	}
	
	if (ContentEditor.isNodeOfType(node,0)) {
		for (j=0;j<node.childNodes.length;j++)
			ret[ret.length] = node.childNodes.item(j);
		return ret;
	}
	
	ret[0] = node.cloneNode(true);
	return ret;
};

/** 
* Returns number that represents number of characters in node that belong to special characters
*/
ContentEditor.adjustPos = function(node, pos) {
	var i=0;
	var ret = 0;
	for (i=0;i<pos;i++) {
		var _ret = ContentEditor.isSpecialChar(node.innerHTML,i+ret)
		if (_ret) {ret+=_ret; ret--;} //pos does include 1 char per special char so we have to remove it 
	}
	return ret;
};

/**
* Return false if it is a regular character (valid & character)
* Returns numer - if it is a special character; Number = number of characters of the special character
*/
ContentEditor.isSpecialChar = function(str, pos) {
	if (pos<0) return 0;
	var ret = 0;
	if (str[pos]=='&') {
		var _j = ret;
		while ((str[pos+ret]!=';') && (pos+ret<str.length)) ret++;
		ret++;
		if (pos+ret>str.length) ret=_j;
	} 
	return ret;		
};

/** Splits a node into two parts : (0,l) & (l,+)
* return object with references to the two parts
* assumption: node.length>1 && 0<l<node.length
* the split creates two new nodes within node! Node persists!
*/
ContentEditor.splitTextNode = function(node, l) {
	var ret = new Object();
	ret.left = document.createElement("span");
	ret.left.id = ContentEditor.prefix_id+ContentEditor.prefix_tmp_id+ContentEditor.counter_tmp_id++;
	ret.left.innerHTML = node.innerHTML.substring(0,l);
	ret.right = document.createElement("span");
	ret.right.id = ContentEditor.prefix_id+ContentEditor.prefix_tmp_id+ContentEditor.counter_tmp_id++;
	ret.right.innerHTML = node.innerHTML.substring(l);
	removeAllChildren(node);
	node.appendChild(ret.left);
	node.appendChild(ret.right);
	
	ContentEditor.repairEditableList(node.prevTextNode,ret.left,ret.right);
	ContentEditor.repairEditableList(ret.left,ret.right,node.nextTextNode);
	return ret;	
};
		
/** Rejoins the split done by splitTextNode 
* pnode is node that was used in splitTextNode function
*/
ContentEditor.rejoinTextNodes = function(pnode) {
	var i=0;
	var txt = "";
	for (i=0;i<pnode.childNodes.length;i++) {
		txt += pnode.childNodes.item(i).innerHTML;
		ContentEditor.counter_tmp_id--;
	}
	removeAllChildren(pnode);
	pnode.innerHTML = txt;
	
	ContentEditor.repairEditableList(pnode.prevTextNode,pnode,pnode.nextTextNode);
};
	

/**
* Repairs a,b,c nextTextNode/prevTextNode
* c can be undefined
*/	
ContentEditor.repairEditableList = function(a,b,c) {
	if (a) a.nextTextNode = b;
	if ((b) && (c!=undefined)) b.nextTextNode = c;
	if (c) c.prevTextNode = b;
	if (b) b.prevTextNode = a;
};

/**
* Method return an object that represents caret position within given dom
*/
ContentEditor.getCaretDetails = function(node) {
	var caret_ptr = null;
	if (node) caret_ptr = Ext.get(node).child("span."+ContentEditor.caret_className);
	else caret_ptr = Ext.get(ContentEditor.caret);
	
	if (caret_ptr)
		return {
			caret : caret_ptr.dom,
			node : caret_ptr.dom.parentNode,
			prev_node : caret_ptr.dom.previousSibling,
			pos : caret_ptr.dom.previousSibling!=null?caret_ptr.dom.previousSibling.innerHTML.length:null,
			next_node : caret_ptr.dom.nextSibling,
		};

	return null;
};

ContentEditor.removeCaret = function() {
	if(ContentEditor.caret.parentNode != null) {
		// Remove from current parent
		var parent = ContentEditor.caret.parentNode;
		ContentEditor.caret.parentNode.removeChild(this.caret);
		ContentEditor.rejoinTextNodes(parent);
	}
};

/**
* Displayes caret in a given node
*/
ContentEditor.displayCaret = function(caret_obj) {
	if (!caret_obj) return;
	var node = caret_obj.node;
	var pos = caret_obj.pos;
	ContentEditor.removeCaret();
	if (pos<0) {
		if (node.prevTextNode) {
			node = node.prevTextNode;
			pos = node.innerHTML.length;
		} else pos=0;
	}
	if (pos>node.innerHTML.length) {
		if (node.nextTextNode) {
			node = node.nextTextNode;
			pos = 0;
		} else pos = node.innerHTML.length;
	}		
	var tmp = ContentEditor.splitTextNode(node,pos);
	node.insertBefore(ContentEditor.caret,tmp.right);
	ContentEditor.positionChanges(node,pos,ContentEditor.createIdentifier(ContentEditor.caret));
};

ContentEditor.positionChanges = function(node, pos, xpath) {
		console.log(xpath);
},
	
ContentEditor.createIdentifier = function(elem) {
	var ret = "";
	
	var id = elem.parentNode.getAttribute(ContentEditor.current_epanel.marker[0]);
	ret = "["+id+"]";
	return ret;
};

document.ContentEditor_defined = 1;

}


//====== auxilary functions ========//
/**
 * @ignore
 */
function removeAllChildren(node) {
	var i;
	if (node.childNodes.length>0)
		for(i=node.childNodes.length-1; i>=0; i--) {
			this.removeAllChildren(node.childNodes.item(i));
			node.removeChild(node.childNodes.item(i));
		}	
}

// Array Remove - By John Resig (MIT Licensed)
/**
 * @ignore
 */
Array.prototype.cut = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

/**
 * @ignore
 */
Array.prototype.remove = function(elem) {
	var i=0;
	while (i<this.length && this[i]!=elem) i++;
	return this.cut(i);
};

/** 
* returns the same array that is cut at position pos
*/
/**
 * @ignore
 */
Array.prototype.trim = function(pos) {
	this.splice(pos,this.length-pos);
	return this;
};

/**
 * @ignore
 */
function arrayCutElement(array,n) {
	var ret = new Array();
	for (var i=0;i<array.length;i++) 
		if (i!=n)
			ret[ret.length] = array[i];
	return ret;
};

/**
 * @ignore
 */
function mergeNodeTextArray(arr) {
	var ret = "";
	for (var i=0;i<arr.length;i++) {
		var str = arr[i].nodeValue;
		ret+=str;
	}
	return ret;
};
