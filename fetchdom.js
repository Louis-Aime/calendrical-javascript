/** Fetch an XML resource and make a Document out of it.
 * @module
 * @version M2022-08-06
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
// Charset UTF-8.
/* Version	M2022-11-12	Enhance comments
	M2022-08-06	Enhance JSdoc comments
*/
"use strict";
/** This function works the same as import (), but the imported XML resource is a document object in the sense of DOM.
 * @static
 * @function fetchDOM
 * @param {String} XMLResource - the URL of the fetched resource.
 * @param {Number} timeout - the timeout passed to XMLHttpRequest in ms; default is 0, meaning no timeout.
 * @return {Promise} The parameter of the resolution function is the document corresponding to the fetched resource,
 * the parameter of the failure function is the error message. 
*/
export default function fetchDOM (XMLResource, timeout = 0) {
	return new Promise ( (resol, fail) => { 
		var XMLRequest = new XMLHttpRequest();	// Request object. Cannot be reinitiated. State can be read from another script.
		XMLRequest.addEventListener ("loadend", // load external file into the Document parameter of the callback function
			function (event) {
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
