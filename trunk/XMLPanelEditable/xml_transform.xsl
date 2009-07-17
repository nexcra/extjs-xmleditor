<?xml version="1.0"?>
<!-- 
/* Author: Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk */
-->

<!-- issue! <label></label> contains no textnode so will not be breadcrumbed!
transformation generates and id within give namespace for each node as well as wrappes text nodes with processing instructions that contain a unique id -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<!-- name of preceding breadcrumb variable -->
<xsl:variable name="text_start" select='"fxTextStart"'/>
<!-- name of folowing breadcrumb variable -->
<xsl:variable name="text_end" select='"fxTextEnd"'/>

<xsl:output method="xml" indent="no"/>

<!-- append id for all nodes -->
<xsl:template match="@*|node()">
   <xsl:copy>
   
      <xsl:attribute name="id" namespace="factonomy.com/schema/xmleditor"> 
		<xsl:value-of select="generate-id()" />
      </xsl:attribute>

      <xsl:apply-templates select="@*|node()"/>
   </xsl:copy>
</xsl:template>

<!-- append processing instruction for text nodes; why - because that's out main aim to edit! -->
<xsl:template match="text()">
	<xsl:variable name="id" select="generate-id()"/>
	<xsl:apply-templates select="." mode="appendMarker">
		<xsl:with-param name="tag"><xsl:value-of select="$text_start"/></xsl:with-param>
		<xsl:with-param name="id"><xsl:value-of select="$id"/></xsl:with-param>	
	</xsl:apply-templates><xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy><xsl:apply-templates select="." mode="appendMarker">
		<xsl:with-param name="tag"><xsl:value-of select="$text_end"/></xsl:with-param>
		<xsl:with-param name="id"><xsl:value-of select="$id"/></xsl:with-param>		
	</xsl:apply-templates>
</xsl:template>

<xsl:template match="node()|@*" mode="appendMarker"><xsl:param name="tag"/><xsl:param name="id"/>
<xsl:processing-instruction name="{$tag}">id=<xsl:value-of select="$id"/></xsl:processing-instruction>
</xsl:template>

</xsl:stylesheet>

