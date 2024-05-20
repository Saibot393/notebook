import {cModuleName} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class templateNote extends basicNote {
	get type() {
		return "template";
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

function splitTime(pTime) {
	let vLeft = pTime;
	
	let vSplit = {};
	
	vSplit.ms = vLeft%1000;
	vLeft = Math.floor(vLeft/1000);
	
	vSplit.s = vLeft%60;
	vLeft = Math.floor(vLeft/60);
	
	vSplit.m = vLeft%60;
	vLeft = Math.floor(vLeft/60);
	
	vSplit.h = vLeft%24;
	vLeft = Math.floor(vLeft/24);
	
	vSplit.d = vLeft;
	
	return vSplit;
}

function summSplit(pSplit) {
	let vSplit = {ms : 0, s : 0, m : 0, h : 0, d : 0, ...pSplit};
	
	return vSplit.ms + 1000 * (vSplit.s + 60 * (vSplit.m + 60 * (vSplit.h + 24 * (vSplit.d))));
}