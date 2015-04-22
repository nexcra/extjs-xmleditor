Web based XML editor with the support of XSLT and without the use of content editable functionality.

Highly extensible and flexible.

Written using ExtJS 3.0. Should also work under ExtJS 2.0 (please refer to TODO 1.0).


&lt;BR&gt;



&lt;BR&gt;




&lt;B&gt;

Requirements:

&lt;/B&gt;



&lt;BR&gt;


<ul>
<li> ExtJS (provided with the editor)</li>
<li> Firefox 3.0</li>
</ul>


&lt;BR&gt;




&lt;B&gt;

Installation/Usage instruction

&lt;/B&gt;



&lt;BR&gt;


1) Get the sources using SVN; alternatively download the ZIP file in Downloads section (might be not up to date)

&lt;BR&gt;


2) In the case of using SVN, place the program on a web server and point your browser to xmleditor.html or htmleditor.html

&lt;BR&gt;


3) In the case of ZIP file, uncompressed and open xmleditor.html or htmleditor.html (do not use web server!)

&lt;BR&gt;




&lt;BR&gt;




&lt;B&gt;

Note:

&lt;/B&gt;



&lt;BR&gt;


- when running locally (not via web server), go to address "about:config" and set "security.fileuri.strict\_origin\_policy" to "false"

&lt;BR&gt;


- htmleditor.html is a demonstration of simple DOM object editor

&lt;BR&gt;


- xmleditor.html is based on htmleditor.html and is a demonstration of simple XML+XSLT editor

&lt;BR&gt;


- the resulting DOM (xslt(xml)) cannot have < html > tag as the editor does not use iframe yet!! (get rid of < html > and </ html > tag in your XML/XSLT before running the editor)

&lt;BR&gt;




&lt;BR&gt;




&lt;B&gt;

Functionality:

&lt;/B&gt;



&lt;BR&gt;


<ul>
<li> input: arbitrary XML file and arbitrary XSLT file</li>
<li> real-time content editing without the use of Content Editable functionality</li>
<li> CSS support (to be improved once IFrame is incorporated)</li>
<li> Redo/Undo actions</li>
</ul>


&lt;BR&gt;





&lt;B&gt;

TODO (version 1.0 - MIT licence):

&lt;/B&gt;



&lt;BR&gt;


<ul>
<li> get rid of GPL licence by substituting Ext.Panel with simple IFrame as well as Sarissa</li>
<li> make the code work on ext.core only and any other tools that are on MIT licence</li>
<li> improve xml_transformation.xsl to handle empty editable nodes (XMLPanelEditable has to be updated to reflect this as well)</li>
<li> Internet Explorer support</li>
<li> handle arrow up & arrow down key presses in propitiate manners</li>
</ul>

&lt;BR&gt;




&lt;B&gt;

TODO (version 2.0 ): 

&lt;/B&gt;



&lt;BR&gt;


- Schema awareness editing & Structure editing.

&lt;BR&gt;



&lt;BR&gt;


-----

&lt;BR&gt;


Grzegorz Dymarek

&lt;BR&gt;



&lt;BR&gt;


CLASS DESIGN:

&lt;BR&gt;


![http://extjs-xmleditor.googlecode.com/svn/trunk/screenshots/Concept.png](http://extjs-xmleditor.googlecode.com/svn/trunk/screenshots/Concept.png)


&lt;BR&gt;


SCREENSHOT:

&lt;BR&gt;


![http://extjs-xmleditor.googlecode.com/files/Screenshot.jpg](http://extjs-xmleditor.googlecode.com/files/Screenshot.jpg)