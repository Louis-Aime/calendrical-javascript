/** a Private Locale Data Repository stored as a string, with its DOM parser.
 * @module
 * @version M2022-07-22
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
// Charset UTF-8. This file contains non-ANSI characters.
/* Version	M2022-08-06 3 eras for 'gregory' calendars
*/
"use strict";
/** Stringified XML base, consisting in 2 blocks: 
 * ldmlBCP47 declares non language specific calendar elements, 
 * ldml declares language specific names; 
 * in this stringified version, ldml block is empty.
 * If this file is used for a Web site and not as a module, consider changing "const" to "var" in order to avoid redeclaration errors.
*/
const pldrstring =
'<?xml version="1.0" encoding="UTF-8" ?>\
<!-- Private Locale Data Repository (PLDR) -->\
<!-- <!DOCTYPE ldmlBCP47 SYSTEM "../../common/dtd/ldmlBCP47.dtd"> -->\
<pldr>\
<ldmlBCP47>\
  <calendar type="gregory">\
	<eras>\
		<eraNames>\
			<era type="0" draft="unconfirmed">ante Christo</era>\
			<era type="1" draft="unconfirmed">computo Julii</era>\
			<era type="2" draft="unconfirmed">computo Gregorii</era>\
		</eraNames>\
		<eraAbbr>\
			<era type="0" draft="unconfirmed">A. C.</era>\
			<era type="1" draft="unconfirmed">C. J.</era>\
			<era type="2" draft="unconfirmed">C. G.</era>\
		</eraAbbr>\
		<eraNarrow>\
			<era type="0" draft="unconfirmed">AC</era>\
			<era type="1" draft="unconfirmed">CJ</era>\
			<era type="2" draft="unconfirmed">CG</era>\
		</eraNarrow>\
	</eras>	\
  </calendar>\
<calendar type="milesian"> \
	<months>\
	<monthContext type="format">\
	<default type="abbreviated"/> <!-- Is it necessary ? -->\
		<monthWidth type="wide">\
			<month type="1" draft="unconfirmed">⁨unemis⁩</month>\
			<month type="2" draft="unconfirmed">⁨secundemis⁩</month>\
			<month type="3" draft="unconfirmed">⁨tertemis⁩</month>\
			<month type="4" draft="unconfirmed">⁨quartemis⁩</month>\
			<month type="5" draft="unconfirmed">⁨quintemis⁩</month>\
			<month type="6" draft="unconfirmed">⁨sextemis⁩</month>\
			<month type="7" draft="unconfirmed">⁨septemis⁩</month>\
			<month type="8" draft="unconfirmed">⁨octemis⁩</month>\
			<month type="9" draft="unconfirmed">⁨novemis⁩</month>\
			<month type="10" draft="unconfirmed">⁨decemis⁩</month>\
			<month type="11" draft="unconfirmed">⁨undecemis⁩</month>\
			<month type="12" draft="unconfirmed">⁨duodecemis⁩</month>\
		</monthWidth>\
		<monthWidth type="abbreviated"> <!-- short international explicit notation -->\
			<month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			 <month type="3" draft="unconfirmed">⁨3m⁩</month>\
			 <month type="4" draft="unconfirmed">⁨4m⁩</month>\
			 <month type="5" draft="unconfirmed">⁨5m⁩</month>\
			 <month type="6" draft="unconfirmed">⁨6m⁩</month>\
			 <month type="7" draft="unconfirmed">⁨7m⁩</month>\
			 <month type="8" draft="unconfirmed">⁨8m⁩</month>\
			 <month type="9" draft="unconfirmed">⁨9m⁩</month>\
			 <month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
		<monthWidth type="narrow"> <!-- unambiguous coding system with only one letter -->\
			 <month type="1" draft="unconfirmed">⁨P⁩</month>\
			 <month type="2" draft="unconfirmed">⁨S⁩</month>\
			 <month type="3" draft="unconfirmed">⁨T⁩</month>\
			 <month type="4" draft="unconfirmed">⁨C⁩</month>\
			 <month type="5" draft="unconfirmed">⁨Q⁩</month>\
			 <month type="6" draft="unconfirmed">⁨X⁩</month>\
			 <month type="7" draft="unconfirmed">⁨E⁩</month>\
			 <month type="8" draft="unconfirmed">⁨O⁩</month>\
			 <month type="9" draft="unconfirmed">⁨N⁩</month>\
			 <month type="10" draft="unconfirmed">⁨D⁩</month>\
			 <month type="11" draft="unconfirmed">⁨U⁩</month>\
			 <month type="12" draft="unconfirmed">⁨Z⁩</month>\
		</monthWidth>\
		<monthWidth type="numeric"> 	<!-- under "format" type, i.e. with compound date string, "numeric" width is like "abbreviated" -->	\
			 <month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			 <month type="3" draft="unconfirmed">⁨3m⁩</month>\
			 <month type="4" draft="unconfirmed">⁨4m⁩</month>\
			 <month type="5" draft="unconfirmed">⁨5m⁩</month>\
			 <month type="6" draft="unconfirmed">⁨6m⁩</month>\
			 <month type="7" draft="unconfirmed">⁨7m⁩</month>\
			 <month type="8" draft="unconfirmed">⁨8m⁩</month>\
			 <month type="9" draft="unconfirmed">⁨9m⁩</month>\
			 <month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
	</monthContext>\
	<monthContext type="stand-alone">\
		<default type="abbreviated"/>\
		<monthWidth type="wide">\
			<month type="1" draft="unconfirmed">⁨unemis⁩</month>\
			<month type="2" draft="unconfirmed">⁨secundemis⁩</month>\
			<month type="3" draft="unconfirmed">⁨tertemis⁩</month>\
			<month type="4" draft="unconfirmed">⁨quartemis⁩</month>\
			<month type="5" draft="unconfirmed">⁨quintemis⁩</month>\
			<month type="6" draft="unconfirmed">⁨sextemis⁩</month>\
			<month type="7" draft="unconfirmed">⁨septemis⁩</month>\
			<month type="8" draft="unconfirmed">⁨octemis⁩</month>\
			<month type="9" draft="unconfirmed">⁨novemis⁩</month>\
			<month type="10" draft="unconfirmed">⁨decemis⁩</month>\
			<month type="11" draft="unconfirmed">⁨undecemis⁩</month>\
			<month type="12" draft="unconfirmed">⁨duodecemis⁩</month>\
		</monthWidth>\
		 <monthWidth type="abbreviated">\
			 <month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			<month type="3" draft="unconfirmed">⁨3m⁩</month>\
			<month type="4" draft="unconfirmed">⁨4m⁩</month>\
			<month type="5" draft="unconfirmed">⁨5m⁩</month>\
			<month type="6" draft="unconfirmed">⁨6m⁩</month>\
			<month type="7" draft="unconfirmed">⁨7m⁩</month>\
			<month type="8" draft="unconfirmed">⁨8m⁩</month>\
			<month type="9" draft="unconfirmed">⁨9m⁩</month>\
			<month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
		<monthWidth type="narrow"> <!-- same unambiguous coding system with only one letter -->\
			 <month type="1" draft="unconfirmed">⁨P⁩</month>\
			 <month type="2" draft="unconfirmed">⁨S⁩</month>\
			 <month type="3" draft="unconfirmed">⁨T⁩</month>\
			 <month type="4" draft="unconfirmed">⁨C⁩</month>\
			 <month type="5" draft="unconfirmed">⁨Q⁩</month>\
			 <month type="6" draft="unconfirmed">⁨X⁩</month>\
			 <month type="7" draft="unconfirmed">⁨E⁩</month>\
			 <month type="8" draft="unconfirmed">⁨O⁩</month>\
			 <month type="9" draft="unconfirmed">⁨N⁩</month>\
			 <month type="10" draft="unconfirmed">⁨D⁩</month>\
			 <month type="11" draft="unconfirmed">⁨U⁩</month>\
			 <month type="12" draft="unconfirmed">⁨Z⁩</month>\
		</monthWidth>\
		</monthContext>\
	</months>\
	<quarters>\
	  <quarterContext type="format">\
		 <quarterWidth type="abbreviated">\
			 <quarter type="1" draft="unconfirmed">⁨T1m⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨T2m⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨T3m⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨T4m⁩</quarter>\
		</quarterWidth>\
		<quarterWidth type="wide">\
			 <quarter type="1" draft="unconfirmed">⁨primum spatium trimestre⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨secundum spatium trimestre⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨tertium spatium trimestre⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨quartum spatium trimestre⁩</quarter>\
		</quarterWidth>\
	  </quarterContext>\
	  <quarterContext type="stand-alone">\
		 <quarterWidth type="abbreviated">\
			 <quarter type="1" draft="unconfirmed">⁨T1m⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨T2m⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨T3m⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨T4m⁩</quarter>\
		</quarterWidth>\
		<quarterWidth type="wide">\
			 <quarter type="1" draft="unconfirmed">⁨primo spatio trimestre⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨secundo spatio trimestre⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨tertio spatio trimestre⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨quarto spatio trimestre⁩</quarter>\
		</quarterWidth>\
	  </quarterContext>\
	</quarters>\
  </calendar>\
</ldmlBCP47>\
<!-- Here starts the ldml part - language-specific -->\
<ldml></ldml>\
</pldr>'

/** build a document object from the pldrstring object of this file.
 * @function getPldrDOM
 * @return the link to the document object that holds the private locale data repository's data.
 * @static
*/
export default function getPldrDOM () { return new DOMParser().parseFromString(pldrstring, "application/xml")};
