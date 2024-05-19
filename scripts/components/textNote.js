import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

let vMaxTextLength = 20000;

export class textNote extends basicNote {
	get type() {
		return "text";
	}
	
	get text() {
		return this.content.text != undefined ? this.content.text : "";
	}
	
	set text(pText) {
		this.updateContent({text : pText});
	}
	
	renderContent() {
		let vText = document.createElement("textarea");
		vText.style.width = "100%";
		//vText.style.height = "100%";
		vText.style.backgroundColor = this.color;
		vText.style.resize = "none";
		vText.style.borderRadius = "0";
		vText.style.marginTop = "3px";
		vText.style.background = "transparent";
		vText.style.fontFamily = "Arial";
		vText.value = this.text;
		vText.oninput = () => {
			if (vText.value.length > vMaxTextLength) { //prevent data flooding
				vText.value = vText.value.slice(0, vMaxTextLength);
			}
			
			this.updateTextHeight();
			
			if (this.text != vText.value) {
				this.text = vText.value;
			}
		};
		vText.onblur = () => {this.updateTextHeight()};
		vText.onfocus = () => {this.updateTextHeight()};
		
		this.mainElement.appendChild(vText);
		
		this.contentElements.text = vText;
		
		this.updateTextHeight();
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("text") && this.contentElements.text.value != this.text) {
			this.contentElements.text.value = this.text;
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
	
	updateTextHeight() {
		this.contentElements.text.style.height = 'auto';
		this.contentElements.text.style.height = `${this.contentElements.text.scrollHeight+2}px`;
		
		if (this.contentElements.text == document.activeElement || this.isMouseHover) {
			this.contentElements.text.style.maxHeight = "163px"
		}
		else {
			this.contentElements.text.style.maxHeight = "48px"
		}
	}
}