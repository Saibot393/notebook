import {NoteManager} from "../MainData.js";

export class basicNote {
	constructor(pNoteID, pNoteData) {
		this.noteID = pNoteID;
		
		this.noteData = pNoteData;
		
		this.element = null;
		
		this.contentElements = {};
	}
	
	get isOwner() {
		NoteManager.ownsNote(this.noteData);
	}
	
	get canEdit() {
		return NoteManager.canEditSelf(this.noteData);
	}
	
	get title() {
		return this.noteData.title;
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.flexDirection = "column";
		this.element.style.border = "black";
		this.element.style.height = "auto";
		
		this.caption = document.createElement("div");
		this.caption.style.top = 0;
		this.caption.style.width = 100;
		this.caption.style.backgroundColor = "black";
		this.caption.style.color = "white";
		this.caption.style.flexDirection = "row";
		this.caption.style.height = "auto";
		
		this.content = document.createElement("div");
		this.content.style.height = "auto";
		
		this.element.appendChild(this.caption);
		this.element.appendChild(this.content);
		
		this.renderContent();
		
		if (!this.canEdit()) {
			this.disable();
		}
	}
	
	renderCaption() {
		let vTitle = document.createElement("input");
		vTitle.style.backgroundColor = "black";
		vTitle.type = "text";
		vTitle.value = this.title;
		vTitle.onchange = () => {this.updateData({title : vTitle.value})};
		vTitle.disabled = !this.canEdit;
		
		this.caption.appendChild(vTitle);
	}
	
	renderContent() {
		//specific implementations required
		//this.content
	}
	
	updateRender(pupdatedNote, pUpdate) {
		this.noteData = pupdatedNote;
		
		if (this.canEdit) {
			this.enable();
		}
		else {
			this.disable();
		}
	}
	
	updateData(pData) {
		NoteManager.updateNote(this.noteID, pData);
	}
	
	disable() {
		//enable all inputs
	}
	
	enable() {
		//disable all inputs
	}
	
	tick() {
		//tick every 100ms for time dependent stuff
	}
	
	applyFilter(pFilter) {
		
	}
}