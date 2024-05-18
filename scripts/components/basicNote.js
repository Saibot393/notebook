import {NoteManager} from "../MainData.js";

const cColors = ["white", "#f5ea20", "#e8ae1a", "#c73443", "#34c765", "#4287f5"];

const cPermissionIcon = "fa-book-open-reader";
const cDeleteIcon = "fa-trash-can";

export class basicNote {
	constructor(pNoteID, pNoteData) {
		this.noteID = pNoteID;
		
		this.noteData = pNoteData;
		
		this.element = null;
		
		this.contentElements = {};
		
		this._isMouseHover = false;
		
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
		return this.noteData.title != undefined ? this.noteData.title : "";
	}
	
	get content() {
		return this.noteData.content;
	}
	
	get color() {
		return this.noteData.backColor;
	}
	
	set color(pColor) {
		this.updateData({backColor : pColor});
	}
	
	get isMouseHover() {
		return this._isMouseHover;
	}
	
	set isMouseHover(pisMouseHover) {
		if (this.isMouseHover != pisMouseHover) {
			this._isMouseHover = pisMouseHover;
			this.onMouseHoverChange();
		}
	}
	
	onMouseHoverChange() {
		
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.flexDirection = "column";
		this.element.style.border = "black";
		this.element.style.height = "auto";
		this.element.onmouseenter = () => {this.isMouseHover = true};
		this.element.onmouseleave = () => {this.isMouseHover = false};
		this.element.style.marginBottom = "5px";
		this.element.draggable = true;
		
		this.captionElement = document.createElement("div");
		this.captionElement.style.top = 0;
		this.captionElement.style.width = 100;
		this.captionElement.style.backgroundColor = "black";
		this.captionElement.style.color = "white";
		this.captionElement.style.flexDirection = "row";
		this.captionElement.style.height = "auto";
		this.captionElement.style.display = "flex";
		
		this.mainElement = document.createElement("div");
		this.mainElement.style.height = "auto";
		this.mainElement.style.background = 'url("http://localhost:30000/ui/parchment.jpg")';
		this.mainElement.style.backgroundBlendMode = "multiply";
		this.mainElement.style.backgroundColor = this.color;
		
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
		vTitle.id = "title";
		vTitle.style.borderRadius = "0";
		vTitle.style.backgroundColor = "black";
		vTitle.style.color = "white";
		vTitle.type = "text";
		vTitle.value = this.title;
		vTitle.oninput = () => {this.updateData({title : vTitle.value})};
		vTitle.disabled = !this.canEdit;
		vTitle.style.width = "50%";
		
		const cColorSize = 10;
		let vColorChoices = document.createElement("div");
		vColorChoices.style.gridTemplateColumns = `repeat(3, ${cColorSize}px)`;
		vColorChoices.style.display = "grid";
		vColorChoices.style.margin = "1px";
		vColorChoices.style.marginLeft = "3px";
		for (let vColor of cColors) {
			let vColorDiv = document.createElement("div");
			vColorDiv.style.width = `${cColorSize}px`;
			vColorDiv.style.height = `${cColorSize}px`;
			vColorDiv.style.borderRadius = "50%";
			vColorDiv.style.backgroundColor = vColor;
			vColorDiv.onclick = () => {this.color = vColor};
			
			vColorChoices.appendChild(vColorDiv);
		}
		
		let vPermissionButton = document.createElement("i");
		vPermissionButton.classList.add("fa-solid", cPermissionIcon);
		vPermissionButton.style.margin = "5px";
		
		let vDeleteIcon = document.createElement("i");
		vDeleteIcon.classList.add("fa-solid", cDeleteIcon);
		vDeleteIcon.style.margin = "5px";
		vDeleteIcon.style.right = "0px";
		vDeleteIcon.style.position = "absolute";
		
		this.captionElement.appendChild(vTitle);
		this.captionElement.appendChild(vColorChoices);
		this.captionElement.appendChild(vPermissionButton);
		this.captionElement.appendChild(vDeleteIcon);
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
		
		if (pUpdate.title) {
			if (this.title != this.captionElement.querySelector("#title").value) {
				this.captionElement.querySelector("#title").value = this.title;
			}
		}
		
		if (pUpdate.backColor) {
			this.mainElement.style.backgroundColor = this.color;
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