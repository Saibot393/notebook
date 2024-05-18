import {NoteManager} from "../MainData.js";

export class basicNote {
	constructor(pNoteID, pNoteData) {
		this.noteID = pNoteID;
		
		this.noteData = pNoteData;
		
		this.element = null;
		
		this.contentElements = {};
		
		this.render();
	}
	
	get id() {
		return this.noteID;
	}
	
	get type() {
		return undefined;
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
	
	get content() {
		return this.noteData.content;
	}
	
	get color() {
		return "white";
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.flexDirection = "column";
		this.element.style.border = "black";
		this.element.style.height = "auto";
		
		this.captionElement = document.createElement("div");
		this.captionElement.style.top = 0;
		this.captionElement.style.width = 100;
		this.captionElement.style.backgroundColor = "black";
		this.captionElement.style.color = "white";
		this.captionElement.style.flexDirection = "row";
		this.captionElement.style.height = "auto";
		
		this.mainElement = document.createElement("div");
		this.mainElement.style.height = "auto";
		
		this.element.appendChild(this.captionElement);
		this.element.appendChild(this.mainElement);
		
		this.renderCaption();
		
		this.renderContent();
		
		if (!this.canEdit) {
			this.disable();
		}
	}
	
	renderCaption() {
		let vTitle = document.createElement("input");
		vTitle.style.backgroundColor = "black";
		vTitle.style.color = "white";
		vTitle.type = "text";
		vTitle.value = this.title;
		vTitle.oninput = () => {this.updateData({title : vTitle.value})};
		vTitle.disabled = !this.canEdit;
		
		this.captionElement.appendChild(vTitle);
	}
	
	renderContent() {
		//specific implementations required
		//this.content
	}
	
	updateRender(pupdatedNote, pUpdate) {
		this.noteData = pupdatedNote;
		
		if (pUpdate.permissions) {
			if (this.canEdit) {
				this.enable();
			}
			else {
				this.disable();
			}
		}
		
		if (pUpdate.content) {
			this.updateRenderContent(pupdatedNote, pUpdate.content, pUpdate);
		}
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		//called when the content updates
	}
	
	updateData(pData) {
		NoteManager.updateNote(this.noteID, pData);
	}
	
	updateContent(pContent) {
		this.updateData({content : pContent});
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
	
	onElementAdded() {
		console.log("???");
	}
}