<?xml version="1.0"?>
<!--

/* Author: Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk */

-->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="no"/>

<!-- append id for all nodes -->
<xsl:template match="@*|node()">
   <xsl:copy>
      <xsl:apply-templates select="@*[namespace-uri()!='factonomy.com/schema/xmleditor']"/>
      <xsl:apply-templates select="node()"/>
   </xsl:copy>
</xsl:template>

<xsl:template match="processing-instruction('fxTextStart')">
</xsl:template>
<xsl:template match="processing-instruction('fxTextEnd')">
</xsl:template>
<xsl:template match="processing-instruction('fxAttrStart')">
</xsl:template>
<xsl:template match="processing-instruction('fxAttrEnd')">
</xsl:template>

</xsl:stylesheet>

