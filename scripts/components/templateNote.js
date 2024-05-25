import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class templateNote extends basicNote {
	get type() {
		//REQUIRED
		return "template";
	}
	
	get defaultContent() {
		//RECOMMENDED
		return {}; //return default content
	}
	
	get JournalPage() {
		//OPTIONAL
		return null; //get conten for journal pages
	}
	
	get hasSound() {
		//OPTIONAL
		return false;
	}
	
	renderContent() {
		//REQUIRED
		//specific implementations required
		//this.content
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		//REQUIRED
		//called when the content updates
	}
	
	disable() {
		//REQUIRED
		//disable all inputs
	}
	
	enable() {
		//REQUIRED
		//enable all inputs
	}
	
	onMouseHoverChange() {
		//OPTIONAL
		//used to change note content size when mouse hovers in (check this.isMouseHover)
	}
	
	onTickChange() {
		//OPTIONAL
		//called when tick changes (this.hasTick);
	}
	
	tick(pTickCount) {
		//OPTIONAL
		//tick every 100ms for time dependent stuff
		//make sure to set _hastick or overwrite hastick()
	}
	
	round() {
		//OPTIONAL
		//called when a round ends
		//!NOT CURRENTLY IMPLEMENTED!
	}
	
	onclose() {
		//OPTIONAL
		//called when the note is closed, e.g. used to off hooks
	}
}