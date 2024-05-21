import {cModuleName, cTickInterval, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {cNoteToggleFlag} from "../MainUI.js";

import {notePermissionsWindow} from "../helpers/notePermissions.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cColors = ["white", "#f5ea20", "#e8ae1a", "#c73443", "#34c765", "#4287f5"];

const cPermissionIcon = "fa-book-open-reader";
const cInfoIcon = "fa-circle-info";
const cDeleteIcon = "fa-trash-can";

const cStickyHover = false;

export class basicNote {
	constructor(pNoteID, pNoteData, pOptions = {}) {
		this._noteID = pNoteID;
		
		this._noteData = pNoteData;
		
		this._element = null;
		
		this.contentElements = {};
		
		this._isMouseHover = false;
		
		this._hastick = false;

		this.render();
		
		this._mouseHoverCallBack = pOptions.mouseHoverCallBack;
		
		this._onTickChange = pOptions.onTickChange;
	}
	
	get valid() {
		return this.type == this.noteData.type;
	}
	
	get id() {
		return this._noteID;
	}
	
	get type() {
		return undefined;
	}
	
	get defaultContent() {
		return {};
	}
	
	get noteData() {
		return {...this._noteData, content : {...this.defaultContent, ...this._noteData.content}};
	}
	
	get element() {
		return this._element;
	}
	
	get isOwner() {
		return NoteManager.ownsNote(this.noteData);
	}
	
	get canEdit() {
		return NoteManager.canEditSelf(this.noteData) && NoteManager.isActive(this.noteData);
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
	
	get captionColor() {
		return "#181818";
	}
	
	get smallHeightLimit() {
		return "87px";
	}
	
	get largeHeightLimit() {
		return "174px";
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
			if (cStickyHover) {
				if (pisMouseHover && this._mouseHoverCallBack) {
					this._mouseHoverCallBack(this.id);
				}
			}
			
			this.onMouseHoverChange();
		}
	}
	
	onMouseHoverChange() {
		
	}
	
	onChangeColor(pColor) {
		
	}
	
	onTickChangebasic() {
		if (this._onTickChange) {
			this._onTickChange(this.id);
		}
		
		this.onTickChange();
	}
	
	onTickChange() {
		
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
		this._element = document.createElement("div");
		this._element.id = this.id;
		this._element.flexDirection = "column";
		this._element.style.border = this.captionColor;
		this._element.style.height = "auto";
		this._element.onmouseenter = () => {this.isMouseHover = true};
		if (!cStickyHover) this._element.onmouseleave = () => {this.isMouseHover = false};
		this._element.style.marginBottom = "5px";
		//this.element.draggable = true;
		
		this.captionElement = document.createElement("div");
		this.captionElement.style.top = 0;
		this.captionElement.style.width = 100;
		this.captionElement.style.backgroundColor = this.captionColor;
		this.captionElement.style.color = "white";
		this.captionElement.style.flexDirection = "row";
		this.captionElement.style.height = "auto";
		this.captionElement.style.display = "flex";
		this.captionElement.onclick = () => {this.toggleContent()};
		this.captionElement.oncontextmenu = () => {this.toggleContent()};
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
		
		this._element.appendChild(this.captionElement);
		this._element.appendChild(this.mainElement);
		
		this.renderCaption();
		
		this.renderContent();
		
		this.refreshContent();
		
		this.checkEnabled();
		
		this.onMouseHoverChange();
		
		this.synchToggleState();
	}
	
	renderCaption() {
		let vElements = [];
		
		let vTitle = document.createElement("input");
		vTitle.id = "title";
		vTitle.style.borderRadius = "0";
		vTitle.style.backgroundColor = this.captionColor;
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
			vPermissionButton.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
			vPermissionButton.onclick = () => { new notePermissionsWindow(this.id, this.noteData, {}).render(true)};
			registerHoverShadow(vPermissionButton);
			this.captionElement.permissioninfo = vPermissionButton;
			vElements.push(vPermissionButton);
		}
		else {
			let vPermissionInfo = document.createElement("i");
			vPermissionInfo.classList.add("fa-solid", cInfoIcon);
			vPermissionInfo.style.margin = "5px";
			vPermissionInfo.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
			this.captionElement.permissioninfo = vPermissionInfo;
			vElements.push(vPermissionInfo);
		}
		
		if (NoteManager.canDeleteSelf(this.id)) {
			let vDeleteIcon = document.createElement("i");
			vDeleteIcon.classList.add("fa-solid", cDeleteIcon);
			vDeleteIcon.style.margin = "5px";
			vDeleteIcon.onclick = () => {NoteManager.deleteNote(this.id)};
			registerHoverShadow(vDeleteIcon);
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
	
	refreshContent() {
		this.updateRenderContent(this.noteData, this.noteData.content, {content : this.noteData.content});
	}
	
	reRender() {
		let vNote = NoteManager.getNote(this.id, true);
		
		if (vNote) {
			this.updateRender(vNote, vNote);
		}
	}
	
	updateRender(pupdatedNote, pUpdate) {
		this._noteData = pupdatedNote;
		
		if (pUpdate.title) {
			if (this.title != this.captionElement.querySelector("#title").value) {
				this.captionElement.querySelector("#title").value = this.title;
			}
		}
		
		if (pUpdate.backColor) {
			this.mainElement.style.backgroundColor = this.color;
			this.onChangeColor(pUpdate.backColor);
		}
		
		if (pUpdate.content) {
			this.updateRenderContent(pupdatedNote, pUpdate.content, pUpdate);
		}
		
		if (pUpdate.permissions) {
			this.checkEnabled();
		}
		
		if (pUpdate.permissions) {
			if (this.captionElement.permissioninfo) {
				this.captionElement.permissioninfo.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
			}
		}
	}
	
	checkEnabled() {
		if (this.canEdit) {
			this.enablebasic();
		}
		else {
			this.disablebasic();
		}
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		//called when the content updates
	}
	
	updateData(pData) {
		NoteManager.updateNote(this.id, pData);
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
	
	tickbasic() {
		if (this.hastick) {
			this.tick();
		}
	}
	
	tick() {
		//tick every 100ms for time dependent stuff
	}
	
	get tickinterval() {
		return cTickInterval;
	}
	
	get hastick() {
		//Ticks? Disgusting, where? oh there it is -> *
		return this._hastick;
	}
	
	startTick() {
		this._hastick = true;
		this.onTickChangebasic();
	}
	
	stopTick() {
		this._hastick = false;
		this.onTickChangebasic();
	}
	
	round() {
		//called when a round ends
	}
	
	applyFilter(pFilter) {
		
	}
}