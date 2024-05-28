import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cCheckIcon = "fa-check";

const cMaxIndent = 5;

const cIndent = "25"; //px

export class listNote extends basicNote {
	get type() {
		return "list";
	}
	
	get icon() {
		return "fa-list";
	}
	
	get defaultContent() {
		return {
			list : [{checked : false, text : "", indent : 0}]
		};
	}
	
	get list() {
		return this.content.list;
	}
	
	set list(pList) {
		if (Array.isArray(pList)) {
			this.updateContent({list : pList});
		}
	}
	
	get length() {
		return this.list.length;
	}
	
	get JournalPage() {
		let vText;
		
		let vPrevIndent = 0;
		
		vText = "<ul>";
		
		for (let vEntry of this.list) {
			for (let i = vPrevIndent; i > vEntry.indent; i--) {
				vText = vText + "</ul>";
			}
			for (let i = vPrevIndent; i < vEntry.indent; i++) {
				vText = vText + "<ul>";
			}
			
			vText = vText + "<li>";
			vText = vText + vEntry.text;
			//vText = vText + `<i class"fa-solid ${cCheckIcon}">`;
			vText = vText + "</li>";
			
			vPrevIndent = vEntry.indent || 0;
		}
		
		for (let i = vPrevIndent; i > 0; i--) {
			vText = vText + "</ul>";
		}
	
		vText = vText + "</ul>";
		
		return {
			content : vText
		};
	}
	
	get hasSound() {
		return true;
	}
	
	renderContent() {
		let vListdiv = document.createElement("div");
		vListdiv.style.display = "flex";
		vListdiv.style.flexDirection = "column"
		vListdiv.style.height = "100%";
		vListdiv.style.overflowY = "auto";
		
		let vList = document.createElement("div");
		vList.style.marginTop = "3px";
		
		//this.updateList();
		
		let vAdddiv = document.createElement("div");
		vAdddiv.style.width = "100%";
		vAdddiv.style.textAlign = "center";
		vAdddiv.style.color = this.primeColor;
		
		let vAdd = document.createElement("i");
		vAdd.classList.add("fa-solid", "fa-plus");
		vAdd.onclick = () => {this.appendList()};
		registerHoverShadow(vAdd);
		
		vAdddiv.appendChild(vAdd);
		
		vListdiv.appendChild(vList);
		vListdiv.appendChild(vAdddiv);
		
		this.mainElement.appendChild(vListdiv);
		
		this.contentElements.list = vList;
		this.contentElements.listdiv = vListdiv;
		this.contentElements.add = vAdddiv;
	}
	
	changeCheck(pID, pState) {
		let vList = this.list;
		
		if (pID < vList.length && vList[pID].checked != pState) {
			vList[pID].checked = pState;
			this.list = vList;
		}
	}
	
	toggleWithIndents(pID) {
		let vList = this.list;
		
		if (pID < vList.length) {
			vList[pID].checked = !vList[pID].checked;
			let vCheckedTarget = vList[pID].checked;
			let vIndentLimit = vList[pID].indent || 0;
			let i = pID + 1;
			
			while (i < vList.length && (vList[i].indent || 0) > vIndentLimit) {
				vList[i].checked = vCheckedTarget;
				i = i + 1;
			}
			
			this.list = vList;
		}
	}
	
	changeIndent(pID, pIndent) {
		if (pIndent) {
			let vList = this.list;
			
			if (pID < vList.length && pID > 0) {
				let vPrevIndent = vList[pID-1].indent || 0;
				let vTarget = Math.max(0, Math.min(Math.min(cMaxIndent, vPrevIndent+1), vList[pID].indent + pIndent));

				if (vList[pID].indent != vTarget) {
					let vChange = vTarget - vList[pID].indent;
					
					let i = pID + 1;
					while (i < vList.length && (vList[i].indent || 0) > vList[pID].indent) {
						if (vChange < 0 || vList[i].indent < cMaxIndent) {
							vList[i].indent = vList[i].indent + vChange;
						}
						
						i = i + 1;
					}
					
					vList[pID].indent = vTarget;
					this.list = vList;
				}
			}
			else {
				if (pID == 0 && vList[0].indent != 0) {
					vList[0].indent = 0;
					
					this.list = vList;
				}
			}
		}
	}
	
	changeText(pID, pText) {
		let vList = this.list;
		
		if (pID < vList.length && vList[pID].text != pText) {
			vList[pID].text = pText;
			this.list = vList;
		}
	}
	
	insert(pSource, pPosition) {
		let vList = this.list;
		
		let vPosition = Math.max(0, Math.min(vList.length-1, pPosition));
		
		if (pSource != vPosition && pSource < vList.length && pSource > 0) {
			let vInsert = [pSource];
			
			let vIndentLimit = vList[pSource].indent;
			
			let i = pSource + 1;
			
			while (i < vList.length && vList[i].indent > vIndentLimit) {
				i = i + 1;
			}
			
			vInsert.push(i - 1);
			
			let vCopyLength = vInsert[1] - vInsert[0] + 1;
			
			if ((vPosition < vInsert[0] || vPosition > vInsert[1]) && vCopyLength > 0) {
				if (vPosition > vInsert[1]) {
					vPosition = vPosition - (vCopyLength);
				}
				
				let vInsertList = vList.splice(vInsert[0], vCopyLength);
				
				let vPrevIdent = vPosition == 0 ? -1 : vList[vPosition-1]?.indent || 0;
				
				let vIndentDiff = vInsertList[0].indent - vPrevIdent;
				
				if (vIndentDiff > 1) {
					for (let vEntry of vInsertList) {
						vEntry.indent = vEntry.indent - (vIndentDiff - 1);
					}
				}
				
				vList = [...vList.slice(0, vPosition), ...vInsertList, ...vList.slice(vPosition, vList.length)];
				
				this.updateContent({list : vList}, {position : vPosition, inserts : vInsert});
			}
		}
	}
	
	removeEntry(pID) {
		if (pID < this.list.length) {
			let vBuffer = this.list;
			
			vBuffer = vBuffer.slice(0, pID).concat(vBuffer.slice(pID+1, this.list.length));
			
			this.list = vBuffer;
		}
	}
	
	renderList() {
		let vNotify = false;
		
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
				vNotify = true;
				
				let vPrev = this.contentElements.listElements[i-1]?.div;
				
				let vEntry = document.createElement("div");
				vEntry.style.display = "flex";
				vEntry.style.marginBottom = "3px";
				vEntry.draggable = true;
				
				let vCheckBorder = document.createElement("div");
				vCheckBorder.style.margin = "auto";
				vCheckBorder.style.marginLeft = "3px";
				vCheckBorder.style.marginRight = "3px";
				vCheckBorder.style.height = "20px";
				vCheckBorder.style.width = "22.8px"; //yes this is strange but somehow this is required for a pixel perfect square
				vCheckBorder.style.fontSize = "15px"
				vCheckBorder.style.border = "2px solid maroon";
				vCheckBorder.style.textAlign = "center";
				let vCheck = document.createElement("i");
				vCheck.style.margin = "auto";
				vCheck.classList.add("fa-solid", cCheckIcon);
				vCheck.style.color = this.primeColor;
				registerHoverShadow(vCheck);
				//vSetCheckState(vCheck, vList[i].checked ?? false);
				vCheckBorder.appendChild(vCheck);
				vCheckBorder.onclick = () => {
					if (this.canEdit) {
						//vToggleCheckState(vCheck);
						this.changeCheck(i, !vCheckState(vCheck));
					}
				}
				vCheckBorder.oncontextmenu = () => {
					this.toggleWithIndents(i);
				}
				
				let vText = document.createElement("input");
				vText.type = "text";
				//vText.value = vList[i].text || "";
				vText.style.borderRadius = "0";
				vText.style.border = "0px";
				vText.oninput = () => {
					this.changeText(i, vText.value);
				}
				vText.onkeydown = (pEvent) => {
					switch (pEvent.key) {
						case "ArrowUp" :
							this.contentElements.listElements[(i-1+this.contentElements.listElements.length)%this.contentElements.listElements.length].text.select();
							break;
						case "ArrowDown" :
							this.contentElements.listElements[(i+1)%this.contentElements.listElements.length].text.select();
							break;
						case "Tab" :
							pEvent.preventDefault();
							
							if (pEvent.shiftKey) {
								this.changeIndent(i, -1);
							}
							else {
								this.changeIndent(i, 1);
							}
							break;
					}		
				}
				
				let vDelete = document.createElement("i");
				vDelete.classList.add("fa-solid", "fa-xmark");
				vDelete.style.margin = "auto";
				vDelete.style.color = this.primeColor;
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

			let vElement = this.contentElements.listElements[i];
			
			let vIndent = (vList[i].indent || 0) * cIndent + "px";
			if (vElement.div.style.paddingLeft != vIndent) {
				vElement.div.style.paddingLeft = vIndent;
			}
			
			let vChecked = vList[i].checked;
			if (vCheckState(vElement.check) != vChecked) {
				vNotify = true;
				
				vSetCheckState(vElement.check, vChecked);
			}
			
			let vText = vList[i].text || "";
			if (vElement.text.value != vText) {
				vElement.text.value = vText;
			}
		}
		
		while (this.contentElements.listElements.length > vList.length) {
			vNotify = true;
			
			this.contentElements.listElements[this.contentElements.listElements.length-1].div?.remove();
			this.contentElements.listElements.pop();
		}
		
		if (vNotify) {
			this.soundNotify();
		}
	}
	
	appendList() {
		let vList = this.list;
		
		vList.push({checked : false, text : "", indent : 0});
		
		this.list = vList;
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.list) {
			this.renderList();
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
		
		if (this.isMouseHover) {
			this.contentElements.add.style.display = "";
		}
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover) {
			this.contentElements.listdiv.style.maxHeight = this.largeHeightLimit;
			if (this.canEdit) {
				this.contentElements.add.style.display = "";
			}
		}
		else {
			this.contentElements.listdiv.style.maxHeight = this.smallHeightLimit;
			this.contentElements.add.style.display = "none";
		}
	}
}