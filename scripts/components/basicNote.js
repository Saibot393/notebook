import {cModuleName, cTickInterval, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {cNoteToggleFlag} from "../MainTab.js";

import {noteWindow} from "../helpers/noteWindow.js";

import {notePermissionsWindow} from "../helpers/notePermissions.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

				//w			y			o			r			g			b
export const cColors = ["white", "#f5ea20", "#e8ae1a", "#c73443", "#34c765", "#4287f5"];

const cPermissionIcon = "fa-book-open-reader";
const cInfoIcon = "fa-circle-info";
const cDeleteIcon = "fa-trash-can";
const cWindowIcon = "fa-arrow-up-from-bracket";
const cSoundOnIcon = "fa-volume-xmark";
const cSoundOffIcon = "fa-volume-high";

//AudioHelper.play({src: "sounds/notify.wav", volume: 1});

const cStickyHover = false;

const cShowIcon = true;

export class basicNote {
	constructor(pNoteID, pNoteData, pOptions = {}) {
		this._hasError = false;
		
		this._noteID = pNoteID;
		
		this._noteData = pNoteData;
		
		this._element = null;
		
		this.contentElements = {};
		
		this.captionElements = {};
		
		this._isMouseHover = false;
		
		this._hastick = false;
		
		this._window = pOptions.window;
		
		this._mouseHoverCallBack = pOptions.mouseHoverCallBack;
		
		this._onTickChange = pOptions.onTickChange;

		//this.render();
	}
	
	get valid() {
		return this.type == this.noteData.type && !this._hasError;
	}
	
	get hasError() {
		return this._hasError;
	}
	
	get id() {
		return this._noteID;
	}
	
	get type() {
		return undefined;
	}
	
	get icon() {
		return "fa-note-sticky";
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
	
	get window() {
		return this._window;
	}
	
	get windowed() {
		return Boolean(this.window);
	}
	
	get windowedAMH() {
		return true; //if being windowed should always be treated as always(A) having a mouse(M) hover(H) the note (AMH)
	}
	
	get windowOptions() {
		return {
			resizable: true,
			width: 313,
			height: 400
		}
	}
	
	get isOwner() {
		return NoteManager.ownsNote(this.noteData);
	}
	
	get owner() {
		return NoteManager.owner(this.noteData);
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
	
	get backColor() {
		return this.noteData.backColor;
	}
	
	get captionColor() {
		return "#181818";
	}
	
	get primeColor() {
		return "maroon";
	}
	
	get ownerColor() {
		return this.owner?.color;
	}
	
	get ownerName() {
		return this.owner?.name;
	}
	
	get ownerID() {
		return this.owner?.id;
	}
	
	get smallHeightLimit() {
		return "87px";
	}
	
	get largeHeightLimit() {
		if (this.windowed) {
			return "100%";
		}
		
		return "174px";
	}
	
	set backColor(pColor) {
		this.updateData({backColor : pColor});
	}
	
	get isMouseHover() {
		return this._isMouseHover || (this.windowed && this.windowedAMH);
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
	
	get JournalPage() {
		return null;
	}
	
	get hasSoundAlarm() {
		return false;
	}
	
	get soundAlarmLevel() {
		return 0;
	}
	
	onMouseHoverChange() {
		
	}
	
	onChangeColor(pColor) {
		
	}
	
	onJournaldrop(pJournalID) {
		let vJournalPage = this.JournalPage;
		
		if (vJournalPage) {
			let vJournal = game.journal.get(pJournalID);
			
			if (vJournal) {
				vJournal.createEmbeddedDocuments("JournalEntryPage", [{
					name : this.title, 
					flags : {[cModuleName] : {from : {id : this.id, creator : game.user.id}}}, 
					text : vJournalPage
				}]);
			}
		}
	}
	
	get tickinterval() {
		return cTickInterval;
	}
	
	get hastick() {
		//Ticks? Disgusting, where? oh there it is -> *
		return this._hastick;
	}
	
	get skipTicks() {
		return this._skipTicks ?? 0;
	}
	
	set skipTicks(pIgnoreTicks) {
		this._skipTicks = Number(pIgnoreTicks);
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
		if (!this.windowed) {
			this._element = document.createElement("div");
			this._element.id = this.id;
			this._element.flexDirection = "column";
			this._element.style.border = this.captionColor;
			this._element.style.height = "auto";
			this._element.onmouseenter = () => {this.isMouseHover = true};
			if (!cStickyHover) this._element.onmouseleave = () => {this.isMouseHover = false};
			this._element.style.marginBottom = "5px";
			//this.element.draggable = true;
		}
		
		if (!this.windowed) {
			this.captionElement = document.createElement("div");
			this.captionElement.style.top = 0;
			this.captionElement.style.width = 100;
		}
		else {
			this.captionElement = this.window.header;
		}
		this.captionElement.style.backgroundColor = this.captionColor;
		this.captionElement.style.color = "white";
		this.captionElement.style.flexDirection = "row";
		this.captionElement.style.height = "auto";
		this.captionElement.style.display = "flex";
		this.captionElement.onclick = (pEvent) => {
			if (!this.windowed) {
				if (pEvent.shiftKey) {
					this.popOut();
				}
				else {
					this.toggleContent()
				}
			}
		};
		this.captionElement.oncontextmenu = () => {
			if (!this.windowed) {
				this.toggleContent();
			}
		};
		this.captionElement.draggable = true;
		this.captionElement.ondragstart = (event) => {
			event.dataTransfer.setData("text/plain", JSON.stringify({
				id : this.id,
				isNote : true
			}));
		};
		
		if (!this.windowed) {
			this.mainElement = document.createElement("div");
			this.mainElement.style.height = "auto";
		}
		else {
			this.mainElement = this.window.body;
		}
		this.mainElement.style.background = 'url("../ui/parchment.jpg") repeat';
		this.mainElement.style.backgroundBlendMode = "multiply";
		this.mainElement.style.backgroundColor = this.backColor;
		
		if (!this.windowed) {
			this._element.appendChild(this.captionElement);
			this._element.appendChild(this.mainElement);
		}
		
		this.renderCaption();
		
		try {
			this.renderContent();
			
			this.refreshContent();
			
			this.checkEnabled();
			
			this.onMouseHoverChange();
			
			if (!this.windowed) this.synchToggleState();
		}
		catch {
			this._hasError = true;
			
			console.warn(`error while rendering content of ${this.type} note ${this.title} [id=${this.id}]`);
		}
		
		return this.element;
	}
	
	renderCaption() {
		let vElements = [];
		
		if (cShowIcon) {
			let vNoteIcon = document.createElement("i");
			vNoteIcon.classList.add("fa-solid", this.icon);
			vNoteIcon.style.margin = "5px";
			if (this.windowed) vNoteIcon.style.cursor = "move";
			vNoteIcon.style.color = this.backColor;
			vNoteIcon.onclick = this.captionElement.onclick;
			vNoteIcon.setAttribute("data-tooltip", Translate("Titles.typeTitle", {pType : Translate("Titles.notesTypes." + this.type)}));
			vElements.push(vNoteIcon);
			this.captionElements.icon = vNoteIcon;
		}
		
		let vTitle = document.createElement("input");
		vTitle.id = "title";
		vTitle.style.borderRadius = "0";
		vTitle.style.backgroundColor = this.captionColor;
		vTitle.style.color = "white";
		vTitle.type = "text";
		vTitle.value = this.title;
		vTitle.oninput = () => {this.updateData({title : vTitle.value})};
		vTitle.style.minWidth = "25%";
		vTitle.style.width = "0px";
		vTitle.style.flexGrow = this.windowed ? "3" : "2.5";
		vTitle.style.cursor = "text";
		vTitle.style.display = "block";
		vTitle.placeholder = Translate("Titles.note");
		this.captionElements.title = vTitle;
		vElements.push(vTitle);
		
		const cColorSize = 10;
		let vColorChoices = document.createElement("div");
		vColorChoices.id = "colorchoice";
		vColorChoices.style.gridTemplateColumns = `repeat(3, ${cColorSize}px)`;
		vColorChoices.style.display = "grid";
		vColorChoices.style.margin = "1px";
		vColorChoices.style.marginLeft = "3px";
		this.captionElements.color = vColorChoices;
		vColorChoices.onclick = (pEvent) => {this.captionElement.onclick(pEvent)};
			for (let vColor of cColors) {
				let vColorDiv = document.createElement("div");
				vColorDiv.style.width = `${cColorSize}px`;
				vColorDiv.style.height = `${cColorSize}px`;
				vColorDiv.style.borderRadius = "50%";
				vColorDiv.style.backgroundColor = vColor;
				vColorDiv.onclick = (pEvent) => {if (!pEvent.shiftKey) {pEvent.stopPropagation(); this.backColor = vColor}};
				
				vColorChoices.appendChild(vColorDiv);
			}
		vElements.push(vColorChoices);
		
		let vSpacer = document.createElement("div");
		vSpacer.style.flexGrow = "1";
		vSpacer.onclick	= (pEvent) => {this.captionElement.onclick(pEvent)};
		vSpacer.style.cursor = "move";
		vSpacer.style.display = "block";
		vElements.push(vSpacer);
		
		if (!this.windowed) {
			let vPopoutButton = document.createElement("i");
			vPopoutButton.classList.add("fa-solid", cWindowIcon);
			vPopoutButton.style.margin = "5px";
			this.captionElements.popout = vPopoutButton;
			vPopoutButton.onclick = () => {this.popOut()};
			registerHoverShadow(vPopoutButton);
			vElements.push(vPopoutButton);
		}
		
		if (NoteManager.ownsNote(this.noteData)) {
			let vPermissionButton = document.createElement("i");
			vPermissionButton.classList.add("fa-solid", cPermissionIcon);
			vPermissionButton.style.margin = "5px";
			vPermissionButton.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
			vPermissionButton.onclick = () => { new notePermissionsWindow(this.id, this.noteData, {}).render(true)};
			registerHoverShadow(vPermissionButton);
			this.captionElements.permissioninfo = vPermissionButton;
			vElements.push(vPermissionButton);
		}
		else {
			let vPermissionInfo = document.createElement("i");
			vPermissionInfo.classList.add("fa-solid", cInfoIcon);
			vPermissionInfo.style.margin = "5px";
			vPermissionInfo.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
			this.captionElements.permissioninfo = vPermissionInfo;
			vElements.push(vPermissionInfo);
		}
		
		if (NoteManager.canDeleteSelf(this.id)) {
			let vDeleteIcon = document.createElement("i");
			vDeleteIcon.classList.add("fa-solid", cDeleteIcon);
			vDeleteIcon.style.margin = "5px";
			this.captionElements.delete = vDeleteIcon;
			vDeleteIcon.onclick = (pEvent) => {
				if (pEvent.shiftKey) {
					this.delete();
				}
				else {
				Dialog.confirm({
					title: Translate("Titles.delete"),
					content: Translate("Titles.deleteNoteConfirm", {pTitle : this.title}),
					yes: () => {this.delete()},
					no: () => {},
					defaultYes: false
				});
				}
			};
			registerHoverShadow(vDeleteIcon);
			vElements.push(vDeleteIcon);
		}
		
		for (let vElement of vElements) {
			if (!vElement.style.flexGrow) {
				vElement.style.flexGrow = "0";
			}
			
			if (!vElement.style.cursor) {
				vElement.style.cursor = "pointer";
			}
			
			if (this.windowed) {
				vElement.onondragstart = (pEvent) => {pEvent.stopPropagation()};
				vElement.ondragenter = (pEvent) => {pEvent.stopPropagation()};
				vElement.onselect = (pEvent) => {pEvent.stopPropagation()};
				if (vElement.nodeName == "INPUT") {
					vElement.onfocus = (pEvent) => {if (this.canEdit) {pEvent.stopPropagation(); vElement.focus()}};
					vElement.onclick = (pEvent) => {if (this.canEdit) {pEvent.stopPropagation(); vElement.focus()}};
				}; 
			}
			let vClickEvent = vElement.onclick;
			
			vElement.onclick = (pEvent) => {
				if (!pEvent.shiftKey || vElement.nodeName == "I") {
					pEvent.stopPropagation(); 

					if (vClickEvent) {
						vClickEvent(pEvent);
					}
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
		
		if (pUpdate.hasOwnProperty("title")) {
			if (this.title != this.captionElement.querySelector("#title").value) {
				this.captionElement.querySelector("#title").value = this.title;
			}
		}
		
		if (pUpdate.backColor) {
			this.mainElement.style.backgroundColor = this.backColor;
			if (this.captionElements.icon) this.captionElements.icon.style.color = this.backColor;
			this.onChangeColor(pUpdate.backColor);
		}
		
		if (pUpdate.content) {
			this.updateRenderContent(pupdatedNote, pUpdate.content, pUpdate);
		}
		
		if (pUpdate.permissions) {
			this.checkEnabled();
			if (this.captionElements.permissioninfo) {
				this.captionElements.permissioninfo.setAttribute("data-tooltip", NoteManager.permissionOverview(this.noteData));
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
	
	reduceCaption() {
		let vTarget = {
			icon : "block",
			title : "block",
			color : "none",
			popout : "none",
			permissioninfo : "none",
			delete : "none"
		}
		
		for (let vKey of Object.keys(vTarget)) {
			if (this.captionElements[vKey]) {
				this.captionElements[vKey].style.display = vTarget[vKey];
			}
		}
	}
	
	expandCaption() {
		let vTarget = {
			icon : "block",
			title : "block",
			color : "grid",
			popout : "",
			permissioninfo : "",
			delete : ""
		}
		
		for (let vKey of Object.keys(vTarget)) {
			if (this.captionElements[vKey]) {
				this.captionElements[vKey].style.display = vTarget[vKey];
			}
		}
	}
	
	alarm() {
		
	}
	
	tickbasic(pTickCount) {
		if (this.hastick) {
			if (this.skipTicks <= 0) {
				this.tick(pTickCount);
			}
			else {
				this.skipTicks = this.skipTicks - 1;
			}
		}
	}
	
	tick(pTickCount) {
		//tick every 100ms for time dependent stuff
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
		if (this.element) {
			if (pFilter?.match) {
				let vMatch = pFilter?.match({
					title : this.title,
					type : this.type,
					color : this.backColor,
					permission : this.permissionLevel,
					owner : this.ownerID
				});
				
				if (vMatch) {
					this.element.style.display = "";
				}
				else {
					this.element.style.display = "none";
				}
			}
			else {
				this.element.style.display = "";
			}
		}
	}
	
	popOut() {
		new noteWindow(this.id, this._noteData, this.windowOptions).render(true);
	}
	
	delete() {
		NoteManager.deleteNote(this.id);
	}
}