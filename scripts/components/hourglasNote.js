//INTERNAL - for this module
import {cModuleName, isActiveElement, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cTimeInputs = ["d", "h", "m", "s"];

const cZeroSplit = {ms : 0, s : 0, m : 0, h : 0, d : 0, sgn : 1}

const cPlayIcon = "fa-play";
const cStopIcon = "fa-pause";
const cResetIcon = "fa-hourglass-start";

const cNumber = "0123456789";
const cSeperator = ":";

const cGlassWidth = 120;
const cGlassHeight = cGlassWidth*1.5;
const cGlasResolution = 15; //number of draw points
const cLineWidth = 4;

const cyMax = Math.tan(1);
let vCurve = (py) => {return Math.atan(py/cGlasResolution * cyMax)}

export class hourglasNote extends basicNote {
	get icon() {
		return "fa-hourglass";
	}
	
	get defaultContent() {
		return {
			running : false,
			offset : 0,
			basetime : undefined,
			maxtime : 0,
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
	
	get maxtime() {
		return this.content.maxtime ?? 0;
	}
	
	set maxtime(pMaxTime) {
		this.updateContent({maxtime : Number(pMaxTime)});
	}
	
	get maxtimesplit() {
		return splitTime(this.maxtime);
	}
	
	set maxtimesplit(pSplit) {
		let vSplit = {...this.maxtimesplit, ...pSplit};
		
		this.maxtime = summSplit(vSplit);
	}
	
	get offset() {
		return this.content.offset;
	}
	
	set offset(pOffset) {
		this.updateContent({offset : Number(pOffset)});
	}
	
	get time() {
		if (this.running) {
			return (this.now - this.basetime) + this.offset;
		}
		else {
			return this.offset;
		}
	}
	
		
	get fillStand() {
		return Math.min(1, Math.max(0, this.time/this.maxtime));
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
	
	get hasSound() {
		return true;
	}
	
	renderContent() {
		let vHGDIV = document.createElement("div");
		vHGDIV.style.display = "flex";
		
		let vSpacer1 = document.createElement("div");
		vSpacer1.style.flexGrow = 1;
		
		let vProgressDIV = document.createElement("div");
		vProgressDIV.style.height = cGlassHeight + "px";
		vProgressDIV.style.width = cGlassWidth + "px";
		vProgressDIV.style.position = "relative";
		
		let vSand = document.createElement("canvas");
		vSand.style.height = cGlassHeight + "px";
		vSand.style.width = cGlassWidth + "px";
		vSand.height = cGlassHeight;
		vSand.width = cGlassWidth;
		vSand.style.position = "absolute";
		
		let vGlass = document.createElement("canvas");
		vGlass.style.height = cGlassHeight + "px";
		vGlass.style.width = cGlassWidth + "px";
		vGlass.height = cGlassHeight;
		vGlass.width = cGlassWidth;
		vGlass.style.position = "absolute";
		
		vProgressDIV.appendChild(vSand);
		vProgressDIV.appendChild(vGlass);
		
		let vSpacer2 = document.createElement("div");
		vSpacer2.style.flexGrow = 1;
		
		let vSettingDIV = document.createElement("div");
		vSettingDIV.style.width = "auto";
		vSettingDIV.style.height = "auto";
		vSettingDIV.style.padding = "0.1px";
		vSettingDIV.style.flexDirection = "row";
		vSettingDIV.style.display = "flex";
		
		let vSettingBar = document.createElement("div");
		vSettingBar.style.backgroundColor = this.primeColor;
		vSettingBar.style.visibility = "hidden";
		vSettingBar.style.width = "5px";
		vSettingBar.style.height = "50px";
		vSettingBar.style.borderRadius = "5px";
		vSettingBar.style.margin = "auto";
		vSettingBar.style.marginLeft = "";
		vSettingBar.style.marginRight = "3px";
		
		let vSettingContentDIV = document.createElement("div");
		vSettingContentDIV.style.width = "auto";
		vSettingContentDIV.style.height = "auto";
		vSettingContentDIV.style.display = "flex";
		vSettingContentDIV.style.flexDirection = "column";
		vSettingContentDIV.style.margin = "auto";
		vSettingContentDIV.style.color = this.primeColor;
		vSettingContentDIV.style.textAlign = "center";
		vSettingContentDIV.style.display = "none";
		
		let vMaxTimeLabel  = document.createElement("label");
		vMaxTimeLabel.innerHTML = Translate("Titles.maxtime") + ":";
		vMaxTimeLabel.style.margin = "3px";
		vMaxTimeLabel.style.marginBottom = "0px";
		
		let vMaxTimeInput = document.createElement("input");
		vMaxTimeInput.type = "text";
		vMaxTimeInput.style.color = this.primeColor;
		vMaxTimeInput.style.backgroundColor = "rgba(255,255,255,0)";
		vMaxTimeInput.style.flexGrowth = "1";
		vMaxTimeInput.style.border = "2px";
		vMaxTimeInput.style.borderStyle = "solid"
		vMaxTimeInput.style.borderRadius = "0";
		vMaxTimeInput.style.margin = "3px";
		vMaxTimeInput.oninput = () => {
			this.maxtime = Number(vMaxTimeInput.value);
		}
		
		let vTimeLabel  = document.createElement("label");
		vTimeLabel.innerHTML = Translate("Titles.time") + ":";
		vTimeLabel.style.margin = "3px";
		vTimeLabel.style.marginBottom = "0px";
		
		let vTimeInput = document.createElement("input");
		vTimeInput.type = "text";
		vTimeInput.style.color = this.primeColor;
		vTimeInput.style.backgroundColor = "rgba(255,255,255,0)";
		vTimeInput.style.flexGrowth = "1";
		vTimeInput.style.border = "2px";
		vTimeInput.style.borderStyle = "solid"
		vTimeInput.style.borderRadius = "0";
		vTimeInput.style.margin = "3px";
		vTimeInput.oninput = () => {
			this.maxtime = Number(vTimeInput.value);
		}
		
		let vIconDIV = document.createElement("div");
		vIconDIV.style.width = "auto";
		vIconDIV.style.height = "auto";
		vIconDIV.style.display = "flex";
		vIconDIV.style.flexDirection = "row";
		vIconDIV.margin = "auto";
		
		let vStartStop = document.createElement("i");
		vStartStop.classList.add("fa-solid");
		vStartStop.style.margin = "3px";
		vStartStop.onclick = () => {
			if (this.canEdit) {
				this.toggleRunning();
			}
		}
		vStartStop.style.flexGrow = "1";
		registerHoverShadow(vStartStop);
		
		let vReset = document.createElement("i");
		vReset.classList.add("fa-solid", cResetIcon);
		vReset.style.margin = "3px";
		vReset.style.flexGrow = "1";
		registerHoverShadow(vReset);
		
		vIconDIV.appendChild(vStartStop);
		vIconDIV.appendChild(vReset);
		
		vSettingContentDIV.appendChild(vMaxTimeLabel);
		vSettingContentDIV.appendChild(vMaxTimeInput);
		vSettingContentDIV.appendChild(vTimeLabel);
		vSettingContentDIV.appendChild(vTimeInput);
		vSettingContentDIV.appendChild(vIconDIV);
		
		vSettingDIV.onmouseenter = () => {
			if (this.canEdit) {
				vSettingContentDIV.style.display = "flex";
			}
		}
		vSettingDIV.onmouseleave = () => {
			vSettingContentDIV.style.display = "none";
		}
		
		vSettingDIV.appendChild(vSettingBar);
		vSettingDIV.appendChild(vSettingContentDIV);
		
		vHGDIV.appendChild(vSpacer1);
		vHGDIV.appendChild(vProgressDIV);
		vHGDIV.appendChild(vSpacer2);
		vHGDIV.appendChild(vSettingDIV);
		
		this.mainElement.appendChild(vHGDIV);
		
		this.contentElements.HG = vHGDIV;
		this.contentElements.Progress = vProgressDIV;
		this.contentElements.Sand = vSand;
		this.contentElements.Glass = vGlass;
		this.contentElements.settings = vSettingDIV;
		this.contentElements.settingbar = vSettingBar;
		this.contentElements.startstop = vStartStop;
		this.contentElements.reset = vReset;
		
		this.renderGlas();
		this.renderSand();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate, pContext) {
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
		this.renderSand();
	}
	
	renderGlas() {
		let vDrawer = this.contentElements.Glass.getContext("2d");
		
		vDrawer.clearRect(0, 0, cGlassWidth, cGlassHeight);
		
		vDrawer.strokeStyle = this.primeColor;
		vDrawer.lineWidth = cLineWidth;
		
		for (let vLine = 0; vLine<=1; vLine = vLine + 1) {
			let vYHeight = cLineWidth + vLine * (cGlassHeight - 2 * cLineWidth);
			
			vDrawer.beginPath();
			vDrawer.moveTo(cGlassWidth - cLineWidth, vYHeight);
			vDrawer.lineTo(0 + cLineWidth, vYHeight);
			vDrawer.stroke();
			vDrawer.beginPath();
			
			for (let i = -cGlasResolution; i<=cGlasResolution; i++) {
				let vx = vCurve(i) * (cGlassWidth/2 - cLineWidth);
				
				let vy = i/cGlasResolution * (cGlassHeight/2 - cLineWidth);
				
				if (vLine == 0) vy = - vy;
				
				vDrawer.lineTo(cGlassWidth/2 + vx, cGlassHeight/2 + vy);
			}
			
			vDrawer.stroke();
		}
	}
	
	renderSand() {
		let vDrawer = this.contentElements.Sand.getContext("2d");
		
		vDrawer.clearRect(0, 0, cGlassWidth, cGlassHeight);
		
		vDrawer.fillStyle = this.secondColor;
		
		for (let vLine = 0; vLine<=1; vLine = vLine + 1) {
			let vYHeight = cLineWidth + vLine * (cGlassHeight - 2 * cLineWidth);
			
			let vPolygon = [];
			
			switch (vLine) {
				case 0:
					for (let i = cGlasResolution * (1-this.fillStand); i<=cGlasResolution + 1; i++) {
						let vx = vCurve(i) * (cGlassWidth/2 - cLineWidth);
						
						let vy = i/cGlasResolution * (cGlassHeight/2 - cLineWidth);
						
						vPolygon.push({x : vx, y : vy});
					}
					break;
				case 1:
					for (let i = 0; i<=cGlasResolution * (1 - this.fillStand); i++) {
						let vx = vCurve(i) * (cGlassWidth/2 - cLineWidth);
						
						let vy = -i/cGlasResolution * (cGlassHeight/2 - cLineWidth);
						
						vPolygon.push({x : vx, y : vy});
					}
					break;
			}
			
			vDrawer.beginPath();
			
			vPolygon.forEach(pPoint => vDrawer.lineTo(cGlassWidth/2 + pPoint.x, cGlassHeight/2 + pPoint.y));
			vPolygon = vPolygon.reverse();
			vPolygon.forEach(pPoint => vDrawer.lineTo(cGlassWidth/2 -pPoint.x, cGlassHeight/2 + pPoint.y));
			
			vDrawer.fill();
		}
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
	
	disable() {
		//REQUIRED
		//disable all inputs
	}
	
	enable() {
		//REQUIRED
		//enable all inputs
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover) {
			if (this.canEdit) {
				this.contentElements.settingbar.style.visibility = "visible";
			}
		}
		else {
			this.contentElements.settingbar.style.visibility = "hidden";
		}
	}
	
	onTickChange() {
		//OPTIONAL
		//called when tick changes (this.hasTick);
	}
	
	tick(pTickCount) {
		this.renderSand();
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
	
	if (vSplit.sgn == 0) {
		vSplit.sgn = 1;
	}
	
	return vSplit;
}

function summSplit(pSplit) {
	let vSplit = {...cZeroSplit, ...pSplit};
	
	return pSplit.sgn * (vSplit.ms + 1000 * (vSplit.s + 60 * (vSplit.m + 60 * (vSplit.h + 24 * (vSplit.d)))));
}