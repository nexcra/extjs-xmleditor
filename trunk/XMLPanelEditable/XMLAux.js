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
* load XML from a file and calls callback function with the XML dom as an argument
*/
var XSLTSet = new Object();

function loadXML(url,callback) {
	var req = new XMLHttpRequest();  
	req.open('GET', url, true);   
	req.onreadystatechange = function() {
		if(req.readyState==4 && req.status==200) {
			var _v = (new DOMParser()).parseFromString(req.responseText, "text/xml");
			callback(_v);
		}
	}
	req.send(null);  
}

/* dynamic JavaScript loader */
function jsLoader(url) {
	var scriptObj = document.createElement("script");
	scriptObj.setAttribute("src", url /*+ '&noCacheIE=' + (new Date()).getTime()*/);
	scriptObj.setAttribute("type", "text/javascript");
	document.getElementsByTagName("head").item(0).appendChild(scriptObj);
}

var relative_path = "XMLPanelEditable/";
var sarissa_path = "sarissa/gr/abiss/js/sarissa/sarissa.js";
var XMLtransform_path = "xml_transform.xsl"
var rXMLtransform_path = "xml_rtransform.xsl"
var XSLTtransform_path = "xsl_transform.xsl"
//var editor_XSLTtransform_path = "XML/identity.xsl"

jsLoader(relative_path+sarissa_path);
loadXML(relative_path+XMLtransform_path, function(dom) {XSLTSet.XMLTransform=dom;});
loadXML(relative_path+rXMLtransform_path, function(dom) {XSLTSet.rXMLTransform=dom;});
loadXML(relative_path+XSLTtransform_path, function(dom) {XSLTSet.XSLTTransform=dom;});


function XMLAux() {};

XMLAux.bc_text_start = "fxTextStart";
XMLAux.bc_text_end = "fxTextEnd";
XMLAux.bc_attr_start = "fxAttrStart";
XMLAux.bc_attr_end = "fxAttrEnd";
XMLAux.editor_id = "id"; //node id appended by XMLTransform
XMLAux.editor_URI = "factonomy.com/schema/xmleditor"; //editor namespacce


XMLAux.parseElement = function(node) {
	if (!node) return null;
	//console.log(node.nodeName);
	var ret = new Object();
	if (node.nodeType==7 && (node.target==XMLAux.bc_text_start)) {
		var id_start_pos = node.data.indexOf("id=")+3;
		ret.id = node.data.substring(id_start_pos);
	}
	else if (node.nodeType==7 && (node.target==XMLAux.bc_attr_start)) {
		var id_start_pos = node.data.indexOf("id=")+3;
		var id_end_pos = node.data.indexOf(" attr=");
		var attr_start_pos = node.data.indexOf(" attr=")+6;
		var attr_end_pos = node.data.indexOf(" attr_ns=");
		var attr_ns_start_pos = node.data.indexOf(" attr_ns=")+9;
		ret.id = node.data.substring(id_start_pos,id_end_pos);
		if (attr_start_pos>0) {
			ret.attr = node.data.substring(attr_start_pos,attr_end_pos);
			ret.attr_ns = node.data.substring(attr_ns_start_pos);
		}
	}
	else if (node.nodeType==1)
		ret.id = node.getAttributeNS(XMLAux.editor_URI,XMLAux.editor_id);
	
	ret.name = node.target;
	
	if (ret.id) return ret;
	return null;
};
