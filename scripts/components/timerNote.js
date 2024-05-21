import {cModuleName} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cTimeInputs = ["d", "h", "m", "s"];

const cPlayIcon = "fa-play";
const cStopIcon = "fa-pause";
const cUpIcon = "fa-arrow-up";
const cDownIcon = "fa-arrow-down";
const cNowIcon = "fa-circle-dot";

export class timerNote extends basicNote {
	get type() {
		return "timer";
	}
	
	get defaultContent() {
		return {
			running : false,
			offset : 0,
		};
	}
	
	get now() {
		return Date.now();
	}
	
	get running() {
		return this.content.running;
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
		return this.content.offset;
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
		this.time = summSplit({...this.timeSplit, ...pSplit});
	}
	
	get direction() {
		return Math.sign(this.content.direction || 1);
	}
	
	set direction(pDirection) {
		this.updateContent({direction : Number(pDirection)});
	}
	
	renderContent() {
		let vTimeDIV = document.createElement("div");
		vTimeDIV.style.flexDirection = "row";
		vTimeDIV.style.display = "flex";
		vTimeDIV.style.color = "maroon";
		vTimeDIV.style.fontSize = "40px";
		
		let vsmallTimeDIV = document.createElement("div");
		
		let vStyleInput = (pInput) => {
			pInput.type = "number";
			pInput.style.color = "maroon";
			pInput.style.width = "60px";
			pInput.style.height = "40px";
			pInput.style.border = "0px";
			pInput.style.backgroundColor = "rgba(255,255,255,0)";
			pInput.style.margin = "auto";
			pInput.style.textAlign = "center";
			pInput.onfocus = () => {
				pInput.style.width = "2em";
			}
			pInput.onblur = () => {
				pInput.style.width = "60px";
			}
		}
		
		let vDayInput = document.createElement("input");
		vStyleInput(vDayInput);
		vDayInput.style.height = "20px";
		vDayInput.style.width = "2em";
		vDayInput.style.fontSize = "20px";
		vDayInput.style.position = "relative";
		vDayInput.style.textAlign = "left";
		vDayInput.style.top = "-22px";
		vDayInput.onchange = () => {
			this.timeSplit = {d : Number(vDayInput.value)};
		}
		
		let vSpacer1 = document.createElement("div");
		vSpacer1.style.flexGrow = "1";
		vSpacer1.style.width = "0px";
		
		let vHourInput = document.createElement("input");
		vStyleInput(vHourInput);
		vHourInput.onchange = () => {
			this.timeSplit = {h : Number(vHourInput.value)};
		}
		
		let vHourSeperator = document.createElement("div");
		vHourSeperator.innerHTML = ":";
		vHourSeperator.style.margin = "auto";
		vHourSeperator.style.transform = "translateY(-5px)";
		
		let vMinuteInput = document.createElement("input");
		vStyleInput(vMinuteInput);
		vMinuteInput.onchange = () => {
			this.timeSplit = {m : Number(vMinuteInput.value)};
		}
		
		let vMinuteSeperator = document.createElement("div");
		vMinuteSeperator.innerHTML = ":";
		vMinuteSeperator.style.margin = "auto";
		vMinuteSeperator.style.transform = "translateY(-5px)";
		
		let vSecondInput = document.createElement("input");
		vStyleInput(vSecondInput);
		vSecondInput.onchange = () => {
			this.timeSplit = {s : Number(vSecondInput.value)};
		}
		
		let vSpacer2 = document.createElement("div");
		vSpacer2.style.flexGrow = "1";
		
		vSpacer1.appendChild(vDayInput);
		
		vTimeDIV.appendChild(vSpacer1);
		vTimeDIV.appendChild(vHourInput);
		vTimeDIV.appendChild(vHourSeperator);
		vTimeDIV.appendChild(vMinuteInput);
		vTimeDIV.appendChild(vMinuteSeperator);
		vTimeDIV.appendChild(vSecondInput);
		vTimeDIV.appendChild(vSpacer2);
		
		let vSettingsDIV = document.createElement("div");
		
		this.mainElement.appendChild(vTimeDIV);
		this.mainElement.appendChild(vSettingsDIV);
		
		this.contentElements.d = vDayInput;
		this.contentElements.h = vHourInput;
		this.contentElements.m = vMinuteInput;
		this.contentElements.s = vSecondInput;
		this.contentElements.hSeperator = vHourSeperator;
		this.contentElements.mSeperator = vMinuteSeperator;
		
		this.contentElements.settings = vSettingsDIV;
		
		//this.updateTime();
		this.synchTicking();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("basetime") || pContentUpdate.hasOwnProperty("offset")) {
			this.updateTime();
		}
	}
	
	updateTime(pRenderTime = true) {
		let vSplit = this.timeSplit;
		
		for (let vInput of cTimeInputs) {
			this.contentElements[vInput].value = vSplit[vInput];
		}
		
		if (pRenderTime) {
			this.renderTime(vSplit);
		}
	}
	
	renderTime(pSplit = undefined) {
		let vSplit = pSplit;
		
		if (!vSplit) {
			vSplit = this.timeSplit;
		}
		
		let vPrevZero = false;
		
		for (let vInput of cTimeInputs) {
			if (!this.isMouseHover && vPrevZero && vSplit[vInput] == 0 && vInput != "s") {
				this.contentElements[vInput].style.display = "none";
				if (this.contentElements[vInput + "Seperator"]) {
					this.contentElements[vInput + "Seperator"].style.display = "none";
				}
			}
			else {
				vPrevZero = vInput == "d";
				this.contentElements[vInput].style.display = "";
				if (this.contentElements[vInput + "Seperator"]) {
					this.contentElements[vInput + "Seperator"].style.display = "";
				}
			}
		}
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
		this.renderTime();
	}
	
	tick() {
		//tick every 100ms for time dependent stuff
		//make sure to set _hastick or overwrite hastick()
	}
	
	round() {
		//called when a round ends
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