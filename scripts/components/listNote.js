import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class listNote extends basicNote {
	get type() {
		return "list";
	}
	
	get list() {
		return this.content.list || [{checked : false, text : ""}];
	}
	
	set list(pList) {
		if (Array.isArray(pList)) {
			this.updateContent({list : pList});
		}
	}
	
	get length() {
		return this.list.length;
	}
	
	renderContent() {
		let vList = document.createElement("div");
		vList.style.marginTop = "3px";
		vList.style.overflowY = "auto";
		
		this.contentElements.list = vList;
		
		this.updateList();
		
		let vAdddiv = document.createElement("div");
		vAdddiv.style.width = "100%";
		vAdddiv.style.textAlign = "center";
		vAdddiv.style.color = "maroon";
		
		let vAdd = document.createElement("i");
		vAdd.classList.add("fa-solid", "fa-plus");
		vAdd.onclick = () => {this.appendList()};
		registerHoverShadow(vAdd);
		
		vAdddiv.appendChild(vAdd);
		
		this.mainElement.appendChild(vList);
		this.mainElement.appendChild(vAdddiv);
		
		this.contentElements.add = vAdddiv;
	}
	
	changeCheck(pID, pState) {
		let vList = this.list;
		
		if (pID < vList.length && vList[pID].checked != pState) {
			vList[pID].checked = pState;
			this.list = vList;
		}
	}
	
	changeText(pID, pText) {
		let vList = this.list;
		
		if (pID < vList.length && vList[pID].text != pText) {
			vList[pID].text = pText;
			this.list = vList;
		}
	}
	
	removeEntry(pID) {
		if (pID < this.list.length) {
			let vBuffer = this.list;
			
			vBuffer = vBuffer.slice(0, pID).concat(vBuffer.slice(pID+1, this.list.length));
			
			this.list = vBuffer;
		}
	}
	
	updateList() {
		if (!this.contentElements.listElements) {
			this.contentElements.listElements = [];
		}
		
		let vCheckState = (pCheck) => {
			return pCheck.style.display != "none";
		}
		
		let vSetCheckState = (pCheck, pState) => {
			if (pState) {
				pCheck.style.display = "";
			}
			else {
				pCheck.style.display = "none";
			}
		}
		
		let vToggleCheckState = (pCheck) => {
			vSetCheckState(pCheck, !vCheckState(pCheck));
		}
		
		let vList = this.list;
		
		for (let i = 0; i < vList.length; i++) {
			if (!this.contentElements.listElements[i]) {
				let vPrev = this.contentElements.listElements[i-1]?.div;
				
				let vEntry = document.createElement("div");
				vEntry.style.display = "flex";
				vEntry.style.marginBottom = "3px";
				
				let vCheckBorder = document.createElement("div");
				vCheckBorder.style.margin = "auto";
				vCheckBorder.style.marginLeft = "3px";
				vCheckBorder.style.marginRight = "3px";
				vCheckBorder.style.height = "20px";
				vCheckBorder.style.width = "22px";
				vCheckBorder.style.fontSize = "15px"
				vCheckBorder.style.border = "2px solid maroon";
				vCheckBorder.style.textAlign = "center";
				let vCheck = document.createElement("i");
				vCheck.style.margin = "auto";
				vCheck.classList.add("fa-solid", "fa-check");
				vCheck.style.color = "maroon";
				registerHoverShadow(vCheck);
				vSetCheckState(vCheck, vList[i].checked != undefined ? vList[i].checked : false);
				vCheckBorder.appendChild(vCheck);
				vCheckBorder.onclick = () => {
					if (this.canEdit) {
						vToggleCheckState(vCheck);
						this.changeCheck(i, vCheckState(vCheck));
					}
				}
				
				let vText = document.createElement("input");
				vText.type = "text";
				vText.value = vList[i].text || "";
				vText.style.borderRadius = "0";
				vText.style.border = "0px";
				vText.oninput = () => {
					this.changeText(i, vText.value);
				}
				
				let vDelete = document.createElement("i");
				vDelete.classList.add("fa-solid", "fa-xmark");
				vDelete.style.margin = "auto";
				vDelete.style.color = "maroon";
				vDelete.style.marginLeft = "3px";
				vDelete.style.marginRight = "3px";
				vDelete.onclick = () => { this.removeEntry(i)};
				registerHoverShadow(vDelete);
				
				vEntry.appendChild(vCheckBorder);
				vEntry.appendChild(vText);
				vEntry.appendChild(vDelete);
				
				if (vPrev) {
					vPrev.after(vEntry);
				}
				else {
					this.contentElements.list.appendChild(vEntry);
				}
				
				this.contentElements.listElements[i] = {
					div : vEntry,
					check : vCheck,
					text : vText,
					delete : vDelete
				}
			}
			else {
				let vElement = this.contentElements.listElements[i];
				
				let vChecked = vList[i].checked != undefined ? vList[i].checked : false;
				if (vCheckState(vElement.check) != vChecked) {
					vSetCheckState(vElement.check, vChecked);
				}
				
				let vText = vList[i].text || "";
				if (vElement.text.value != vText) {
					vElement.text.value = vText;
				}
			}
		}
		
		while (this.contentElements.listElements.length > vList.length) {
			this.contentElements.listElements[this.contentElements.listElements.length-1].div?.remove();
			this.contentElements.listElements.pop();
		}
	}
	
	appendList() {
		let vList = this.list;
		
		vList.push({checked : false, text : ""});
		
		this.list = vList;
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.list) {
			this.updateList();
		}
	}
	
	disable() {
		for (let i = 0; i < this.contentElements.listElements.length; i++) {
			this.contentElements.listElements[i].text.disabled = true;
			this.contentElements.listElements[i].delete.style.display = "none";
		}
		
		this.contentElements.add.style.display = "none";
	}
	
	enable() {
		for (let i = 0; i < this.contentElements.listElements.length; i++) {
			this.contentElements.listElements[i].text.disabled = false;
			this.contentElements.listElements[i].delete.style.display = "";
		}
		
		this.contentElements.add.style.display = "";
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover) {
			this.contentElements.list.style.maxHeight = this.largeHeightLimit;
			if (this.canEdit) {
				this.contentElements.add.style.display = "";
			}
		}
		else {
			this.contentElements.list.style.maxHeight = this.smallHeightLimit;
			this.contentElements.add.style.display = "none";
		}
	}
}