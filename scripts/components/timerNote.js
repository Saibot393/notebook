import {cModuleName, Translate, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cTimeInputs = ["d", "h", "m", "s"];

const cZeroSplit = {ms : 0, s : 0, m : 0, h : 0, d : 0, sgn : 1}

const cPlayIcon = "fa-play";
const cStopIcon = "fa-pause";
const cUpIcon = "fa-rotate-right";
const cDownIcon = "fa-rotate-left";
const cNowIcon = "fa-circle-dot";

export class timerNote extends basicNote {
	get type() {
		return "timer";
	}
	
	get icon() {
		return "fa-clock";
	}
	
	get windowedAMH() {
		return false;
	}
	
	get windowOptions() {
		return {
			...super.windowOptions,
			resizable: false,
			height: 50 + 30
		}
	}
	
	get defaultContent() {
		return {
			running : false,
			offset : 0,
			basetime : undefined,
			direction : 1,
			lastsplit : cZeroSplit
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
		return this.content.basetime ?? this.now;
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
		let vSplit = {...this.timeSplit, ...pSplit};
		
		this.time = summSplit(vSplit);
		this.updateContent({lastsplit : vSplit})
	}
	
	get lastSplit() {
		return this.content.lastsplit;
	}
	
	get direction() {
		return Math.sign(this.content.direction);
	}
	
	set direction(pDirection) {
		this.updateContent({direction : Number(pDirection)});
	}
	
	get hasSound() {
		return true;
	}
	
	renderContent() {
		let vTimerDIV = document.createElement("div");
		vTimerDIV.style.display = "flex";
		vTimerDIV.style.flexDirection = "row";
		
		let vTimeDIV = document.createElement("div");
		vTimeDIV.style.flexDirection = "row";
		vTimeDIV.style.display = "flex";
		vTimeDIV.style.color = this.primeColor;
		vTimeDIV.style.fontSize = "40px";
		vTimeDIV.style.flexGrow = "1";
		
		let vStyleInput = (pInput) => {
			pInput.type = "number";
			pInput.style.color = this.primeColor;
			pInput.style.width = "60px";
			pInput.style.height = "40px";
			pInput.style.border = "0px";
			pInput.style.borderRadius = "";
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
		vDayInput.setAttribute("data-tooltip", Translate("Titles.days"));
		
		let vSpacer1 = document.createElement("div");
		vSpacer1.style.flexGrow = "1";
		vSpacer1.style.width = "0px";
		
		let vMinus = document.createElement("div");
		vMinus.innerHTML = "-";
		vMinus.style.margin = "auto";
		vMinus.onclick = (pEvent) => {
			if (pEvent.shiftKey) {
				if (this.canEdit && this.time < 0) {
					this.time = -this.time;
				}
			}
		}
		
		let vHourInput = document.createElement("input");
		vStyleInput(vHourInput);
		
		let vHourSeperator = document.createElement("div");
		vHourSeperator.innerHTML = ":";
		vHourSeperator.style.margin = "auto";
		vHourSeperator.style.transform = "translateY(-5px)";
		
		let vMinuteInput = document.createElement("input");
		vStyleInput(vMinuteInput);
		
		let vMinuteSeperator = document.createElement("div");
		vMinuteSeperator.innerHTML = ":";
		vMinuteSeperator.style.margin = "auto";
		vMinuteSeperator.style.transform = "translateY(-5px)";
		
		let vSecondInput = document.createElement("input");
		vStyleInput(vSecondInput);
		
		let vSpacer2 = document.createElement("div");
		vSpacer2.style.flexGrow = "1";
		
		vSpacer1.appendChild(vDayInput);
		
		vTimeDIV.appendChild(vSpacer1);
		vTimeDIV.appendChild(vMinus);
		vTimeDIV.appendChild(vHourInput);
		vTimeDIV.appendChild(vHourSeperator);
		vTimeDIV.appendChild(vMinuteInput);
		vTimeDIV.appendChild(vMinuteSeperator);
		vTimeDIV.appendChild(vSecondInput);
		vTimeDIV.appendChild(vSpacer2);
		
		let vSettingsDIV = document.createElement("div");
		vSettingsDIV.style.display = "flex";
		vSettingsDIV.style.flexDirection = "column";
		vSettingsDIV.style.color = this.primeColor;
		vSettingsDIV.style.textAlign = "center";
		vSettingsDIV.style.marginRight = "2px";
		
		let vReverse = document.createElement("i");
		vReverse.classList.add("fa-solid");
		vReverse.onclick = () => {
			if (this.canEdit) {
				this.invertDirection(true);
			}
		}
		vReverse.style.flexGrow = "1";
		vReverse.setAttribute("data-tooltip", Translate("Titles.changedirection"));
		registerHoverShadow(vReverse);
		
		let vStartStop = document.createElement("i");
		vStartStop.classList.add("fa-solid");
		vStartStop.onclick = () => {
			if (this.canEdit) {
				this.toggleRunning();
			}
		}
		vStartStop.style.flexGrow = "1";
		registerHoverShadow(vStartStop);
		
		let vNowTime = document.createElement("i");
		vNowTime.classList.add("fa-solid", cNowIcon);
		vNowTime.onclick = () => {
			if (this.canEdit) {
				if (this.direction >= 0) {
					this.time = 0;
				}
				else {
					this.resetCount();
				}
			}
		}
		vNowTime.style.flexGrow = "1";
		vNowTime.setAttribute("data-tooltip", Translate("Titles.reset"));
		registerHoverShadow(vNowTime);
		
		vSettingsDIV.appendChild(vReverse);
		vSettingsDIV.appendChild(vStartStop);
		vSettingsDIV.appendChild(vNowTime);
		
		vTimerDIV.appendChild(vTimeDIV);
		vTimerDIV.appendChild(vSettingsDIV);
		
		this.mainElement.appendChild(vTimerDIV);
		
		this.contentElements.d = vDayInput;
		this.contentElements.h = vHourInput;
		this.contentElements.m = vMinuteInput;
		this.contentElements.s = vSecondInput;
		this.contentElements.hSeperator = vHourSeperator;
		this.contentElements.mSeperator = vMinuteSeperator;
		this.contentElements.minus = vMinus;
		
		for (let vKey of ["d", "h", "m", "s"]) {
			this.contentElements[vKey].onchange = () => {
				this.timeSplit = {[vKey] : Number(this.contentElements[vKey].value)};
			}
			this.contentElements[vKey].onblur = () => {
				this.contentElements[vKey].value = this.timeSplit[vKey];
			}
		}
		
		this.contentElements.reverse = vReverse;
		this.contentElements.startstop = vStartStop;
		this.contentElements.now = vNowTime;
		
		this.contentElements.settings = vSettingsDIV;
		
		//this.updateTime();
		//this.synchTicking();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("basetime") || pContentUpdate.hasOwnProperty("offset")) {
			this.updateTime();
		}

		if (pContentUpdate.hasOwnProperty("running")) {
			if (this.running) {
				this.contentElements.startstop.classList.remove(cPlayIcon);
				this.contentElements.startstop.classList.add(cStopIcon);
				this.start();
			}
			else {
				this.contentElements.startstop.classList.remove(cStopIcon);
				this.contentElements.startstop.classList.add(cPlayIcon);
				this.stop();
			}
		}
		
		if (pContentUpdate.hasOwnProperty("direction")) {
			if (this.direction < 0) {
				this.contentElements.reverse.classList.remove(cUpIcon);
				this.contentElements.reverse.classList.add(cDownIcon);
			}
			else {
				this.contentElements.reverse.classList.remove(cDownIcon);
				this.contentElements.reverse.classList.add(cUpIcon);
			}
		}
	}
	
	updateTime(pRenderTime = true) {
		let vSplit = this.timeSplit;
		
		let vRenderTime = pRenderTime;
		
		if (vSplit.s == 0) {
			vRenderTime = true; //manage tick over
		}
		
		for (let vInput of cTimeInputs) {
			if (!isActiveElement(this.contentElements[vInput])) {
				this.contentElements[vInput].value = vSplit[vInput];
				if (vInput != "d" && this.contentElements[vInput].value.length < 2) {
					this.contentElements[vInput].value = "0" + this.contentElements[vInput].value;
				}
			}
		}
		
		if (vRenderTime) {
			this.renderTime(vSplit);
		}
	}
	
	renderTime(pSplit = undefined) {
		let vSplit = pSplit;
		
		if (!vSplit) {
			vSplit = this.timeSplit;
		}
		
		let vPrevZero = true;
		
		for (let vInput of cTimeInputs) {
			if (!this.isMouseHover && vPrevZero && vSplit[vInput] == 0 && !["s", "m"].includes(vInput)) {
				this.contentElements[vInput].style.display = "none";
				if (this.contentElements[vInput + "Seperator"]) {
					this.contentElements[vInput + "Seperator"].style.display = "none";
				}
			}
			else {
				this.contentElements[vInput].style.display = "";
				if (this.contentElements[vInput + "Seperator"]) {
					this.contentElements[vInput + "Seperator"].style.display = "";
				}
			}
		}
		
		this.contentElements.minus.style.display = (vSplit.sgn < 0 ? "" : "none");
	}
	
	start() {
		if (!this.running) {
			this.soundNotify();
			this.updateContent({running : true, basetime : this.now});
		}
		this.startTick();
	}
	
	stop() {
		if (this.running) {
			this.soundNotify();
			this.updateContent({running : false, offset : this.time});
		}
		this.stopTick();
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
	
	reBase() {
		this.updateContent({basetime : this.now, offset : this.time});
	}
	
	resetCount() {
		this.timeSplit = this.lastSplit;
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
		this.contentElements.settings.style.display = "none";
		for (let vInput of cTimeInputs) {
			this.contentElements[vInput].disabled = true;
		}
		this.contentElements.minus.removeAttribute("data-tooltip");
	}
	
	enable() {
		if (this.isMouseHover) {
			this.contentElements.settings.style.display = "flex";
		}
		for (let vInput of cTimeInputs) {
			this.contentElements[vInput].disabled = false;
		}
		this.contentElements.minus.setAttribute("data-tooltip", Translate("Descrp.removeshiftclick"));
	}
	
	onMouseHoverChange() {
		this.renderTime();
		
		if (this.isMouseHover) {
			if (this.canEdit) {
				this.contentElements.settings.style.display = "flex";
			}
		}
		else {
			this.contentElements.settings.style.display = "none";
		}
	}
	
	tick(pTickCount) {
		if (pTickCount%5 == 0) {
			this.updateTime(false);
		}
		//this.ignoreTicks = 5;
	}
	
	round() {
		//called when a round ends
	}
}

function splitTime(pTime) {
	let vLeft = Math.abs(pTime);
	
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
	
	vSplit.sgn = Math.sign(pTime);
	
	return vSplit;
}

function summSplit(pSplit) {
	let vSplit = {...cZeroSplit, ...pSplit};
	
	return pSplit.sgn * (vSplit.ms + 1000 * (vSplit.s + 60 * (vSplit.m + 60 * (vSplit.h + 24 * (vSplit.d)))));
}