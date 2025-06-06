import {cModuleName, cTickInterval, Translate} from "./utils/utils.js";
import {NoteManager, cleanUserData} from "./MainData.js";
import {noteFolder} from "./components/noteFolder.js";

import {noteCreation} from "./helpers/noteCreation.js";
import {noteFilter} from "./helpers/noteFilter.js";

import {tabWindow} from "./helpers/tabWindow.js";

export const cNoteIcon = "fa-note-sticky";
export const cFolderIcon = "fa-folder";

const cUseUnsort = false;

Hooks.once("ready", async () => {
//Hooks.on("renderSidebarTab", async (pDirectory, pElements, pContext) => {
	await cleanUserData(); //clean before to prevent bugs during delete
	
	const cVersion = game.data.release.generation;
	const cOldSideBarUI = cVersion < 13;
	
	let vSidebar = cOldSideBarUI ? ui.sidebar._element[0] : ui.sidebar.element;
	
	if (game.user.isGM) {
		if (!game.modules.get("pf2e-dorako-ux")?.active && cOldSideBarUI) {
			vSidebar.style.width = "315px";
		}
	}
	
	let vNoteTab = document.createElement("section");
	vNoteTab.classList.add("tab", "sidebar-tab", "chat-sidebar", "directory", "flexcol");
	vNoteTab.setAttribute("id", cModuleName);
	vNoteTab.setAttribute("data-tab", cModuleName);
	if (!cOldSideBarUI) {
		vNoteTab.style.background = "var(--sidebar-background, var(--color-cool-5-90))";
		vNoteTab.style.color = "var(--color-text-primary)";
	}
	
	Hooks.call(cModuleName + ".prepareNotes", {NoteTab : vNoteTab});
	
	ui[cModuleName] = new notesTab({tab : vNoteTab, oldUI : cOldSideBarUI});
	
	if (cOldSideBarUI) {
		ui.sidebar.tabs[cModuleName] = ui[cModuleName];
		
		let vNoteTabButton = document.createElement("a");
		vNoteTabButton.classList.add("item");
		vNoteTabButton.setAttribute("data-tab", cModuleName);
		vNoteTabButton.setAttribute("data-tooltip", Translate("Titles.notebook"));
		vNoteTabButton.setAttribute("aria-controls", cModuleName);
		vNoteTabButton.setAttribute("role", "tab");
		
		let vNoteIcon = document.createElement("i");
		vNoteIcon.classList.add("fa-solid", cNoteIcon);
		
		vNoteTabButton.appendChild(vNoteIcon);
		
		vSidebar.querySelector("nav").querySelector(`[data-tab="journal"]`).after(vNoteTabButton);
		vSidebar.appendChild(vNoteTab);
	}
	else {
		ui.sidebar.parts[cModuleName] = ui[cModuleName];
		let vNoteListItem = document.createElement("li");
		
		let vNoteTabButton = document.createElement("button");
		vNoteTabButton.classList.add("ui-control", "plain", "icon", "fa-solid", cNoteIcon);
		vNoteTabButton.setAttribute("data-action", "tab");
		vNoteTabButton.setAttribute("role", "tab");
		vNoteTabButton.setAttribute("data-tab", cModuleName);
		vNoteTabButton.setAttribute("data-group", "primary");
		vNoteTabButton.setAttribute("data-tooltip", Translate("Titles.notebook"));
		vNoteTabButton.setAttribute("aria-controls", cModuleName);
		vNoteTabButton.setAttribute("role", "tab");
		
		vNoteTab.setAttribute("data-group", "primary");
		
		vNoteListItem.appendChild(vNoteTabButton);
		vSidebar.querySelector("nav").querySelector(`[data-tab="journal"]`).parentNode.after(vNoteListItem);
		vSidebar.querySelector('[id="sidebar-content"]').appendChild(vNoteTab);
	}
	
	
	
	Hooks.call(cModuleName + ".notesReady", {NoteTab : vNoteTab, notes : ui[cModuleName]});
});

export const cNoteSortFlag = "notesort";
export const cNoteToggleFlag = "notetoggle";
export const cNoteVolumeFlag = "notevolume";

class notesTab /*extends SidebarTab*/ {
	constructor(options) {
		//super(options);
		
		this.tab = options.tab;
		this._oldUI = options.oldUI;
		
		this.notes = NoteManager.viewableNotes();
		
		this.tickNotes = [];
		
		this.tickCount = 0;
		
		if (this.tab) {
			this.render();
		}
		
		Hooks.on(cModuleName + ".updateNote", (pNewNoteData, pNoteDataUpdate, pContext) => {this.renderUpdate(pNewNoteData, pNoteDataUpdate, pContext)});
		
		Hooks.on("userConnected", () => {this.checkEnabled()});
		
		Hooks.on("renderJournalSheet", (pSheet, pHTML, pContext) => {
			let vElement = pHTML[0];

			if (vElement.classList.contains("app")) {
				let vPrevDrop = vElement.ondrop;
				
				let vJournalID = pSheet?.document?.id;

				vElement.ondrop = (pEvent) => {
					if (vPrevDrop) {
						vPrevDrop(pEvent);
					}
					
					let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
					
					if (vDropData.isNote) {
						this.onJournaldrop(vJournalID, vDropData.id);
					}
				}
			}
		});
	}
	
	get useoldUI() {
		return this._oldUI;
	}
	
	get defaultNoteOptions() {
		return {
			mouseHoverCallBack : (pID) => {this.onMouseHoverNote(pID)},
			onTickChange : (pID) => {this.onTickChange(pID)}
		}
	}
	
	/*
	get sortorder() {
		let vSort = game.user.getFlag(cModuleName, cNoteSortFlag);
		
		if (!(typeof vSort == "object")) {
			vSort = {};
		}
		
		return vSort;
	}
	
	set sortorder(pSort) {
		let vSort = pSort;
		
		let vOrder = vSort.order.reverse();
		vOrder.filter((vID, vPos) => vOrder.indexOf(vID) == vPos);
		vSort.order = vOrder.reverse();
		
		game.user.setFlag(cModuleName, cNoteSortFlag, vSort);
	}
	
	get unsorted() {
		let vSorted = Object.values(this.sortorder.order);
		console.log(vSorted);
		return Object.keys(this.notes).filter(vID => !this.notes[vID].isOwner && !vSorted.includes(vID));
	}
	*/
	
	render() {
		let vHeader = document.createElement("header");
		vHeader.style.flex = "none";
		if (!this.useoldUI) {
			vHeader.style.gap = "8px";
			vHeader.style.marginBlock = "8px";
			
			vHeader.style.gap = "8px"
			vHeader.style.display = "flex";
			vHeader.style.flexDirection = "column";
		}
		
		let vButtons = document.createElement("div");
		vButtons.classList.add("header-actions", "action-buttons");
		vButtons.style.display = "flex";
		if (!this.useoldUI) {
			vButtons.style.paddingInline = "8px";
			vButtons.style.gap = "8px";
		}
		
		let vNewNoteButton = document.createElement("button");
		vNewNoteButton.classList.add("create-document", "create-entry");
		vNewNoteButton.onclick = (pEvent, pContext = {}) => {
			let vQuickType;
			if (pEvent.shiftKey) {
				vQuickType = game.settings.get(cModuleName, "shiftquickcreate");
			}
			if (pEvent.ctrlKey) {
				vQuickType = game.settings.get(cModuleName, "ctrlquickcreate");
			}
			if (pEvent.altKey) {
				vQuickType = game.settings.get(cModuleName, "altquickcreate");
			}
			
			if (vQuickType) {
				this.createEntry(vQuickType, {}, pContext);
			}
			else {
				noteCreation((pType, pData) => this.createEntry(pType, pData, pContext));
			}
		};
		
		let vNewNoteIcon = document.createElement("i");
		vNewNoteIcon.classList.add("fa-solid", cNoteIcon);
	
		let vNewNoteLabel = document.createElement("label");
		vNewNoteLabel.innerHTML = Translate("Titles.createNote");
		
		vNewNoteButton.appendChild(vNewNoteIcon);
		vNewNoteButton.appendChild(vNewNoteLabel);
		
		let vNewFolderButton = document.createElement("button");
		vNewFolderButton.classList.add("create-document", "create-entry");
		vNewFolderButton.onclick = (pEvent) => {
			if (this.rootFolder) {
				this.rootFolder.createFolder();
			}
		};
		
		let vNewFolderIcon = document.createElement("i");
		vNewFolderIcon.classList.add("fa-solid", cFolderIcon);
	
		let vNewFolderLabel = document.createElement("label");
		vNewFolderLabel.innerHTML = Translate("Titles.createFolder");
		
		vNewFolderButton.appendChild(vNewFolderIcon);
		vNewFolderButton.appendChild(vNewFolderLabel);
		
		if (!this.useoldUI) {
			vNewNoteButton.style.flexGrow = "1";
			vNewFolderButton.style.flexGrow = "1";
		}
		
		vButtons.appendChild(vNewNoteButton);
		vButtons.appendChild(vNewFolderButton);
		
		vHeader.appendChild(vButtons);
		vHeader.appendChild((new noteFilter((pFilter) => {this.filterEntries(pFilter)}, {oldUI : this.useoldUI})).element);
		
		this.tab.appendChild(vHeader);
		
		/*
		this.content = document.createElement("div");
		this.content.style.overflowY = "auto";
		if (!cUseUnsort) this.content.ondrop = (pEvent) => {this.onEntriesdrop(pEvent)};
		
		this.entries = document.createElement("ol");
		this.entries.style.padding = "1px";
		this.entries.style.minHeight = "300px";
		this.entries.style.height = "auto";
		if (cUseUnsort) this.entries.ondrop = (pEvent) => {this.onEntriesdrop(pEvent)};
		
		if (cUseUnsort) {
			this.unsortedMain = document.createElement("details");
			this.unsortedMain.ondrop = (pEvent) => {this.onUnsortedDrop(pEvent)};
			let vUnsortedTitle = document.createElement("summary");
			vUnsortedTitle.innerHTML = "?unsorted?";
			vUnsortedTitle.style.margin = "5px";
			
			this.unsortedMain.appendChild(vUnsortedTitle);
			this.unsortedCats = {};
			this.unsortedCatDIVs = {};
		}
		
		this.content.appendChild(this.entries);
		if (this.unsortedMain) this.content.appendChild(this.unsortedMain);
		
		this.tab.appendChild(this.content);
		
		if (cUseUnsort) {
			this.renderUnsorted();
		}
		*/
		
		this.renderEntries();
		
		this.rootFolder = new noteFolder("root", {
			getNotes : () => {return this.notes},
			createNote : vNewNoteButton.onclick//(pContext) => {noteCreation((pType, pData) => this.createEntry(pType, pData, pContext))}
		});
		this.rootFolder.render();
		
		this.tab.appendChild(this.rootFolder.element);
	}
	
	renderEntries() {
		for (let vKey of Object.keys(this.notes)) {
			let vClass = CONFIG[cModuleName].noteTypes[this.notes[vKey].type];
			
			let vToggles = this.noteToggle;
			
			if (vClass) {
				this.notes[vKey] = new vClass(vKey, this.notes[vKey], this.defaultNoteOptions);
				
				//this.entries.appendChild(this.notes[vKey].render());
				
				let vElement = this.notes[vKey].render();
				
				/*
				if (vElement && this.notes[vKey].valid) {
					this.entries.appendChild(vElement);
				}
				else {
					delete this.notes[vKey];
				}
				*/
			}
			else {
				delete this.notes[vKey];
			}
		}
		
		//this.sortEntries();
		this.rebuildTickList();
	}
	
	/*
	renderUnsorted() {
		let vUsers = Array.from(game.users).filter(vUser => !vUser.isSelf);
		
		for (let vUser of vUsers) {
			let vUserCategory = document.createElement("details");
			let vUserTitle = document.createElement("summary");
			vUserTitle.style.marginLeft = "15px";
			vUserTitle.innerHTML = vUser.name;
			
			let vUserCatDIV = document.createElement("div");
			vUserCatDIV.style.height = "auto";
			vUserCatDIV.style.marginLeft = "15px";
			
			vUserCategory.appendChild(vUserTitle);
			vUserCategory.appendChild(vUserCatDIV);
			
			this.unsortedMain.appendChild(vUserCategory);
			
			this.unsortedCats[vUser.id] = vUserCategory;
			this.unsortedCatDIVs[vUser.id] = vUserCatDIV;
		}
	}
	*/
	
	renderPopout() {
		new tabWindow().render(true);
	}
	
	checkEnabled() {
		for(let vNote of Object.values(this.notes)) {
			vNote.checkEnabled();
		}
	}
	
	async createEntry(pType, pData, pContext = {}) {
		let vClass = CONFIG[cModuleName].noteTypes[pType];
		
		if (vClass) {
			return await NoteManager.createNewNote({...pData, type : pType}, pContext);
		}
	}
	
	addNote(pID, pContext = {}) {
		this.closeNote(pID);
		
		let vNote = NoteManager.getNote(pID);
		
		if (vNote) {
			let vClass = CONFIG[cModuleName].noteTypes[vNote.type];
		
			if (vClass && NoteManager.canSeeSelf(vNote)) {
				this.notes[pID] = new vClass(pID, vNote, this.defaultNoteOptions);
							
				this.notes[pID].render();
				
				if (this.notes[pID].valid) {
					this.rootFolder.checkNote(pID, pContext);
					/*
					let vTargetFolder = this.rootFolder;
					
					if (pContext.targetFolderID) {
						vTargetFolder = this.rootFolder.folder[pContext.targetFolderID] || this.rootFolder;
					}
					
					if (vTargetFolder) {
						vTargetFolder.addNote(this.notes[pID].id);//appendChild(vElement);
					}
					*/
				}
				else {
					delete this.notes[pID];
				}
				
				//this.sortEntries();
				this.rebuildTickList();
			}
		}
	}
	
	closeNote(pID) {
		let vNote = this.notes[pID];
		
		if (vNote) {
			delete this.notes[pID];
			
			vNote.close();
		}
	}
	
	renderUpdate(pNewNoteData, pNoteDataUpdate, pContext) {
		let vNote = this.notes[pNewNoteData.id];
		
		if (vNote) {
			if (pContext.deletion || !NoteManager.canSeeSelf(pNewNoteData)) {
				this.closeNote(pNewNoteData.id);
			}
			else {
				vNote.updateRender(pNewNoteData, pNoteDataUpdate, pContext);
			}
		}
		else {
			if (!pContext.deletion && NoteManager.canSeeSelf(pNewNoteData)) {
				this.addNote(pNewNoteData.id, pContext);
			}
		}
	}
	
	/*
	onEntriesdrop(pEvent) {
		let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
		
		if (vDropData?.isNote) {
			let vElements = this.entries.childNodes;
			
			let i = 0;
			
			let vBeforeCenter = false;
			
			while (i < vElements.length && !vBeforeCenter) {
				let vRectangle =  vElements[i].getBoundingClientRect();
				
				let vMiddle = vRectangle.top + vRectangle.height/2;
				vBeforeCenter = pEvent.pageY < vMiddle;
				
				if (!vBeforeCenter) {
					i = i+1;
				}
			}
			
			if (i < vElements.length) {
				let vBeforeID = vElements[i].id;
				
				if (vBeforeID != vDropData.id) {
					this.sortBefore(vDropData.id, vBeforeID);
				}
			}
			else {
				this.sortatEnd(vDropData.id);
			}	
		}
	}
	
	onUnsortedDrop(pEvent) {
		let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
		
		if (vDropData?.isNote) {
			
		}
	}
	*/
	
	onJournaldrop(pJournalID, pNoteID) {
		if (pJournalID && pNoteID) {
			this.notes[pNoteID]?.onJournaldrop(pJournalID);
		}
	}
	
	onMouseHoverNote(pID) {
		for (let vKey of Object.keys(this.notes)) {
			if (vKey != pID) {
				this.notes[vKey].isMouseHover = false;
			}
		}
	}
	
	onTickChange(pID) {
		if (this.notes[pID]?.hastick) {
			if (!this.tickNotes.find(vNote => vNote.id == pID)) {
				this.tickNotes.push(this.notes[pID]);
			}
		}
		else {
			this.tickNotes = this.tickNotes.filter(vNote => vNote?.hastick);
		}
		
		if (this.tickNotes.length > 0 && !this.hasTick) {
			this.tick();
		}
	}
	
	rebuildTickList() {
		this.tickNotes = Object.values(this.notes).filter(vNote => vNote?.hastick);
		
		if (this.tickNotes.length > 0 && !this.hasTick) {
			this.tick();
		}
	}
	
	tick(pForce) {
		if (this.tickNotes.length > 0) {
			this.hasTick = true;
			this.tickCount = this.tickCount + 1;
			for (let vNote of this.tickNotes) {
				vNote?.tickbasic(this.tickCount);
			}
			setTimeout(() => {this.tick()}, cTickInterval);
		}
		else {
			this.hasTick = false;
		}
	}
	
	/*
	sortBefore(pInsertID, pBeforeID) {
		let vSortorder = this.sortorder.order;
		
		let vElement = this.notes[pInsertID].element;
		let vBeforeElement = this.notes[pBeforeID].element;
		
		if (vElement && vBeforeElement) {
			let vNewSortorder = vSortorder.filter(vID => vID != pInsertID);
			
			let vSortIndex = vNewSortorder.indexOf(pBeforeID);
			
			vNewSortorder = [...vNewSortorder.slice(0, vSortIndex), pInsertID, ...vNewSortorder.slice(vSortIndex, vNewSortorder.length)];
			
			vBeforeElement.before(vElement);
		
			this.sortorder = {order : vNewSortorder};
		}
	}
	
	sortatStart(pInsertID) {
		let vSortorder = this.sortorder.order;
		
		let vElement = this.notes[pInsertID].element;
		
		if (vElement) {
			vSortorder.unshift(pInsertID);
			
			this.entries.prepend(vElement);
			
			this.sortorder = {order : vSortorder};
		}
	}
	
	sortatEnd(pInsertID) {
		let vSortorder = this.sortorder.order;
		
		let vElement = this.notes[pInsertID].element;
		
		if (vElement) {
			vSortorder.push(pInsertID);
			
			this.entries.appendChild(vElement);
			
			this.sortorder = {order : vSortorder};
		}
	}
	*/
	
	filterEntries(pFilter) {
		/*
		if (pFilter) {
			for (let vNote of Object.values(this.notes)) {
				vNote.applyFilter(pFilter);
			}
		}
		*/
		this.rootFolder.applyFilter(pFilter);
	}
	
	/*
	sortEntries(pSort = undefined) {
		let vSort = pSort;
		if (!vSort) {
			vSort = this.sortorder;
		}
		
		let vNewSort = {order : []};
		let vSorted = [];
		
		let fPushNote = (pNoteID) => {
			vNewSort.order = vNewSort.order.filter(vID => vID != pNoteID);
			vNewSort.order.push(pNoteID);
			vSorted.push(pNoteID);
			
			this.entries.appendChild(this.notes[pNoteID].element);
		}
		
		let fUnshiftNote = (pNoteID) => {
			vNewSort.order = vNewSort.order.filter(vID => vID != pNoteID);
			vNewSort.order.unshift(pNoteID);
			vSorted.push(pNoteID);
			
			this.entries.prepend(this.notes[pNoteID].element);
		}

		//apply sort
		if (vSort.order) {
			for (let vNoteID of vSort.order) {
				if (this.notes[vNoteID]) {
					fPushNote(vNoteID);
				}
			}
		}
		
		//take care of not sorted notes
		let vUnsorted = Object.keys(this.notes).filter(vID => !vSorted.includes(vID));
		
		if (cUseUnsort) {
			vUnsorted = vUnsorted.filter(vID => this.notes[vID].isOwner);
		}
		
		for (let vNoteID of vUnsorted) {
			fUnshiftNote(vNoteID);
		}
		
		this.sortorder = vNewSort;
		
		if (cUseUnsort) {
			this.sortUnsorted();
		}
	}
	
	sortUnsorted() {
		let vUnsorted = this.unsorted;
		console.log(vUnsorted);
		
		for (let vID of vUnsorted) {
			let vNote = this.notes[vID];
			
			if (vNote) {
				let vCat = this.unsortedCatDIVs[vNote.ownerID];
				
				if (vCat) {
					vCat.appendChild(vNote.element);
				}
			}
		}
	}
	*/
}