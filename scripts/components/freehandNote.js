import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class freehandNote extends basicNote {
	static get displayType() {
		//OPTIONAL (only necessary if type is not added to notebooks translation name space)
		return Translate("Titles.notesTypes." + this.type);
	}
	
	get displayType() {
		//OPTIONAL (only necessary if type is not added to notebooks translation name space)
		return Translate("Titles.notesTypes." + this.type);
	}
	
	onready() {
		//OPTIONAL
		//called when the note is rendered and ready for use, e.g. used to on hooks
	}
	
	get defaultContent() {
		//RECOMMENDED
		//return default content
		return {}; 
	}
	
	get icon() {
		//RECOMMENDED
		//unique icon from fonts awesome for this note type (can also be array)
		return "fa-note-sticky";
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
		//this.mainElement
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
	
	onclose() {
		//OPTIONAL
		//called when the note is closed, e.g. used to off hooks
	}
}