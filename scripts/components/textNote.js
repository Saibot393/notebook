import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

export class textNote extends basicNote {
	get text() {
		return this.noteData.content.text;
	}
	
	set text(pText) {
		this.updateData({content : {text : pText}});
	}
	
	renderContent() {
		let vText = document.createElement("textinput");
		vText.style.width = "100%";
		vText.style.height = "100%";
		vText.innerHTML = this.text;
		vText.onchange = () => {this.text = vText.innerHTML};
		
		this.content.appendChild(vText);
		
		this.contentElements.text = vText;
	}
	
	updateRender(pupdatedNote, pUpdate) {
		super.updateRender(pupdatedNote, pUpdate);
		
		this.contentElements.text.innerHTML = this.text;
	}
	
	disable() {
		this.contentElements.text.disabled = true;
	}
	
	enable() {
		this.contentElements.text.disabled = false;
	}
}