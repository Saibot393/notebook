import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cNumber = "0123456789";
const cPM = "+-";

const cFastNumber = {
	shift : 5,
	alt : 50
}

export class counterNote extends basicNote {
	get icon() {
		return "fa-hashtag";
	}
	
	get windowOptions() {
		return {
			...super.windowOptions,
			resizable: {
				resizeX : true,
				resizeY : false
			},
			height: 64 + 30
		}
	}
	
	get hasSound() {
		return true;
	}
	
	get defaultContent() {
		return {
			value : 0,
			max : null
		};
	}
	
	get value() {
		return this.content.value;
	}
	
	set value(pValue) {
		this.updateContent({value : Number(pValue)});
	}
	
	get max() {
		return this.content.max ?? Infinity;
	}
	
	set max(pMax) {
		this.updateContent({max : Math.max(0, Number(pMax))});
	}
	
	change(pChange) {
		this.value = Math.max(Math.min(this.value +Number(pChange), this.max), 0)
	}
	
	applyCount(pCount) {
		let vUpdate = {
			value : 0,
			max : null
		};
		
		let vProcessed = pCount.split("/");
		
		if (vProcessed.length == 1) {
			vUpdate.value = Number(vProcessed[0]);
		}
		
		if (vProcessed.length == 2) {
			vUpdate.value = Number(vProcessed[0]);
			vUpdate.max = Number(vProcessed[1]);
		}
		
		if (vUpdate.value == this.value) {
			//special case for smooth double updates
			delete vUpdate.value;
		}
		
		this.updateContent(vUpdate);
	}
	
	renderContent() {
		let vCountDIV = document.createElement("div");
		vCountDIV.style.flexDirection = "row";
		vCountDIV.style.display = "flex";
		vCountDIV.style.color = this.primeColor;
		vCountDIV.style.fontSize = "25px";
		vCountDIV.style.textAlign = "center";
		
		let vMinus = document.createElement("i");
		vMinus.classList.add("fa-solid", "fa-minus");
		vMinus.style.margin = "auto";
		vMinus.onclick = (pEvent) => {
			if (pEvent.ctrlKey) {
				this.value = 0;
			}
			else {
				let vValue = 1;
				
				if (pEvent.shiftKey) {
					vValue = cFastNumber.shift;
				}
				if (pEvent.altKey) {
					vValue = cFastNumber.alt;
				}
				
				this.change(-1 * vValue);
			}
		};
		vMinus.onmousedown = (pEvent) => {
			let vValue = 1;
			
			if (pEvent.shiftKey) {
				vValue = cFastNumber.shift;
			}
			if (pEvent.altKey) {
				vValue = cFastNumber.alt;
			}
			
			this.startAutoCount(-1 * vValue);
		};
		vMinus.onmouseup = () => {
			this.stopAutoCount();
		};
		vMinus.onmouseleave = vMinus.onmouseup;
		vMinus.style.marginLeft = "5px";
		vMinus.style.marginRight = "5px";
		registerHoverShadow(vMinus);
		
		let vCount = document.createElement("input");
		vCount.type = "text";
		vCount.style.width = "auto";
		vCount.style.height = "auto";
		vCount.style.fontSize = "50px";
		vCount.style.color = this.primeColor;
		vCount.style.backgroundColor = "rgba(255,255,255,0)";
		vCount.style.border = "0px";
		vCount.oninput = () => {
			if (vCount.value.length > 0) {
				let vValid = false;
				let vCharacter = vCount.value[vCount.value.length-1];
				let vFirst = vCount.value[0];
				
				if 	(	
						cNumber.includes(vCharacter) ||
						(vCharacter == "/" && vCount.value.indexOf("/") == vCount.value.length-1 && vCount.value.length > 1 && !cPM.includes(vFirst)) ||
						(cPM.includes(vCharacter) && vCount.value.length == 1)
					) {
					vValid = true;
				}
				
				if (!vValid) {
					vCount.value = vCount.value.slice(0, vCount.value.length-1);
				}
			}
		};
		vCount.onchange = () => {
			let vFirst = vCount.value[0];
			
			if (cPM.includes(vFirst)) {
				if (vCount.value.length > 1) {
					let vChange = vCount.value.split("/")[0];
					
					if (!isNaN(vChange)) {
						this.change(vChange);
					}
					else {
						this.updateCounter();
					}
				}
				else {
					this.updateCounter();
				}
			}
			else {
				if (vCount.value.length > 0) {
					this.applyCount(vCount.value);
				}
				else {
					this.updateCounter();
				}
			}
		};
		
		let vPlus = document.createElement("i");
		vPlus.classList.add("fa-solid", "fa-plus");
		vPlus.style.margin = "auto";
		vPlus.onclick = (pEvent) => {
			if (pEvent.ctrlKey) {
				if (this.max < Infinity) {
					this.value = this.max;
				}
			}
			else {
				let vValue = 1;
				
				if (pEvent.shiftKey) {
					vValue = cFastNumber.shift;
				}
				if (pEvent.altKey) {
					vValue = cFastNumber.alt;
				}
				
				this.change(1 * vValue);
			}
		};
		vPlus.onmousedown = (pEvent) => {
			let vValue = 1;
			
			if (pEvent.shiftKey) {
				vValue = cFastNumber.shift;
			}
			if (pEvent.altKey) {
				vValue = cFastNumber.alt;
			}
			
			this.startAutoCount(1 * vValue);
		};
		vPlus.onmouseup = () => {
			this.stopAutoCount();
		};
		vPlus.onmouseleave = vPlus.onmouseup;
		vPlus.style.marginLeft = "5px";
		vPlus.style.marginRight = "5px";
		registerHoverShadow(vPlus);
		
		vCountDIV.appendChild(vMinus);
		vCountDIV.appendChild(vCount);
		vCountDIV.appendChild(vPlus);
		
		this.mainElement.appendChild(vCountDIV);
		
		this.contentElements.count = vCount;
		this.contentElements.minus = vMinus;
		this.contentElements.plus = vPlus;
		//this.updateCounter();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("value") || pContentUpdate.hasOwnProperty("max")) {
			this.updateCounter();
		}
	}
	
	updateCounter() {
		if (this.max < Infinity) {
			this.contentElements.count.value = `${this.value}/${this.max}`;
		}
		else {
			this.contentElements.count.value = `${this.value}`;
		}
		
		if (this.value == 0 || this.value == this.max) {
			this.soundNotify();
		}
	}
	
	disable() {
		this.contentElements.count.disabled = true;
		this.contentElements.plus.style.display = "none";
		this.contentElements.minus.style.display = "none";
	}
	
	enable() {
		this.contentElements.count.disabled = false;
		this.contentElements.plus.style.display = "";
		this.contentElements.minus.style.display = "";
	}
	
	startAutoCount(pValue) {
		this.autoCount = pValue;
		
		this.skipTicks = 4;
		
		this.startTick();
	}
	
	stopAutoCount() {
		this.autoCount = null;
		
		this.stopTick();
	}
	
	tick() {
		this.change(this.autoCount);
	}
	
	onMouseHoverChange() {
		
	}
}