/* Fetch a XML resource into a DOM
Charset UTF-8. 
Contents:
	pldr: stringified version of an XML document organising non built-in calendar data for the Unicode tools 
	pldrDOM: a DOM object parsed from pldr.
Notes:
	1. If this file is used for Web site, consider changing "const" to "var" in order to avoid constant redeclaration error,
	2. pldrDOM must be declared after pldr.
	3. With certain CMS, this file could not be exposed as a module. pldrDOM has to be made visible from a web page.
*/
/*Version	M2021-02-13	Build as a Promise, in a similar way to import();
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
Inquiries: www.calendriermilesien.org
*/
"use strict";
/** This function works like import (): it returns a Promise to build a DOM from an XML resource.
*/
export function fetchDOM (XMLResource) {	// This is similar to import () but it builds one DOM from an XML file.
	return new Promise ( (resol, fail) => { 
		try {
			var XMLRequest = new XMLHttpRequest();	// Request object. Cannot be reinitiated. State can be read from another script.
			XMLRequest.addEventListener ("load", // load external file into a DOM parameter that is passed through the callback
				function (event) {
					resol (XMLRequest.responseXML);		
					console.log ("pldr loaded");
				})
			XMLRequest.open("GET", XMLResource);
			XMLRequest.send();
			}
		catch (e) {
			console.error("XMLHttpRequest error ");
			fail (e)
			}
		})
	}
