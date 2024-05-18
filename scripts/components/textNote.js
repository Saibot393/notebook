import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

export class textNote extends basicNote {
	get type() {
		return "text";
	}
	
	get text() {
		return this.content.text;
	}
	
	set text(pText) {
		this.updateContent({text : pText});
	}
	
	renderContent() {
		let vText = document.createElement("textarea");
		vText.style.width = "100%";
		//vText.style.height = "100%";
		vText.style.maxHeight = "163px"
		vText.style.backgroundColor = this.color;
		vText.style.resize = "none";
		vText.value = this.text;
		vText.oninput = () => {
			this.updateTextHeight();
			if (this.text != vText.value) {
				this.text = vText.value;
			}
		};
		
		this.mainElement.appendChild(vText);
		
		this.contentElements.text = vText;
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
	
	updateTextHeight() {
		console.log("updated");
		console.log(this);
		this.contentElements.text.style.height = 'auto';
		this.contentElements.text.style.height = `${this.contentElements.text.scrollHeight+3}px`;
	}
	
	onElementAdded() {
		this.updateTextHeight();
	}
}