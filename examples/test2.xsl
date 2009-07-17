<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <head><title>Contact List</title></head>
      <body style="text-align: center; background-image: url(newspaper.jpg);
      background-repeat: repeat">
        <xsl:apply-templates/>
      </body>
  </xsl:template>

   <xsl:template match="headline">
     <div style="width:450px; border-bottom:5px double black; text-align:left;
       color:black; font-family:Verdana, Arial; font-size:26pt">
       <xsl:value-of select="."/>
     </div>
   </xsl:template>

   <xsl:template match="byline">
     <span style="width:200px; text-align:left; color:black; font-family:Verdana,
     Arial; font-size:12pt">
       <xsl:value-of select="."/>
     </span>
   </xsl:template>

   <xsl:template match="dateline">
     <span style="width:250px; text-align:right; color:gray; font-family:Verdana,
     Arial; font-size:10pt; font-style:italic">
       <xsl:value-of select="."/>
     </span>
   </xsl:template>

   <xsl:template match="p">
     <div style="width:450px; text-align: left; margin-bottom:8px; color:black;
       font-family:Verdana, Arial; font-size:10pt">
       <xsl:apply-templates/>
     </div>
   </xsl:template>

   <xsl:template match="url">
     <span style="font-weight:bold">
       <xsl:value-of select="."/>
    </span>
   </xsl:template>

   <xsl:template match="quote">
     <span style="font-style:italic">
       <xsl:value-of select="."/>
     </span>
   </xsl:template>
 </xsl:stylesheet>


