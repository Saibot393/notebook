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
		this._oncombatRoundID = Hooks.on("combatRound", () => {this.onCombatRound()})
	}
	
	get type() {
		return "roundcounter";
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
		
		let vReverse = document.createElement("i");
		vReverse.classList.add("fa-solid");
		vReverse.onclick = () => {
			if (this.canEdit) {
				this.invertDirection();
			}
		}
		vReverse.style.flexGrow = "1";
		vReverse.setAttribute("data-tooltip", Translate("Titles.changedirection"));
		registerHoverShadow(vReverse);
		
		vRoundDIV.appendChild(vCount);
		vRoundDIV.appendChild(vReverse);
		
		this.mainElement.appendChild(vRoundDIV);
		
		this.contentElements.count = vCount;
		this.contentElements.reverse = vReverse;
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
		//REQUIRED
		//disable all inputs
	}
	
	enable() {
		//REQUIRED
		//enable all inputs
	}
	
	onMouseHoverChange() {
		//OPTIONAL
		//used to change note content size when mouse hovers in (check this.isMouseHover)
	}
	
	onCombatRound() {
		if(this.isPrimeEditor) {
			this.change(this.direction);
		}
	}	
	
	onclose() {
		console.log("closed");
		Hooks.off("combatRound", this._oncombatRoundID);
	}
}