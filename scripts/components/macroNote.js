import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

/*
{
    "type": "Macro",
    "uuid": "Macro.ZZWGVHnZ8sjHvDKA",
    "slot": "10"
}
*/

const cMacroSize = 50; //px
const cMacroMargin = 10; //px

export class macroNote extends basicNote {
	onready() {
		this._onupdatemacroID = Hooks.on("updateMacro", (pMacro, pUpdate) => {
			let vIndexes = this.indexofUuid(pMacro.uuid);
			
			for (let vIndex of vIndexes) {
				this.updateMacro(vIndex);
			}
		});
		this._ondeletemacroID = Hooks.on("deleteMacro", (pMacro) => {
			if (this.isPrimeEditor) {
				this.validateUuids();
			}
		})
	}
	
	get icon() {
		return "fa-code";
	}
	
	get windowedAMH() {
		return false;
	}
	
	get defaultContent() {
		return {macrouuids : []};
	}
	
	get macrouuids() {
		return [...this.content.macrouuids];
	}
	
	set macrouuids(pMacroUuids) {
		return this.updateContent({macrouuids : pMacroUuids});
	}
	
	get length() {
		return this.content.macrouuids.length;
	}
	
	renderContent() {
		let vListDIV = document.createElement("div");
		vListDIV.style.overflowY = "auto";
		vListDIV.style.width = "100%";
		vListDIV.style.height = "100%";
		vListDIV.style.display = "flex";
		vListDIV.style.flexWrap = "wrap";
		vListDIV.style.padding = (cMacroMargin - 2) + "px"; //-2 to prevent scroll bar from appearing prematurely
		vListDIV.style.justifyContent = "center";
		vListDIV.ondrop = (pEvent) => {
			if (this.canEdit) {
				let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
				
				if (vDropData?.type == "Macro" && vDropData?.uuid && vDropData?.macroNoteID != this.id) {
					this.addMacro(vDropData.uuid);
				}
			}
		}
		
		let vPlus = document.createElement("i");
		vPlus.classList.add("fa-solid", "fa-plus");
		vPlus.style.margin = "auto";
		vPlus.onclick = (pEvent) => {
			ui.macros.renderPopout(true);
		};
		registerHoverShadow(vPlus);
		vPlus.style.fontSize = "25px";
		vPlus.style.color = this.primeColor;
		
		this.contentElements.list = vListDIV;
		this.contentElements.plus = vPlus;
		this.contentElements.listElements = [];
		
		this.renderList();
		
		this.mainElement.appendChild(vListDIV);
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("macrouuids")) {
			this.renderList();
		}
	}
	
	renderList() {
		let vElementLength = this.length + 1;//this.canEdit ? this.length + 1 : this.length;
		
		for (let i = 0; i < vElementLength; i++) {
			if (!this.contentElements.listElements[i]) {
				this.contentElements.listElements[i] = document.createElement("div");
				this.contentElements.listElements[i].style.width = cMacroSize + "px";
				this.contentElements.listElements[i].style.height = cMacroSize + "px";
				this.contentElements.listElements[i].style.margin = cMacroMargin + "px";
				this.contentElements.listElements[i].style.textAlign = "center";
				this.contentElements.listElements[i].style.backgroundSize = "contain";
				this.contentElements.listElements[i].style.display = "flex";
				this.contentElements.listElements[i].style.flexDirection = "column";
				this.contentElements.listElements[i].style.borderColor = this.primeColor;
				
				this.contentElements.list.appendChild(this.contentElements.listElements[i]);
			}
		}
		
		for (let i = 0; i < vElementLength; i++) {
			this.updateMacro(i);
		}
		
		while (this.contentElements.listElements.length > vElementLength) {
			this.contentElements.listElements[this.contentElements.listElements.length - 1].remove();
			this.contentElements.listElements.pop();
		}
	}
	
	updateMacro(pIndex) {
		let vElement = this.contentElements.listElements[pIndex];
		
		if (pIndex < this.length) {
			let vMacro = fromUuidSync(this.macrouuids[pIndex]);
			
			if (vMacro) {
				vElement.style.display = "flex";
				vElement.style.backgroundImage = `url("${vMacro.img}")`;
				vElement.style.borderRadius = "5px";
				//vElement.style.borderColor = "#181818";
				vElement.style.borderStyle = "solid";
				vElement.draggable = true;
				vElement.oncontextmenu = (pEvent) => {
					if (pEvent.shiftKey) {
						if (this.canEdit) {
							this.removeMacro(pIndex);
						}
					}
					else {
						vMacro.sheet.render(true);
					}
				}
				vElement.onclick = () => {
					vMacro.execute({triggeringNote : this});
				}
				vElement.ondragstart = (pEvent) => {
					pEvent.dataTransfer.setData("text/plain", JSON.stringify({
						type : "Macro",
						uuid : vMacro.uuid,
						macroNoteID : this.id,
						index : pIndex
					}));
				};
				vElement.ondrop = (pEvent) => {
					pEvent.stopPropagation();
					if (this.canEdit) {
						let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
						
						if (vDropData?.type == "Macro" && vDropData?.uuid) {
							if (vDropData?.macroNoteID != this.id) {
								this.setMacro(pIndex, vDropData.uuid);
							}
							else {
								this.switchMacros(pIndex, vDropData.index);
							}
						}
					}
				}
			}
			else {
				if (this.isPrimeEditor && !this.windowed) this.removeMacro(pIndex);
			}
		}
		else {
			vElement.style.display = (this.canEdit && this.isMouseHover) ? "flex" : "none";
			vElement.appendChild(this.contentElements.plus);
			vElement.style.backgroundImage = ``;
			vElement.style.borderRadius = "10px";
			vElement.style.borderStyle = "dashed";
			vElement.draggable = false;
			vElement.oncontextmenu = this.contentElements.plus.oncontextmenu;
			vElement.onclick = this.contentElements.plus.onclick;
			vElement.ondragstart = null;
			this.contentElements.addelement = vElement;
		}
	}
	
	removeMacro(pIndex) {
		this.macrouuids = [...this.macrouuids.slice(0, pIndex), ...this.macrouuids.slice(pIndex + 1, this.length)];
	}
	
	addMacro(pUuid) {
		this.macrouuids = [...this.macrouuids, pUuid];
	}
	
	setMacro(pIndex, pUuid) {
		if (pIndex < this.length && pIndex >= 0) {
			let vUuids = this.macrouuids;
			vUuids[pIndex] = pUuid;
			this.macrouuids = vUuids;
		}
	}
	
	switchMacros(pIndexA, pIndexB) {
		if (Math.max(pIndexA, pIndexB) < this.length && Math.min(pIndexA, pIndexB) >= 0) {
			let vUuids = this.macrouuids;
			let vBuffer = vUuids[pIndexA];
			vUuids[pIndexA] = vUuids[pIndexB];
			vUuids[pIndexB] = vBuffer;
			this.macrouuids = vUuids;
		}
	}
	
	indexofUuid(pUuid) {
		let vIndexes = [];
		
		for (let vIndex in this.macrouuids) {
			if (this.macrouuids[vIndex] == pUuid) {
				vIndexes.push(vIndex);
			}
		}
		
		return vIndexes;
	}
	
	validateUuids() {
		this.macrouuids = this.macrouuids.filter(vUuuid => fromUuidSync(vUuuid));
	}
	
	disable() {
		if (this.contentElements.addelement) this.contentElements.addelement.style.display = "none";
	}
	
	enable() {
		if (this.isMouseHover) {
			if (this.contentElements.addelement) this.contentElements.addelement.style.display = "flex";
		}
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover) {
			if (this.canEdit) {
				if (this.contentElements.addelement) this.contentElements.addelement.style.display = "flex";
			}
			if (!this.windowed) {
				this.contentElements.list.style.maxHeight = this.largeHeightLimit;
			}
		}
		else {
			if (this.contentElements.addelement) this.contentElements.addelement.style.display = "none";
			
			if (!this.windowed) {
				this.contentElements.list.style.maxHeight = this.smallHeightLimit;
			}
		}
	}
	
	onclose() {
		if (this._onupdatemacroID) Hooks.off("updateMacro", this._onupdatemacroID);
		if (this._ondeletemacroID) Hooks.off("deleteMacro", this._ondeletemacroID);
	}
}