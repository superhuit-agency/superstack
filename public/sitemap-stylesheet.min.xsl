<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:xhtml="http://www.w3.org/1999/xhtml">
<xsl:output method="html" indent="yes" encoding="UTF-8"/>

<xsl:template match="/">
<xsl:variable name="sitemap_loc" select="sitemap:sitemapindex/sitemap:sitemap/sitemap:loc"/>
<xsl:variable name="sitemap_loc_slash" select="substring-after($sitemap_loc,'://')"/>
<xsl:variable name="url_loc" select="sitemap:urlset/sitemap:url/sitemap:loc"/>
<xsl:variable name="url_loc_slash" select="substring-after($url_loc,'://')"/>

<html><head><title><xsl:choose>
<xsl:when test="sitemap:sitemapindex/sitemap:sitemap/sitemap:loc">Index for <xsl:value-of select="substring-before($sitemap_loc_slash,'/')"/></xsl:when>
<xsl:when test="sitemap:urlset/sitemap:url/sitemap:loc and substring-before($url_loc_slash,'/')!=''">Sitemap for <xsl:value-of select="substring-before($url_loc_slash,'/')"/></xsl:when>
<xsl:when test="sitemap:urlset/sitemap:url/sitemap:loc">Sitemap for <xsl:value-of select="$url_loc_slash"/></xsl:when>
<xsl:otherwise>Sitemap</xsl:otherwise>
</xsl:choose></title>
<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"/>
<style>
/*!
 * Bootstrap v4.1.3 (https://getbootstrap.com/)
 * Copyright 2011-2018 The Bootstrap Authors
 * Copyright 2011-2018 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
:root{--breakpoint-xs:0;--breakpoint-sm:576px;--breakpoint-md:768px;--breakpoint-lg:992px;--breakpoint-xl:1200px;--font-family-sans-serif:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-family-monospace:SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}*,::after,::before{box-sizing:border-box}
html{font-family:sans-serif;line-height:1.15;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;-ms-overflow-style:scrollbar;-webkit-tap-highlight-color:transparent}@-ms-viewport{width:device-width}nav{display:block}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-size:1rem;font-weight:400;line-height:1.5;color:#212529;text-align:left;background-color:#fff}
h1,h2,h3,h4,h5,h6{margin-top:0;margin-bottom:.5rem}
p{margin-top:0;margin-bottom:1rem}
b,strong{font-weight:bolder}
small{font-size:80%}
a{color:#007bff;text-decoration:none;background-color:transparent;-webkit-text-decoration-skip:objects}
a:hover{color:#0056b3;text-decoration:underline}table{border-collapse:collapse}th{text-align:inherit}
.h1,.h2,.h3,.h4,.h5,.h6,h1,h2,h3,h4,h5,h6{margin-bottom:.5rem;font-family:inherit;font-weight:500;line-height:1.2;color:inherit}
.h1,h1{font-size:2.5rem}.h2,h2{font-size:2rem}.h3,h3{font-size:1.75rem}.h4,h4{font-size:1.5rem}.h5,h5{font-size:1.25rem}.h6,h6{font-size:1rem}.small,small{font-size:80%;font-weight:400}
.container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}@media (min-width:576px){.container{max-width:540px}}@media (min-width:768px){.container{max-width:720px}}@media (min-width:992px){.container{max-width:960px}}@media (min-width:1200px){.container{max-width:1140px}}
.container-fluid{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}.row{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;margin-right:-15px;margin-left:-15px}.no-gutters{margin-right:0;margin-left:0}
.no-gutters>.col,.no-gutters>[class*=col-]{padding-right:0;padding-left:0}.col,.col-1,.col-10,.col-11,.col-12,.col-2,.col-3,.col-4,.col-5,.col-6,.col-7,.col-8,.col-9,.col-auto,.col-lg,.col-lg-1,.col-lg-10,.col-lg-11,.col-lg-12,.col-lg-2,.col-lg-3,.col-lg-4,.col-lg-5,.col-lg-6,.col-lg-7,.col-lg-8,.col-lg-9,.col-lg-auto,.col-md,.col-md-1,.col-md-10,.col-md-11,.col-md-12,.col-md-2,.col-md-3,.col-md-4,.col-md-5,.col-md-6,.col-md-7,.col-md-8,.col-md-9,.col-md-auto,.col-sm,.col-sm-1,.col-sm-10,.col-sm-11,.col-sm-12,.col-sm-2,.col-sm-3,.col-sm-4,.col-sm-5,.col-sm-6,.col-sm-7,.col-sm-8,.col-sm-9,.col-sm-auto,.col-xl,.col-xl-1,.col-xl-10,.col-xl-11,.col-xl-12,.col-xl-2,.col-xl-3,.col-xl-4,.col-xl-5,.col-xl-6,.col-xl-7,.col-xl-8,.col-xl-9,.col-xl-auto{position:relative;width:100%;min-height:1px;padding-right:15px;padding-left:15px}
.col-12{-ms-flex:0 0 100%;flex:0 0 100%;max-width:100%}.table{width:100%;margin-bottom:1rem;background-color:transparent}.table td,.table th{padding:.75rem;vertical-align:top;border-top:1px solid #dee2e6}
.table thead th{vertical-align:bottom;border-bottom:2px solid #dee2e6}.table tbody+tbody{border-top:2px solid #dee2e6}.table .table{background-color:#fff}.table-sm td,.table-sm th{padding:.3rem}
.table-responsive{display:block;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;-ms-overflow-style:-ms-autohiding-scrollbar}.collapse:not(.show){display:none}
.breadcrumb{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;padding:.75rem 1rem;margin-bottom:1rem;list-style:none;background-color:#e9ecef;border-radius:.25rem}
.breadcrumb-item+.breadcrumb-item{padding-left:.5rem}.breadcrumb-item+.breadcrumb-item::before{display:inline-block;padding-right:.5rem;color:#6c757d;content:"/"}
.breadcrumb-item+.breadcrumb-item:hover::before{text-decoration:underline}.breadcrumb-item+.breadcrumb-item:hover::before{text-decoration:none}
.breadcrumb-item.active{color:#6c757d}.badge{display:inline-block;padding:.25em .4em;font-size:75%;font-weight:700;line-height:1;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.25rem}
.badge:empty{display:none}.badge-primary{color:#fff;background-color:#007bff}.badge-primary[href]:focus,.badge-primary[href]:hover{color:#fff;text-decoration:none;background-color:#0062cc}
.badge-secondary{color:#fff;background-color:#6c757d}.badge-secondary[href]:focus,.badge-secondary[href]:hover{color:#fff;text-decoration:none;background-color:#545b62}
.bg-transparent{background-color:transparent!important}.border{border:1px solid #dee2e6!important}.border-top{border-top:1px solid #dee2e6!important}.border-right{border-right:1px solid #dee2e6!important}
.border-bottom{border-bottom:1px solid #dee2e6!important}.border-left{border-left:1px solid #dee2e6!important}.border-0{border:0!important}.border-top-0{border-top:0!important}
.border-right-0{border-right:0!important}.border-bottom-0{border-bottom:0!important}.border-left-0{border-left:0!important}.m-0{margin:0!important}.mt-0,.my-0{margin-top:0!important}
.mr-0,.mx-0{margin-right:0!important}.mb-0,.my-0{margin-bottom:0!important}.ml-0,.mx-0{margin-left:0!important}.m-1{margin:.25rem!important}.mt-1,.my-1{margin-top:.25rem!important}
.mr-1,.mx-1{margin-right:.25rem!important}.mb-1,.my-1{margin-bottom:.25rem!important}.ml-1,.mx-1{margin-left:.25rem!important}.m-2{margin:.5rem!important}.mt-2,.my-2{margin-top:.5rem!important}
.mr-2,.mx-2{margin-right:.5rem!important}.mb-2,.my-2{margin-bottom:.5rem!important}.ml-2,.mx-2{margin-left:.5rem!important}.m-3{margin:1rem!important}.mt-3,.my-3{margin-top:1rem!important}
.mr-3,.mx-3{margin-right:1rem!important}.mb-3,.my-3{margin-bottom:1rem!important}.ml-3,.mx-3{margin-left:1rem!important}.m-4{margin:1.5rem!important}.mt-4,.my-4{margin-top:1.5rem!important}
.mr-4,.mx-4{margin-right:1.5rem!important}.mb-4,.my-4{margin-bottom:1.5rem!important}.ml-4,.mx-4{margin-left:1.5rem!important}.m-5{margin:3rem!important}.mt-5,.my-5{margin-top:3rem!important}
.mr-5,.mx-5{margin-right:3rem!important}.mb-5,.my-5{margin-bottom:3rem!important}.ml-5,.mx-5{margin-left:3rem!important}.p-0{padding:0!important}.pt-0,.py-0{padding-top:0!important}
.pr-0,.px-0{padding-right:0!important}.pb-0,.py-0{padding-bottom:0!important}.pl-0,.px-0{padding-left:0!important}.p-1{padding:.25rem!important}.pt-1,.py-1{padding-top:.25rem!important}
.pr-1,.px-1{padding-right:.25rem!important}.pb-1,.py-1{padding-bottom:.25rem!important}.pl-1,.px-1{padding-left:.25rem!important}.p-2{padding:.5rem!important}.pt-2,.py-2{padding-top:.5rem!important}
.pr-2,.px-2{padding-right:.5rem!important}.pb-2,.py-2{padding-bottom:.5rem!important}.pl-2,.px-2{padding-left:.5rem!important}.p-3{padding:1rem!important}.pt-3,.py-3{padding-top:1rem!important}
.pr-3,.px-3{padding-right:1rem!important}.pb-3,.py-3{padding-bottom:1rem!important}.pl-3,.px-3{padding-left:1rem!important}.p-4{padding:1.5rem!important}.pt-4,.py-4{padding-top:1.5rem!important}
.pr-4,.px-4{padding-right:1.5rem!important}.pb-4,.py-4{padding-bottom:1.5rem!important}.pl-4,.px-4{padding-left:1.5rem!important}.p-5{padding:3rem!important}.pt-5,.py-5{padding-top:3rem!important}
.pr-5,.px-5{padding-right:3rem!important}.pb-5,.py-5{padding-bottom:3rem!important}.pl-5,.px-5{padding-left:3rem!important}.fixed-top{position:fixed;top:0;right:0;left:0;z-index:1030}
.font-weight-light{font-weight:300!important}.text-muted{color:#6c757d!important}.bg-backdrop{background-color:rgba(255,255,255,.75);background:-webkit-linear-gradient(rgba(255,255,255,.75),#fff);background:-o-linear-gradient(rgba(255,255,255,.75),#fff);background:-moz-linear-gradient(rgba(255,255,255,.75),#fff);background:linear-gradient(rgba(255,255,255,.75),#fff);-webkit-backdrop-filter:blur(5px)}a.text-wrap{word-break:break-all}a:hover{text-decoration:none!important}
.text-monospace{font-family: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;}.float-right{float: right !important;}.badge-light{color: #212529;background-color: #f8f9fa;}
.rounded-0{border-radius: 0 !important;}
</style>
</head>
<body>
	<div class="container-fluid sticky-top mb-3">
		<div class="row">
			<div class="bg-backdrop border border-top-0 border-right-0 border-left-0 col-12 px-0">
				<div class="container">
					<div class="no-gutters row">
						<div class="col-12">
							<nav class="bg-transparent breadcrumb font-weight-light h3 my-0 px-0 pb-2 pt-3 px-md-3 pt-lg-5 rounded-0">
								<a class="breadcrumb-item" href="/">
								<xsl:choose>
									<xsl:when test="sitemap:sitemapindex/sitemap:sitemap/sitemap:loc">Index for <xsl:value-of select="substring-before($sitemap_loc_slash,'/')"/></xsl:when>
									<xsl:when test="sitemap:urlset/sitemap:url/sitemap:loc and substring-before($url_loc_slash,'/')!=''">Sitemap for <xsl:value-of select="substring-before($url_loc_slash,'/')"/></xsl:when>
									<xsl:when test="sitemap:urlset/sitemap:url/sitemap:loc">Sitemap for <xsl:value-of select="$url_loc_slash"/></xsl:when>
									<xsl:otherwise>Sitemap</xsl:otherwise>
									</xsl:choose>
								</a>
								<!-- <xsl:if test="sitemap:urlset/sitemap:url/xhtml:link"><span class="breadcrumb-item text-secondary">links</span></xsl:if>
								<xsl:if test="sitemap:urlset/sitemap:url/news:news"><span class="breadcrumb-item text-secondary">news</span></xsl:if>
								<xsl:if test="sitemap:urlset/sitemap:url/image:image"><span class="breadcrumb-item text-secondary">images</span></xsl:if>
								<xsl:if test="sitemap:urlset/sitemap:url/video:video"><span class="breadcrumb-item text-secondary">videos</span></xsl:if> -->
							</nav>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="container">
		<div class="row no-gutters">
			<div class="col-12 mb-3 pt px-md-3">
				<h1 class="font-weight-light h3 my-0 pb-2 pt">
					<xsl:choose>
						<xsl:when test="count(sitemap:sitemapindex/sitemap:sitemap)&gt;0">This index contains
							<xsl:choose>
								<xsl:when test="count(sitemap:sitemapindex/sitemap:sitemap)&gt;1">
									<xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps
								</xsl:when>
								<xsl:otherwise>one sitemap</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:when test="sitemap:sitemapindex and count(sitemap:sitemapindex/sitemap:sitemap)=0">This index is empty.</xsl:when>
						<xsl:when test="count(sitemap:urlset/sitemap:url)&gt;0">This sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> links</xsl:when>
						<xsl:when test="sitemap:urlset and count(sitemap:urlset/sitemap:url)=0">This sitemap is empty.</xsl:when>
						<xsl:otherwise>Oops! The sitemap is incomplete.</xsl:otherwise>
					</xsl:choose>
				</h1>
				<xsl:apply-templates/>

			</div>
		</div>
	</div>

	<script>
	Array.from(document.querySelectorAll('a[href|="#alt"]')).map(function (el) {
		el.addEventListener('click', function(e){
			e.preventDefault();
			const div = e.target.nextElementSibling;
			div.style.display = div.style.display !== 'block' ? 'block' : 'none';
		})
	});
	</script>
</body>
</html>
</xsl:template>

<xsl:template match="sitemap:sitemapindex">
	<div class="row">
		<div class="col-12 table-responsive">
			<xsl:choose><xsl:when test="count(sitemap:sitemap)&gt;0">
			<table class="table table-sm">
				<thead>
					<tr>
						<th class="border-0" scope="col">#</th>
						<th class="border-0 text-left" scope="col">sitemap</th>
						<xsl:if test="sitemap:sitemap/sitemap:lastmod">
							<th class="border-0 text-left text-truncate" scope="col">last modified</th>
						</xsl:if>
					</tr>
				</thead>
				<tbody>
					<xsl:for-each select="sitemap:sitemap">
						<tr>
							<xsl:variable name="sitemap_loc"><xsl:value-of select="sitemap:loc"/></xsl:variable>
							<xsl:variable name="sitemap_mod"><xsl:value-of select="sitemap:lastmod"/></xsl:variable>
							<xsl:variable name="sitemap_num"><xsl:value-of select="position()"/></xsl:variable>
							<th scope="row"><xsl:value-of select="$sitemap_num"/></th>
							<xsl:choose>
								<xsl:when test="$sitemap_mod!=''">
									<td class="text-monospace">
										<a class="text-wrap" href="{$sitemap_loc}"><xsl:value-of select="$sitemap_loc"/></a>
									</td>
									<td class="text-sm-nowrap">
										<xsl:value-of select="concat(substring($sitemap_mod,0,11),concat(' ',substring($sitemap_mod,12,5)),concat(' ',substring($sitemap_mod,20,6)))"/>
									</td>
								</xsl:when>
							<xsl:otherwise><td class="text-monospace" colspan="2"><a class="text-wrap" href="{$sitemap_loc}"><xsl:value-of select="$sitemap_loc"/></a></td></xsl:otherwise>
							</xsl:choose>
					</tr></xsl:for-each>
				</tbody>
			</table>
			</xsl:when><xsl:otherwise></xsl:otherwise></xsl:choose>
		</div>
	</div>
</xsl:template>


<xsl:template match="sitemap:urlset">
  <div class="row">
    <div class="col-12 table-responsive">
      <xsl:choose>
        <xsl:when test="count(sitemap:url)&gt;0">
          <table class="table table-sm">
            <thead>
              <tr>
                <th class="border-0" scope="col">#</th>
                <th class="border-0 text-left" scope="col">location</th>
                <xsl:if test="sitemap:url/sitemap:changefreq">
                  <th class="border-0 text-left text-truncate" scope="col">frequently</th>
                </xsl:if>
								<th class="border-0 text-left text-truncate">images</th>
                <xsl:if test="sitemap:url/sitemap:lastmod">
                  <th class="border-0 text-left text-truncate" scope="col">modified</th>
                </xsl:if>
                <xsl:if test="sitemap:url/sitemap:priority">
                  <th class="border-0 text-left text-truncate" scope="col">priority</th>
                </xsl:if>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:url">
                <tr>
                  <xsl:variable name="url_num">
                    <xsl:value-of select="position()"/>
                  </xsl:variable>
                  <xsl:variable name="url_freq">
                    <xsl:value-of select="sitemap:changefreq"/>
                  </xsl:variable>
                  <xsl:variable name="url_mod">
                    <xsl:value-of select="sitemap:lastmod"/>
                  </xsl:variable>
                  <xsl:variable name="url_loc">
                    <xsl:value-of select="sitemap:loc"/>
                  </xsl:variable>
                  <xsl:variable name="url_prio">
                    <xsl:value-of select="sitemap:priority"/>
                  </xsl:variable>
                  <xsl:variable name="url_col_loc">
                    <xsl:value-of select="'1'"/>
                  </xsl:variable>
                  <th scope="row">
                    <xsl:value-of select="$url_num"/>
                  </th>
                  <td class="text-monospace" colspan="{$url_col_loc}">
                    <a class="text-wrap" href="{$url_loc}">
                      <xsl:value-of select="$url_loc"/>
                    </a>
                    <xsl:if test="xhtml:link">
                      <a class="mx-2 text-muted" data-toggle="collapse" href="#alt-{$url_num}" role="button" aria-expanded="false" aria-controls="alt-{$url_num}">↴</a>
                      <div aria-labelledby="heading{$url_num}" class="collapse m-0 p-0" data-parent="#accordion" id="alt-{$url_num}">
                        <xsl:apply-templates select="xhtml:link"/>
                      </div>
                    </xsl:if>
                  </td>
									<xsl:if test="sitemap:changefreq">
										<td>
											<xsl:value-of select="$url_freq"/>
										</td>
									</xsl:if>
									<td>
										<xsl:value-of select="count(image:image)"/>
									</td>
                  <td>
                    <xsl:value-of select="concat(substring($url_mod,0,11),concat(' ',substring($url_mod,12,5)),concat(' ',substring($url_mod,20,6)))"/>
                  </td>
									<xsl:if test="sitemap:priority">
										<td>
											<xsl:value-of select="$url_prio"/>
										</td>
									</xsl:if>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
      </xsl:choose>
    </div>
  </div>
</xsl:template>


<xsl:template match="xhtml:link">
    <p class="mb-0">
        <xsl:if test="@hreflang">
            <span class="badge badge-primary float-right rounded-0 small">
                <xsl:value-of select="@hreflang"/>
            </span>
        </xsl:if>
        <xsl:if test="@rel">
            <span class="badge badge-light d-none d-sm-block float-right ml-3 rounded-0 small">
                <xsl:value-of select="@rel"/>
            </span>
        </xsl:if>
        <xsl:variable name="url_loc_alt">
            <xsl:value-of select="@href"/>
        </xsl:variable>
        <a class="text-muted text-wrap" href="{$url_loc_alt}">
            <xsl:value-of select="@href"/>
        </a>
        <xsl:if test="@media">
            <span class="badge badge-warning ml-3 rounded-0">
                <xsl:value-of select="@media"/>
            </span>
        </xsl:if>
    </p>
    <xsl:apply-templates/>
</xsl:template>


<xsl:template match="image:image">
    <xsl:variable name="loc">
        <xsl:value-of select="image:loc"/>
    </xsl:variable>
    <p>
        <strong>Image: </strong>
        <a href="{$loc}">
            <xsl:value-of select="image:loc"/>
        </a>
        <xsl:if test="image:caption">
            <span>
                <xsl:value-of select="image:caption"/>
            </span>
        </xsl:if>
        <xsl:apply-templates/>
    </p>
</xsl:template>


<xsl:template match="video:video">
    <xsl:variable name="loc">
        <xsl:choose>
            <xsl:when test="video:player_loc!=''">
                <xsl:value-of select="video:player_loc"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="video:content_loc"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="thumb_loc">
        <xsl:value-of select="video:thumbnail_loc"/>
    </xsl:variable>
    <p>
        <strong>Video: </strong>
        <a href="{$loc}" class="mr2 link blue">
            <xsl:choose>
                <xsl:when test="video:player_loc!=''">
                    <xsl:value-of select="video:player_loc"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="video:content_loc"/>
                </xsl:otherwise>
            </xsl:choose>
        </a>
        <a href="{$thumb_loc}">thumb</a>
        <xsl:if test="video:title">
            <span>
                <xsl:value-of select="video:title"/>
            </span>
        </xsl:if>
        <xsl:apply-templates/>
    </p>
</xsl:template>


</xsl:stylesheet>
