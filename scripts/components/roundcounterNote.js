import {cModuleName, isActiveElement, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cUpIcon = "fa-rotate-right";
const cDownIcon = "fa-rotate-left";

const cNumber = "0123456789";
const cPM = "+-";

export class roundcounterNote extends basicNote {
	onready() {
		if (!this.windowed && Array.from(game.users).filter(vUser => vUser.active).find(vUser => vUser.isGM)?.isSelf) {
			this._oncombatRoundID = Hooks.on("combatRound", () => {this.onCombatRound()})
		}
	}
	
	get type() {
		return "roundcounter";
	}
	
	get icon() {
		return ["fa-clock-rotate-left", "fa-flip-horizontal"];
	}
	
	get windowedAMH() {
		return false;
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
			max : null,
			direction : 1
		};
	}
	
	get hasSound() {
		return true;
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
	
	get direction() {
		return Math.sign(this.content.direction) || 1;
	}
	
	set direction(pDirection) {
		this.updateContent({direction : Number(pDirection)});
	}
	
	renderContent() {
		let vRoundDIV = document.createElement("div");
		vRoundDIV.style.flexDirection = "row";
		vRoundDIV.style.display = "flex";
		vRoundDIV.style.color = this.primeColor;
		vRoundDIV.style.fontSize = "25px";
		vRoundDIV.style.textAlign = "center";
		
		let vSpacer1 = document.createElement("div");
		vSpacer1.style.flexGrow = 1;
		
		let vCount = document.createElement("input");
		vCount.type = "text";
		vCount.style.width = "50%";
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
					this.change(vCount.value);
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
		
		let vSpacer2 = document.createElement("div");
		vSpacer2.style.flexGrow = 1;
		vSpacer2.style.width = "0px";
		
		let vSettingDIV = document.createElement("div");
		vSettingDIV.style.width = "fit-content";
		vSettingDIV.style.height = "100%";
		vSettingDIV.style.padding = "0.1px";
		vSettingDIV.style.flexDirection = "row";
		vSettingDIV.style.display = "flex";
		vSettingDIV.style.justifyContent = "right";
		vSettingDIV.style.marginLeft = "auto";
		
		let vSettingBar = document.createElement("div");
		vSettingBar.style.backgroundColor = this.primeColor;
		vSettingBar.style.visibility = "hidden";
		vSettingBar.style.width = "5px";
		vSettingBar.style.height = "35px";
		vSettingBar.style.borderRadius = "5px";
		vSettingBar.style.margin = "auto";
		vSettingBar.style.marginLeft = "";
		vSettingBar.style.marginRight = "3px";
		
		let vSettingContentDIV = document.createElement("div");
		vSettingContentDIV.style.width = "30px";
		vSettingContentDIV.style.height = "100%";
		vSettingContentDIV.style.display = "flex";
		vSettingContentDIV.style.flexDirection = "column";
		vSettingContentDIV.style.color = this.primeColor;
		vSettingContentDIV.style.textAlign = "center";
		
		let vReverse = document.createElement("i");
		vReverse.classList.add("fa-solid");
		vReverse.onclick = () => {
			if (this.canEdit) {
				this.invertDirection();
			}
		}
		vReverse.setAttribute("data-tooltip", Translate("Titles.changedirection"));
		vReverse.style.marginBottom = "auto";
		vReverse.style.marginTop = "auto";
		registerHoverShadow(vReverse);
		
		vSettingContentDIV.appendChild(vReverse);
		
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
		
		vSpacer2.appendChild(vSettingDIV);
		
		vRoundDIV.appendChild(vSpacer1);
		vRoundDIV.appendChild(vCount);
		//vRoundDIV.appendChild(vReverse);
		vRoundDIV.appendChild(vSpacer2);
		
		this.mainElement.appendChild(vRoundDIV);
		
		this.contentElements.count = vCount;
		this.contentElements.reverse = vReverse;
		this.contentElements.settingbar = vSettingBar;
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("value") || pContentUpdate.hasOwnProperty("max")) {
			this.updateCounter();
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
	
	invertDirection() {
		this.direction = -this.direction;
	}
	
	disable() {
		this.contentElements.count.disabled = true;
	}
	
	enable() {
		this.contentElements.count.disabled = false;
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
	
	onCombatRound() {
		//if(this.isPrimeEditor) {
		this.change(this.direction);
		//}
	}	
	
	onclose() {
		if (this._oncombatRoundID) Hooks.off("combatRound", this._oncombatRoundID);
	}
}