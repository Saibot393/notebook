import {cModuleName, isActiveElement, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cClockSize = 120;
const cLineWidth = 4;
const cSegmentColor = "indianred";

export class progressclockNote extends basicNote {
	get icon() {
		return "fa-chart-pie";
	}
	
	get windowedAMH() {
		return false;
	}
	
	static get windowOptions() {
		return {
			...super.windowOptions,
			resizable: {
				resizeX : true,
				resizeY : false
			},
			height: cClockSize + 30,
			width: Math.max(cClockSize + 130, 257)
		}
	}
	
	get defaultContent() {
		return {
			value : 0,
			max : 4
		}; 
	}
	
	get value() {
		return this.content.value;
	}
	
	set value(pValue) {
		this.updateContent({value : Math.min(this.max, Math.max(0, Number(pValue)))});
	}
	
	get max() {
		return this.content.max;
	}
	
	set max(pMax) {
		this.updateContent({max : Math.max(2, Number(pMax))});
	}
	
	get hasSound() {
		return true;
	}
	
	renderContent() {
		let vPClockDIV = document.createElement("div");
		vPClockDIV.style.display = "flex";
		vPClockDIV.style.flexDirection = "row";
		
		let vSpacer1 = document.createElement("div");
		vSpacer1.style.flexGrow = 1;
		
		let vProgressDIV = document.createElement("div");
		vProgressDIV.style.height = cClockSize + "px";
		vProgressDIV.style.width = cClockSize + "px";
		vProgressDIV.style.position = "relative";
		
		let vPattern = document.createElement("canvas");
		vPattern.style.height = cClockSize + "px";
		vPattern.style.width = cClockSize + "px";
		vPattern.height = cClockSize;
		vPattern.width = cClockSize;
		vPattern.style.position = "absolute";
		vPattern.onclick = (pEvent) => {
			if (this.canEdit) {
				let vx = pEvent.layerX - cClockSize/2;
				let vy = -(pEvent.layerY - cClockSize/2);
				
				let vSegment = this.xytoSegment(vx, vy);
				if (vSegment) {
					this.toggleAt(vSegment);
				}
			}
		}
		vPattern.oncontextmenu = (pEvent) => {
			if (this.canEdit) {
				let vx = pEvent.layerX - cClockSize/2;
				let vy = -(pEvent.layerY - cClockSize/2);
				
				let vSegment = this.xytoSegment(vx, vy);
				if (vSegment) {
					this.detoggleAt(vSegment);
				}
			}
		}
		vPattern.onmousewheel = (pEvent) => {
			if (this.canEdit && pEvent.shiftKey) {
				pEvent.stopPropagation();
				
				this.value = this.value + Math.sign(pEvent.wheelDelta);
			}
		}
		
		vProgressDIV.appendChild(vPattern);
		
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
		vSettingContentDIV.style.color = this.primeColor;
		vSettingContentDIV.style.textAlign = "center";
		
		let vStepLabel  = document.createElement("label");
		vStepLabel.innerHTML = Translate("Titles.segments") + ":";
		vStepLabel.style.margin = "auto";
		vStepLabel.style.marginLeft = "3px";
		vStepLabel.style.marginRight = "3px";
		vStepLabel.style.marginBottom = "";
		
		let vMaxInput = document.createElement("input");
		vMaxInput.type = "number";
		vMaxInput.style.maxWidth = "50px";
		vMaxInput.style.margin = "auto";
		vMaxInput.style.marginTop = "3px";
		vMaxInput.style.border = "0px";
		vMaxInput.style.borderRadius = "0";
		vMaxInput.onchange = () => {
			this.max = vMaxInput.value;
		}
		
		vSettingContentDIV.appendChild(vStepLabel);
		vSettingContentDIV.appendChild(vMaxInput);
		
		vSettingDIV.appendChild(vSettingBar);
		vSettingDIV.appendChild(vSettingContentDIV);
		
		vSettingContentDIV.style.display = "none";
		vSettingDIV.onmouseenter = () => {
			if (this.canEdit) {
				vSettingContentDIV.style.display = "flex";
			}
		}
		vSettingDIV.onmouseleave = () => {
			vSettingContentDIV.style.display = "none";
		}
		
		vPClockDIV.appendChild(vSpacer1);
		vPClockDIV.appendChild(vProgressDIV);
		vPClockDIV.appendChild(vSpacer2);
		vPClockDIV.appendChild(vSettingDIV);
		
		this.mainElement.appendChild(vPClockDIV);
		
		this.contentElements.progress = vProgressDIV;
		this.contentElements.pattern = vPattern;
		this.contentElements.segments = [];
		this.contentElements.settings = vSettingDIV;
		this.contentElements.settingbar = vSettingBar;
		this.contentElements.max = vMaxInput;
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("max")) {
			this.renderPattern();
			this.renderSegments();
			this.contentElements.max.value = this.max;
		}
		
		if (pContentUpdate.hasOwnProperty("value")) {
			this.renderSegments();
		}
	}
	
	renderClock() {
		this.renderPattern();
		
		this.renderSegments();
	}
	
	renderPattern() {
		let vDrawer = this.contentElements.pattern.getContext("2d");
		
		let vSegmentAngle = 2 * Math.PI / this.max;
		
		vDrawer.clearRect(0, 0, cClockSize, cClockSize);
		
		vDrawer.beginPath();
		vDrawer.arc(cClockSize/2, cClockSize/2, cClockSize/2 - cLineWidth, 0, 2 * Math.PI);
		vDrawer.lineWidth = 4;
		vDrawer.strokeStyle = this.primeColor;
		vDrawer.stroke();
		
		for (let i = 0; i < this.max; i++) {
			vDrawer.beginPath();
			vDrawer.moveTo(cClockSize/2, cClockSize/2);
			vDrawer.lineWidth = 4;
			vDrawer.strokeStyle = this.primeColor;
			vDrawer.lineTo(cClockSize/2 + (cClockSize/2 - cLineWidth) * Math.sin(i * vSegmentAngle), cClockSize/2 - (cClockSize/2 - cLineWidth) * Math.cos(i * vSegmentAngle));
			vDrawer.stroke();
		}

		for (let i = 0; i < this.max; i++) {
			if (!this.contentElements.segments[i]) {
				let vSegment = document.createElement("canvas");
				vSegment.style.height = cClockSize + "px";
				vSegment.style.width = cClockSize + "px";
				vSegment.height = cClockSize;
				vSegment.width = cClockSize;
				vSegment.style.position = "absolute";
				
				this.contentElements.progress.prepend(vSegment);
				
				this.contentElements.segments[i] = vSegment;
			}

			vDrawer = this.contentElements.segments[i].getContext("2d");
			vDrawer.clearRect(0, 0, cClockSize, cClockSize);
			vDrawer.beginPath();
			vDrawer.lineWidth = 4;
			vDrawer.fillStyle = cSegmentColor;
			vDrawer.arc(cClockSize/2, cClockSize/2, cClockSize/2 - cLineWidth, i * vSegmentAngle - Math.PI/2, (i+1) * vSegmentAngle - Math.PI/2);
			vDrawer.fill();
			
			vDrawer.beginPath();
			vDrawer.fillStyle = cSegmentColor;
			vDrawer.moveTo(cClockSize/2, cClockSize/2);
			vDrawer.lineTo(cClockSize/2 + (cClockSize/2 - cLineWidth/2) * Math.sin(i * vSegmentAngle), cClockSize/2 - (cClockSize/2 - cLineWidth/2) * Math.cos(i * vSegmentAngle));
			vDrawer.lineTo(cClockSize/2 + (cClockSize/2 - cLineWidth/2) * Math.sin((i+1) * vSegmentAngle), cClockSize/2 - (cClockSize/2 - cLineWidth/2) * Math.cos((i+1) * vSegmentAngle));
			vDrawer.lineTo(cClockSize/2, cClockSize/2);
			vDrawer.fill();
		}
		
		while (this.contentElements.segments.length > this.max) {
			let vElement = this.contentElements.segments.pop();
			vElement?.remove();
		}
	}
	
	toggleAt(pAt) {
		if (pAt == this.value) {
			this.value = this.value - 1;
		}
		else {
			this.value = pAt;
		}
	}
	
	detoggleAt(pAt) {
		if (pAt <= this.value) {
			this.value = pAt - 1;
		}
		else {
			this.value = pAt;
		}
	}
	
	renderSegments() {
		for (let i = 0; i < this.max; i++) {
			this.contentElements.segments[i].style.display = i < this.value ? "" : "none";
		}
		
		this.soundNotify();
	}
	
	xytoSegment(px, py) {
		if (Math.sqrt(px**2 + py**2) < cClockSize/2) {
			let vAngle = Math.atan((px/py));
			
			if (py <= 0) {
				vAngle = vAngle + Math.PI;
			}
			
			if (vAngle < 0) {
				vAngle = vAngle + 2 * Math.PI;
			}
			
			return Math.ceil(vAngle / (2 * Math.PI/this.max));
		}
		
		return 0;
	}
	
	disable() {
		this.contentElements.max.disabled = true;
	}
	
	enable() {
		this.contentElements.max.disabled = false;
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
}