import {cModuleName} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {cNoteToggleFlag} from "../MainUI.js";

import {notePermissionsWindow} from "../helpers/notePermissions.js";

const cColors = ["white", "#f5ea20", "#e8ae1a", "#c73443", "#34c765", "#4287f5"];

const cPermissionIcon = "fa-book-open-reader";
const cDeleteIcon = "fa-trash-can";

export class basicNote {
	constructor(pNoteID, pNoteData, pOptions = {}) {
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
	
	get permissionLevel() {
		return NoteManager.permissionLevel(this.noteData, game.user.id);
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
	
	get contentState() {
		return this.mainElement.style.display != "none";
	}
	
	set contentState(pState) {
		if (pState != this.contentState) {
			this.toggleContent();
		}
	}
	
	toggleContent() {
		if (this.contentState) {
			this.mainElement.style.display = "none";
		}
		else {
			this.mainElement.style.display = "";
		}
		
		game.user.setFlag(cModuleName, cNoteToggleFlag, {[this.id] : this.contentState});
	}
	
	synchToggleState() {
		let vStates = game.user.getFlag(cModuleName, cNoteToggleFlag);
		
		let vState;
		if (vStates) {
			vState = vStates[this.id];
		}
		
		if (vState == undefined) {
			vState = true;
		}
		
		this.contentState = vState;
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.id = this.id;
		this.element.flexDirection = "column";
		this.element.style.border = "black";
		this.element.style.height = "auto";
		this.element.onmouseenter = () => {this.isMouseHover = true};
		this.element.onmouseleave = () => {this.isMouseHover = false};
		this.element.style.marginBottom = "5px";
		//this.element.draggable = true;
		
		this.captionElement = document.createElement("div");
		this.captionElement.style.top = 0;
		this.captionElement.style.width = 100;
		this.captionElement.style.backgroundColor = "black";
		this.captionElement.style.color = "white";
		this.captionElement.style.flexDirection = "row";
		this.captionElement.style.height = "auto";
		this.captionElement.style.display = "flex";
		this.captionElement.onclick = () => {this.toggleContent()};
		this.captionElement.draggable = true;
		this.captionElement.ondragstart = (event) => {
			event.dataTransfer.setData("text/plain", JSON.stringify({
				id : this.id,
				isNote : true
			}));
		};
		
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
			this.disablebasic();
		}
		
		this.synchToggleState();
	}
	
	renderCaption() {
		let vElements = [];
		
		let vTitle = document.createElement("input");
		vTitle.id = "title";
		vTitle.style.borderRadius = "0";
		vTitle.style.backgroundColor = "black";
		vTitle.style.color = "white";
		vTitle.type = "text";
		vTitle.value = this.title;
		vTitle.oninput = () => {this.updateData({title : vTitle.value})};
		vTitle.style.width = "50%";
		vElements.push(vTitle);
		
		const cColorSize = 10;
		let vColorChoices = document.createElement("div");
		vColorChoices.id = "colorchoice";
		vColorChoices.style.gridTemplateColumns = `repeat(3, ${cColorSize}px)`;
		vColorChoices.style.display = "grid";
		vColorChoices.style.margin = "1px";
		vColorChoices.style.marginLeft = "3px";
		vColorChoices.onclick	 = (pEvent) => {this.captionElement.onclick(pEvent)};
		for (let vColor of cColors) {
			let vColorDiv = document.createElement("div");
			vColorDiv.style.width = `${cColorSize}px`;
			vColorDiv.style.height = `${cColorSize}px`;
			vColorDiv.style.borderRadius = "50%";
			vColorDiv.style.backgroundColor = vColor;
			vColorDiv.onclick = (pEvent) => {pEvent.stopPropagation(); this.color = vColor};
			
			vColorChoices.appendChild(vColorDiv);
		}
		vElements.push(vColorChoices);
		
		let vSpacer = document.createElement("div");
		vSpacer.style.flexGrow = "1";
		vSpacer.onclick	= (pEvent) => {this.captionElement.onclick(pEvent)};
		vElements.push(vSpacer);
		
		if (NoteManager.ownsNote(this.noteData)) {
			let vPermissionButton = document.createElement("i");
			vPermissionButton.classList.add("fa-solid", cPermissionIcon);
			vPermissionButton.style.margin = "5px";
			vPermissionButton.onclick = () => { new notePermissionsWindow(this.id, this.noteData, {}).render(true)};
			vElements.push(vPermissionButton);
		}
		
		if (NoteManager.canDeleteSelf(this.id)) {
			let vDeleteIcon = document.createElement("i");
			vDeleteIcon.classList.add("fa-solid", cDeleteIcon);
			vDeleteIcon.style.margin = "5px";
			vDeleteIcon.onclick = () => {NoteManager.deleteNote(this.id)};
			vElements.push(vDeleteIcon);
		}
		
		for (let vElement of vElements) {
			let vClickEvent = vElement.onclick;
			
			vElement.onclick = (pEvent) => {
				pEvent.stopPropagation(); 
				
				if (vClickEvent) {
					vClickEvent(pEvent);
				}
			}
			this.captionElement.appendChild(vElement);
		}
	}
	
	renderContent() {
		//specific implementations required
		//this.content
	}
	
	updateRender(pupdatedNote, pUpdate) {
		this.noteData = pupdatedNote;
		
		if (pUpdate.permissions) {
			if (this.canEdit) {
				this.enablebasic();
			}
			else {
				this.disablebasic();
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
	
	disablebasic() {
		this.captionElement.querySelector("#title").disabled = true;
		this.captionElement.querySelector("#colorchoice").style.display = "none";
		this.disable();
	}
	
	disable() {
		//disable all inputs
	}
	
	enablebasic() {
		this.captionElement.querySelector("#title").disabled = false;
		this.captionElement.querySelector("#colorchoice").style.display = "grid";
		this.enable();
	}
	
	enable() {
		//enable all inputs
	}
	
	tick() {
		//tick every 100ms for time dependent stuff
	}
	
	round() {
		//called when a round ends
	}
	
	applyFilter(pFilter) {
		
	}
}