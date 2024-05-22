import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class chatNote extends basicNote {
	get type() {
		return "chat";
	}
	
	get icon() {
		return "fa-comment";
	}
	
	get defaultContent() {
		return {
			history : []
		};
	}
	
	get history() {
		return this.content.history;
	}
	
	set history(pHistory) {
		if (Array.isArray(pHistory)) {
			this.updateContent({history : pHistory});
		}
	}
	
	addMessage(pText) {
		let vMessage = {
			text : pText,
			user : game.user.id,
			time : Date.now()
		}

		let vHistory = this.history;
		
		vHistory.push(vMessage);
		
		this.history = vHistory;
	}
	
	renderContent() {
		let vChatdiv = document.createElement("div");
		vChatdiv.style.display = "flex";
		vChatdiv.style.flexDirection = "column"
		vChatdiv.style.height = "100%";
		
		let vHistorydiv = document.createElement("div");
		vHistorydiv.style.width = "100%";
		//vHistorydiv.style.height = "auto";
		vHistorydiv.style.flexGrow = "1";
		vHistorydiv.style.display = "flex";
		vHistorydiv.style.flexDirection = "column";
		vHistorydiv.style.color = "black"
		vHistorydiv.style.padding = "3px";
		vHistorydiv.style.overflowY = "auto";
		
		let vWritediv = document.createElement("div");
		vWritediv.style.marginRight = "5px";
		
		let vInput = document.createElement("input");
		vInput.type = "text";
		vInput.style.margin = "4px";
		vInput.onkeydown = (pEvent) => {
			if (pEvent.code == "Enter") {
				if (vInput.value != "") {
					this.addMessage(vInput.value);
					vInput.value = "";
				}
			}
		};
		vInput.style.borderRadius = "0";
		vInput.style.borderColor = this.primeColor;
		vInput.style.borderWidth = "2px";
		
		vWritediv.appendChild(vInput);
		
		vChatdiv.appendChild(vHistorydiv);
		vChatdiv.appendChild(vWritediv);
		
		this.mainElement.appendChild(vChatdiv);
		
		this.contentElements.history = vHistorydiv;
		this.contentElements.inputdiv = vWritediv;
		this.contentElements.input = vInput;
		
		//this.renderChatHistory();
	}
	
	renderChatHistory() {
		if (!this.contentElements.chatHistory) {
			this.contentElements.chatHistory = [];
		}
		
		let vHistory = this.history;
		
		let vLastOwner;
		
		for (let i = this.contentElements.chatHistory.length; i < vHistory.length; i++) {
			let vLastUser = vHistory[i-1]?.user;
			
			let vtoRender = vHistory[i];
			
			vLastOwner = vtoRender.user;
			
			let vOrderElement = (pElement, pfromUser) => {
				if (pfromUser != game.user.id) {
					pElement.style.textAlign = "left";
					pElement.style.marginLeft = "6px";
				}
				else {
					pElement.style.textAlign = "right";
					pElement.style.marginRight = "6px";
				}
			}
			
			if (vLastUser != vtoRender.user) {
				let vuserAlignDIV = document.createElement("div");
				
				let vUsercap = document.createElement("p");
				vUsercap.style.marginTop = "0.2em";
				vUsercap.style.marginBottom = "0.2em";
				let vUserundercap = document.createElement("u");
				vUserundercap.innerHTML = (game.users.get(vtoRender.user)?.name || "???") + ":";
				vUsercap.appendChild(vUserundercap);
				vUsercap.style.color = game.users.get(vtoRender.user)?.color || "black";
				vUsercap.style.textShadow = "-1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000";
				
				vOrderElement(vuserAlignDIV, vtoRender.user);
				
				vuserAlignDIV.appendChild(vUsercap);
				this.contentElements.history.appendChild(vuserAlignDIV);
			}
			
			let vAlignDIV = document.createElement("div");
			let vEntryDIV = document.createElement("label");
			vEntryDIV.innerHTML = vtoRender.text;
			vEntryDIV.style.maxWidth = "80%";
			vEntryDIV.style.display = "inline-block";
			vEntryDIV.style.backgroundColor = game.users.get(vtoRender.user) ? game.users.get(vtoRender.user).color + "50" : "";
			vEntryDIV.style.paddingLeft = "4px";
			vEntryDIV.style.paddingRight = "4px";
			vEntryDIV.style.borderRadius = "3px";
			
			vOrderElement(vAlignDIV, vtoRender.user);
			
			vAlignDIV.appendChild(vEntryDIV);
			this.contentElements.history.appendChild(vAlignDIV);
			
			this.contentElements.chatHistory.push(vEntryDIV);
		}
		
		if (!(isActiveElement(this.contentElements.input) || this.isMouseHover) || (vLastOwner == game.user.id)) {
			this.scrolltoEnd();
		}
	}	
	
	scrolltoEnd() {
		this.contentElements.history.scrollTo(0, this.contentElements.history.scrollHeight);
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.history) {
			this.renderChatHistory();
		}
	}
	
	disable() {
		this.contentElements.input.disabled = true;
		this.contentElements.inputdiv.style.display = "none";
		this.contentElements.history.style.borderBottom = "";
		//disable all inputs
	}
	
	enable() {
		this.contentElements.input.disabled = false;
		if (this.isMouseHover) {
			this.contentElements.inputdiv.style.display = "";
			this.contentElements.history.style.borderBottom = "solid maroon 1px";
		}
	}
	
	onMouseHoverChange() {
		if (isActiveElement(this.contentElements.input) || this.isMouseHover) {
			this.contentElements.history.style.maxHeight = this.largeHeightLimit;
			if (this.canEdit) {
				this.contentElements.history.style.borderBottom = "solid maroon 1px";
				this.contentElements.inputdiv.style.display = "";
			}
		}
		else {
			this.contentElements.history.style.maxHeight = this.smallHeightLimit;
			this.contentElements.inputdiv.style.display = "none";
			this.contentElements.history.style.borderBottom = "";
		}
	}
}