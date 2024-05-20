import {cModuleName} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {cNoteToggleFlag} from "../MainUI.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class templateNote extends basicNote {
	get type() {
		return "template";
	}
	
	onMouseHoverChange() {
		
	}
	
	renderContent() {
		//specific implementations required
		//this.content
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		//called when the content updates
	}
	
	disable() {
		//disable all inputs
	}
	
	enable() {
		//enable all inputs
	}
	
	tick() {
		//tick every 100ms for time dependent stuff
		//make sure to set _hastick or overwrite hastick()
	}
	
	round() {
		//called when a round ends
	}
	
	applyFilter(pFilter) {
		
	}
}