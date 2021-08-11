/* Fetch a XML resource into a DOM
Charset UTF-8. 
Contents:
	function fetchDOM, returns a Promise object - fetches an XML file into a DOM.
*/
/* Version	M2021-08-21	Handle all error cases in a similar way, setting the error variable to the error code.
	M2021-07-22	make a module.
	M2021-02-13	Build as a Promise, in a similar way to import(), and not embbeded as a module.
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
Inquiries: https://github.com/Louis-Aime
*/
"use strict";
/** This function works like import (): it returns a Promise to build a DOM from an XML resource.
*/
export default function fetchDOM (XMLResource, timeout = 0) {	// This is similar to import () but it builds one DOM from an XML file.
	return new Promise ( (resol, fail) => { 
		var XMLRequest = new XMLHttpRequest();	// Request object. Cannot be reinitiated. State can be read from another script.
		XMLRequest.addEventListener ("loadend", // load external file into a DOM parameter that is passed through the callback
			function (event) {
				// console.log ("fetchDOM result code: " + XMLRequest.status + ", resource: "+ XMLResource);
				if (XMLRequest.responseXML != null) { resol (XMLRequest.responseXML) }
				else fail ("fetchDOM result code: " + XMLRequest.status + ", resource: "+ XMLResource) ;
			})
		XMLRequest.addEventListener ("error", 
			function (event) {
				fail ("XMLHttpRequest error on resource: " + XMLResource)
			})
		XMLRequest.addEventListener ("abort", 
			function (event) {
				fail ("XMLHttpRequest abort on resource: " + XMLResource)
			})
		XMLRequest.addEventListener ("timeout", 
			function (event) {
				fail ("XMLHttpRequest timeout on resource: " + XMLResource)
			})
		if (timeout != 0) XMLRequest.timeout = timeout;
		XMLRequest.open("GET", XMLResource);
		XMLRequest.send();
		})
	}
