import {cModuleName} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class templateNote extends basicNote {
	get type() {
		return "template";
	}
	
	get now() {
		return Date.now();
	}
	
	get running() {
		return this.content.running != undefined ? this.content.running : false;
	}
	
	set running(pRunning) {
		this.updateContent({running : pRunning});
	}
	
	get basetime() {
		return this.content.basetime || this.now;
	}
	
	set basetime(pBaseTime) {
		this.updateContent({basetime : Number(pBaseTime)});
	}
	
	get offset() {
		return this.content.offset || 0;
	}
	
	set offset(pOffset) {
		this.updateContent({offset : Number(pOffset)});
	}
	
	get time() {
		if (this.running) {
			return this.direction * (this.now - this.basetime) + this.offset;
		}
		else {
			return this.offset;
		}
	}
	
	set time(pTime) {
		this.updateContent({basetime : this.now, offset : Number(pTime)});
	}
	
	get timeSplit() {
		return splitTime(this.time);
	}
	
	set timeSplit(pSplit) {
		this.time = summSplit(pSplit);
	}
	
	get direction() {
		return Math.sign(this.content.direction || 1);
	}
	
	set direction(pDirection) {
		this.updateContent({direction : Number(pDirection)});
	}
	
	renderContent() {
		//specific implementations required
		//this.content
		this.synchTicking();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		//called when the content updates
	}
	
	start() {
		if (!this.running) {
			this.updateContent({running : true, basetime : this.now});
			this.startTick();
		}
	}
	
	stop() {
		if (this.running) {
			this.updateContent({running : true, offset : this.time});
			this.stopTick();
		}
	}
	
	toggleRunning() {
		if (this.running) {
			this.stop();
		}
		else {
			this.start();
		}
	}
	
	invertDirection(pKeepCurrent = false) {
		if (!pKeepCurrent) {
			this.direction = -this.direction;
		}
		else {
			this.updateContent({direction : -this.direction, offset : this.time, basetime : this.now});
		}
	}
	
	updateBaseTime() {
		this.updateContent({basetime : this.now, offset : this.time});
	}
	
	synchTicking() {
		if (this.running) {
			this.startTick();
		}
		else {
			this.stopTick();
		}
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