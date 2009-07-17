<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:variable name="fxe_uri" select='"factonomy.com/schema/xmleditor"'/>

<!-- dont show anything with fxe_uri -->
<xsl:template mode="treeview" match="@*[namespace-uri()=$fxe_uri]" priority="10"></xsl:template>

<!-- dont show fxTestStart processing instructions -->
<xsl:template mode="treeview" match="processing-instruction('fxTextStart')" priority="10"></xsl:template>

<!-- dont show fxTestEnd processing instructions -->
<xsl:template mode="treeview" match="processing-instruction('fxTextEnd')" priority="10"></xsl:template>
  
  
  
  
  <xsl:template match="/">
    <div id="fxe_treeview">
        <xsl:apply-templates select="*" mode="treeview"/>
    </div>
  </xsl:template>
  
  <!-- Template for attributes not handled elsewhere -->
  <xsl:template mode="treeview" match="@*">
    <span>
      <a>&#160;<xsl:value-of select="string(name())"/></a>
      <u>="</u><b><xsl:value-of select="."/></b><u>"</u>
    </span>
  </xsl:template>

  <!-- Template for text nodes -->
  <xsl:template mode="treeview" match="text()">
    <div class="fxeTreeviewLeftmargin">
      <b><xsl:value-of select="."/></b>
    </div>
  </xsl:template>

  <!-- Template for comment nodes -->
  <xsl:template mode="treeview" match="comment()">
    <div class="fxeTreeviewLeftmargin">
      <u>&lt;!--</u><b><xsl:value-of select="."/></b><u>--&gt;</u>
    </div>
  </xsl:template>
  
  <!-- Template for processing instruction nodes -->

  <xsl:template mode="treeview" match="processing-instruction()">
    <div class="fxeTreeviewLeftmargin">
    	<u>&lt;?</u><b><xsl:value-of select="name()"/></b>&#160;<b><xsl:value-of select="."/></b><u>?&gt;</u>
    </div>
  </xsl:template>

  <!-- Template for elements with only text children -->
  <xsl:template mode="treeview" match="*">
    <div class="fxeTreeviewLeftmargin">
      <u>&lt;</u><a><xsl:value-of select="name()"/></a><xsl:apply-templates mode="treeview" select="@*"/><u>&gt;</u>
        <b><xsl:value-of select="text()"/></b>
      <u>&lt;/</u><a><xsl:value-of select="name()"/></a><u>&gt;</u>
    </div>
  </xsl:template>

  <!-- Template for elements with children -->
  <xsl:template mode="treeview" match="*[*|comment()|processing-instruction()]">
      <xsl:call-template name="drawNormal"/>
  </xsl:template>
  
  <xsl:template name="drawNormal">
    <div>
      <u>&lt;</u><a><xsl:value-of select="name()"/></a><xsl:apply-templates mode="treeview" select="@*"/><u>&gt;</u>
        <div><xsl:apply-templates mode="treeview"/></div>
      <u>&lt;/</u><a><xsl:value-of select="name()"/></a><u>&gt;</u>
    </div>
  </xsl:template>

</xsl:stylesheet>
