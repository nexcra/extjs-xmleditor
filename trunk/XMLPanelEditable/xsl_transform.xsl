<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<!--

/* Author: Grzegorz Dymarek gd58@alumni.st-andrews.ac.uk */

-->

<xsl:output method="xml" indent="yes"/>

<xsl:variable name="fxe_uri" select='"factonomy.com/schema/xmleditor"'/>
<xsl:variable name="APOS">&apos;</xsl:variable>
<!-- ./@*[namespace-uri()='factonomy.com/schema/xmleditor'][local-name()='id'] -->
<xsl:variable name="id_selector" select="concat('./@*[namespace-uri()=',$APOS,$fxe_uri,$APOS,'][local-name()=',$APOS,'id',$APOS,']')"/>

<!-- name of preceding breadcrumb text variable -->
<xsl:variable name="text_start" select='"fxTextStart"'/>
<!-- name of following breadcrumb text variable -->
<xsl:variable name="text_end" select='"fxTextEnd"'/>

<!-- name of preceding breadcrumb attribute variable -->
<xsl:variable name="attr_start" select='"fxAttrStart"'/>
<!-- name of following breadcrumb attribute variable -->
<xsl:variable name="attr_end" select='"fxAttrEnd"'/>

<xsl:template match="node()|@*">
	<xsl:copy>			
		<xsl:apply-templates select="@*|node()"/>
	</xsl:copy>			
</xsl:template>

<!-- match on stylesheet in order to append text fetcher and append namespace -->
<xsl:template match="xsl:stylesheet">
	<xsl:element name="xsl:stylesheet">
		<xsl:apply-templates select="@*"/>	
		<xsl:copy-of select="xsl:param"/>
		<xsl:apply-templates select="." mode="createRoutines"/>
		<xsl:apply-templates select="node()[name()!='xsl:param']"/>
	</xsl:element>
</xsl:template>

<xsl:template match="*" mode="createRoutines">
<!--
	<out:template match="processing-instruction('{$text_start}')">
		<out:variable name="id" select="substring-after(.,'id=')"/>
		<out:processing-instruction name="{$text_start}">id=<out:value-of select="$id"/></out:processing-instruction>
	</out:template>
-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">processing-instruction('<xsl:value-of select="$text_start"/>')</xsl:attribute>
		<xsl:element name="xsl:processing-instruction">
			<xsl:attribute name="name"><xsl:value-of select="$text_start"/></xsl:attribute>
			<xsl:text>id=</xsl:text>
			<xsl:element name="xsl:value-of">
				<xsl:attribute name="select">substring-after(.,'id=')</xsl:attribute>
			</xsl:element>
		</xsl:element>
	</xsl:element>
<!--
	<out:template match="processing-instruction('{$text_end}')">
		<out:variable name="id" select="substring-after(.,'id=')"/>
		<out:processing-instruction name="{$text_end}">id=<out:value-of select="$id"/></out:processing-instruction>
	</out:template>	
-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">processing-instruction('<xsl:value-of select="$text_end"/>')</xsl:attribute>
		<xsl:element name="xsl:processing-instruction">
			<xsl:attribute name="name"><xsl:value-of select="$text_end"/></xsl:attribute>
			<xsl:text>id=</xsl:text>
			<xsl:element name="xsl:value-of">
				<xsl:attribute name="select">substring-after(.,'id=')</xsl:attribute>
			</xsl:element>
		</xsl:element>
	</xsl:element>	

	<!-- two cases - we are in the node along with bc and value -->
	<!-- or we are already within the text node -->
	<!-- retrieve a the first processing-instruction in preceding-sibling of the node -->
	<!-- 	<out:template match="node()" mode="getPITextStart">
				<out:choose>
					<out:when test="./child::processing-instruction($text_start)[1]">
						<out:value-of select="./child::processing-instruction($text_start)[1]"/>
					</out:when>
					<out:otherwise>
						<out:value-of select="./preceding-sibling::processing-instruction($text_start)[1]"/>
					</out:otherwise>
				</out:choose>
			</out:template>
	-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">node()</xsl:attribute>
		<xsl:attribute name="mode">getPITextStart</xsl:attribute>
			<xsl:element name="xsl:choose">
				<xsl:element name="xsl:when">
					<xsl:attribute name="test">./child::processing-instruction('<xsl:value-of select="$text_start"/>')[1]</xsl:attribute>
					<xsl:element name="xsl:value-of"><xsl:attribute name="select">./child::processing-instruction('<xsl:value-of select="$text_start"/>')[1]</xsl:attribute></xsl:element>
				</xsl:element>
				<xsl:element name="xsl:otherwise">
					<xsl:element name="xsl:value-of"><xsl:attribute name="select">./preceding-sibling::processing-instruction('<xsl:value-of select="$text_start"/>')[1]</xsl:attribute></xsl:element>
				</xsl:element>		
			</xsl:element>
	</xsl:element>

	<!-- 	<out:template match="node()" mode="getPITextEnd">
				<out:choose>
					<out:when test="./child::processing-instruction($text_end)[1]">
						<out:value-of select="./child::processing-instruction($text_end)[1]"/>
					</out:when>
					<out:otherwise>
						<out:value-of select="./following-sibling::processing-instruction($text_end)[1]"/>
					</out:otherwise>
				</out:choose>
			</out:template>
	-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">node()</xsl:attribute>
		<xsl:attribute name="mode">getPITextEnd</xsl:attribute>
			<xsl:element name="xsl:choose">
				<xsl:element name="xsl:when">
					<xsl:attribute name="test">./child::processing-instruction('<xsl:value-of select="$text_end"/>')[1]</xsl:attribute>
					<xsl:element name="xsl:value-of"><xsl:attribute name="select">./child::processing-instruction('<xsl:value-of select="$text_start"/>')[1]</xsl:attribute></xsl:element>
				</xsl:element>
				<xsl:element name="xsl:otherwise">
					<xsl:element name="xsl:value-of"><xsl:attribute name="select">./following-sibling::processing-instruction('<xsl:value-of select="$text_end"/>')[1]</xsl:attribute></xsl:element>
				</xsl:element>		
			</xsl:element>
	</xsl:element>

<!-- since we are in an attribute get its parent id -->
<!--	<out:template match="@*" match="getAttrID">
			<out:value-of select="concat('.','$id_selector');"/>
		</out:template>
-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">@*</xsl:attribute>
		<xsl:attribute name="mode">getAttrID</xsl:attribute>
				<xsl:element name="xsl:value-of">
					<xsl:attribute name="select"><xsl:value-of select="concat('.',$id_selector)"/></xsl:attribute>
				</xsl:element>
	</xsl:element>
	
<!--	<out:template match="@*" match="getAttrName">
			<out:value-of select="name()"/>
		</out:template>
-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">@*</xsl:attribute>
		<xsl:attribute name="mode">getAttrName</xsl:attribute>
		<xsl:element name="xsl:value-of">
			<xsl:attribute name="select">name()</xsl:attribute>
		</xsl:element>
	</xsl:element>

<!--	<out:template match="@*" match="getAttrNS">
			<out:value-of select="namespace-uri()"/>
		</out:template>
-->
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">@*</xsl:attribute>
		<xsl:attribute name="mode">getAttrNS</xsl:attribute>
		<xsl:element name="xsl:value-of">
			<xsl:attribute name="select">namespace-uri()</xsl:attribute>
		</xsl:element>
	</xsl:element>

<!--	<out:template match="@*" match="nodeTest">
			attribute
		</out:template>
-->			
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">@*</xsl:attribute>
		<xsl:attribute name="mode">nodeTest</xsl:attribute>
		<xsl:text>attribute</xsl:text>
	</xsl:element>

<!--	<out:template match="node()" match="nodeTest">
			node
		</out:template>
-->			
	<xsl:element name="xsl:template">
		<xsl:attribute name="match">node()</xsl:attribute>
		<xsl:attribute name="mode">nodeTest</xsl:attribute>
		<xsl:text>node</xsl:text>
	</xsl:element>	

</xsl:template>


<xsl:template match="xsl:value-of">

	<xsl:choose>
	<xsl:when test="not(contains(@select,'(')) and not(contains(@select,'$'))"> <!-- Ugly (approximation) test if @select WILL resolve to node (node() or @*) -->

	<xsl:element name="xsl:if"><xsl:attribute name="test">1</xsl:attribute>
	
	<!-- <out:variable name="path"><xsl:value-of select="@select"/></out:variable> -->
	<xsl:element name="xsl:variable"><xsl:attribute name="name">path</xsl:attribute><xsl:attribute name="select"><xsl:value-of select="@select"/></xsl:attribute></xsl:element>
	
	<!-- <out:variable name="nodeType"><out:apply-templates select="{@select}" mode="nodeTest"/></out:variable> -->
		<xsl:element name="xsl:variable"><xsl:attribute name="name">nodeType</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">nodeTest</xsl:attribute></xsl:element></xsl:element>		
<!--	
	<out:choose>
		<out:when test="$nodeType='attribute'">
			<out:variable name="bc"><out:apply-templates select="$path" mode="getAttrID"/></out:variable>
			<out:variable name="attr_name"><out:apply-templates select="$path" mode="getPIAttrName"/></out:variable>
			<out:processing-instruction name="{$attr_start}">id=<out:value-of select="$bc"/> attr=<out:value-of select="$attr_name"/></out:processing-instruction>		
		</out:when>
		<out:when test="$nodeType='node'">
			<out:variable name="bc"><out:apply-templates select="$path" mode="getPITextStart"/></out:variable>
			<out:processing-instruction name="{$text_start}"><out:value-of select="$bc"/></out:processing-instruction>
		</out:when>	
		<out:otherwise></out:otherwise>	
	</out:choose>
-->
	<xsl:element name="xsl:choose">
		<xsl:element name="xsl:when">
			<xsl:attribute name="test">$nodeType='attribute'</xsl:attribute>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">bc</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrID</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">attr_name</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrName</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">attr_ns</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrNS</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:processing-instruction"><xsl:attribute name="name"><xsl:value-of select="$attr_start"/></xsl:attribute>id=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$bc</xsl:attribute></xsl:element> attr=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$attr_name</xsl:attribute></xsl:element> attr_ns=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$attr_ns</xsl:attribute></xsl:element></xsl:element>		
		</xsl:element>
		<xsl:element name="xsl:when">
			<xsl:attribute name="test">$nodeType='node'</xsl:attribute>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">bc</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getPITextStart</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:processing-instruction"><xsl:attribute name="name"><xsl:value-of select="$text_start"/></xsl:attribute><xsl:element name="xsl:value-of"><xsl:attribute name="select">$bc</xsl:attribute></xsl:element></xsl:element>
		</xsl:element>	
		<xsl:element name="xsl:otherwise"></xsl:element>
	</xsl:element>
	<xsl:copy>
		<xsl:apply-templates select="@*|node()" />
	</xsl:copy>			
	<xsl:element name="xsl:choose">
		<xsl:element name="xsl:when">
			<xsl:attribute name="test">$nodeType='attribute'</xsl:attribute>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">bc</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrID</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">attr_name</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrName</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">attr_ns</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getAttrNS</xsl:attribute></xsl:element></xsl:element>			
			<xsl:element name="xsl:processing-instruction"><xsl:attribute name="name"><xsl:value-of select="$attr_end"/></xsl:attribute>id=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$bc</xsl:attribute></xsl:element> attr=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$attr_name</xsl:attribute></xsl:element> attr_ns=<xsl:element name="xsl:value-of"><xsl:attribute name="select">$attr_ns</xsl:attribute></xsl:element></xsl:element>		
		</xsl:element>
		<xsl:element name="xsl:when">
			<xsl:attribute name="test">$nodeType='node'</xsl:attribute>
			<xsl:element name="xsl:variable"><xsl:attribute name="name">bc</xsl:attribute><xsl:element name="xsl:apply-templates"><xsl:attribute name="select">$path</xsl:attribute><xsl:attribute name="mode">getPITextEnd</xsl:attribute></xsl:element></xsl:element>
			<xsl:element name="xsl:processing-instruction"><xsl:attribute name="name"><xsl:value-of select="$text_end"/></xsl:attribute><xsl:element name="xsl:value-of"><xsl:attribute name="select">$bc</xsl:attribute></xsl:element></xsl:element>
		</xsl:element>	
		<xsl:element name="xsl:otherwise"></xsl:element>
	</xsl:element>	
	</xsl:element>
	</xsl:when>
	<xsl:otherwise>
		<xsl:copy>
			<xsl:apply-templates select="@*|node()" />
		</xsl:copy>	
	</xsl:otherwise>
	</xsl:choose>
</xsl:template>


</xsl:stylesheet>
