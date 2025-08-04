import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

let vMaxTextLength = 20000;

export class textNote extends basicNote {
	get icon() {
		return "fa-font";
	}
	
	get defaultContent() {
		return {
			text : ""
		};
	}
	
	get text() {
		return this.content.text;
	}
	
	set text(pText) {
		this.updateContent({text : pText});
	}
	
	get JournalPage() {
		return {
			content : this.text
		};
	}
	
	renderContent() {
		let vTextDIV = document.createElement("div");
		vTextDIV.style.display = "flex";
		vTextDIV.style.height = "100%";
		
		let vText = document.createElement("textarea");
		vText.style.width = "100%";
		//vText.style.height = "100%";
		vText.style.backgroundColor = this.color;
		vText.style.resize = "none";
		vText.style.borderRadius = "0";
		vText.style.background = "transparent";
		vText.style.fontFamily = "Arial";
		vText.style.color = "black";
		//vText.style.height = "auto";
		//vText.value = this.text;
		vText.oninput = () => {
			if (vText.value.length > vMaxTextLength) { //prevent data flooding
				vText.value = vText.value.slice(0, vMaxTextLength);
			}
			
			this.updateTextHeight();
			
			if (this.text != vText.value) {
				//this.text = vText.value;
				this.updateContent({text : vText.value}, {position : [vText.selectionStart, vText.selectionEnd]});
			}
		};
		vText.onblur = () => {this.updateTextHeight()};
		vText.onfocus = () => {this.updateTextHeight()};
		
		vTextDIV.appendChild(vText);
		this.mainElement.appendChild(vTextDIV);
		
		this.contentElements.text = vText;
		this.contentElements.textdiv = vTextDIV;
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate, pContext) {
		if (pContentUpdate.hasOwnProperty("text") && this.contentElements.text.value != this.text && (pContext.user != game.user.id || !this.textisFocused())) {
			let vPrevPosition = [];
			let vOffset = 0;
			if (isActiveElement(this.contentElements.text)) {
				vPrevPosition = [this.contentElements.text.selectionStart, this.contentElements.text.selectionEnd];
				if (pContext?.content?.position) {
					if (pContext?.content?.position[0] < vPrevPosition[0]) {
						vOffset = this.text.length - this.contentElements.text.value.length;
					}
				}
			}
			
			this.contentElements.text.value = this.text;
			
			if (vPrevPosition.length == 2) {
				this.contentElements.text.setSelectionRange(vPrevPosition[0] + vOffset, vPrevPosition[1] + vOffset);
			}
			
			this.updateTextHeight();
		}
	}
	
	disable() {
		this.contentElements.text.disabled = true;
	}
	
	enable() {
		this.contentElements.text.disabled = false;
	}
	
	onMouseHoverChange() {
		this.updateTextHeight();
	}
	
	textisFocused() {
		return this.contentElements.text == document.activeElement;
	}
	
	updateTextHeight() {
		if (!this.windowed) {
			this.contentElements.text.style.height = 'auto';
			this.contentElements.text.style.height = `${this.contentElements.text.scrollHeight+2}px`;
			
			if (isActiveElement(this.contentElements.text) || this.isMouseHover) {
				this.contentElements.text.style.maxHeight = this.largeHeightLimit;
			}
			else {
				this.contentElements.text.style.maxHeight = this.smallHeightLimit;
			}
		}
	}
}