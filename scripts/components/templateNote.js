import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class templateNote extends basicNote {
	get type() {
		return "template";
	}
	
	get defaultContent() {
		return {}; //return default content
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
	
	onMouseHoverChange() {
		//used to change note content size when mouse hovers in (check this.isMouseHover)
	}
	
	onTickChange() {
		//called when tick changes (this.hasTick);
	}
	
	tick(pTickCount) {
		//tick every 100ms for time dependent stuff
		//make sure to set _hastick or overwrite hastick()
	}
	
	round() {
		//called when a round ends
	}
}