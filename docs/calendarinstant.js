/* Instantiated calendars 
*/
import {isoWeek, MilesianCalendar, JulianCalendar, WesternCalendar, FrenchRevCalendar} from "./calendars.js";
import pldrDOM from "./pldr.js";

const 
	milesian = new MilesianCalendar ("milesian",pldrDOM), // A Milesian calendar with pldr data.
	julian = new JulianCalendar ("julian"),	// An instantied Julian calendar, no pldr
	vatican = new WesternCalendar ("vatican", "1582-10-15"),
	french = new WesternCalendar ("french", "1582-12-20"),
	german = new WesternCalendar ("german", "1700-03-01"),
	english = new WesternCalendar ("english","1752-09-14"),
	frenchRev = new FrenchRevCalendar ("frenchrev"),
	calendars = [milesian, julian, vatican, french, german, english, frenchRev];

export {calendars, milesian, julian, vatican, french, german, english, frenchRev};
