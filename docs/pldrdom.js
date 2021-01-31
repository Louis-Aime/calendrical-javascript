/* pldr.js  Private Locale Data Register as a DOM that can be accessed from the global scope.
Charset UTF-8. 
Contents:
	pldrDOM: a DOM object obtained from an external resource
Uses:
	fetchdom
Notes:
	This file (used with fetchdom) is a variant to pldr.js, that constructs pldrDOM from a string.
*/
/* Version	M2021-02-13	Build as a Promise, in a similar way to import();
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
Inquiries: www.calendriermilesien.org
*/
"use strict";

var pldrDOM;

import ('./fetchdom.js')
	.then ( (module) => module.fetchDOM ("https://louis-aime.github.io/Milesian-calendar/pldr.xml") )
		.then ( (value) => {pldrDOM = value}, (error) => {console.error(error)} );
