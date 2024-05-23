import {cModuleName, cTickInterval, Translate} from "./utils/utils.js";
import {NoteManager, cleanUserData} from "./MainData.js";

import {noteCreation} from "./helpers/noteCreation.js";
import {noteFilter} from "./helpers/noteFilter.js";

const cNoteIcon = "fa-note-sticky";

Hooks.once("init", () => {
	Hooks.call(cModuleName + ".notesInit", {});
});

Hooks.once("ready", async () => {
//Hooks.on("renderSidebarTab", async (pDirectory, pElements, pContext) => {
	await cleanUserData(); //clean before to prevent bugs during delete
	
	let vSidebar = ui.sidebar._element[0];
	if (game.user.isGM) {
		vSidebar.style.width = "315px"
	}
	
	let vNoteTabButton = document.createElement("a");
	vNoteTabButton.classList.add("item");
	vNoteTabButton.setAttribute("data-tab", cModuleName);
	vNoteTabButton.setAttribute("aria-controls", cModuleName);
	vNoteTabButton.setAttribute("role", "tab");
	
	let vNoteIcon = document.createElement("i");
	vNoteIcon.classList.add("fa-solid", cNoteIcon);
	
	vNoteTabButton.appendChild(vNoteIcon);
	
	vSidebar.querySelector("nav").querySelector(`[data-tab="journal"]`).after(vNoteTabButton);
	
	let vNoteTab = document.createElement("section");
	vNoteTab.classList.add("tab", "sidebar-tab", "chat-sidebar", "directory", "flexcol");
	vNoteTab.setAttribute("id", cModuleName);
	vNoteTab.setAttribute("data-tab", cModuleName);
	
	Hooks.call(cModuleName + ".prepareNotes", {NoteTab : vNoteTab});
	
	ui[cModuleName] = new notesTab({tab : vNoteTab});
	ui.sidebar.tabs[cModuleName] = ui[cModuleName];
	
	vSidebar.appendChild(vNoteTab);
	
	Hooks.call(cModuleName + ".notesReady", {NoteTab : vNoteTab, notes : ui.sidebar.tabs[cModuleName]});
});

const cNoteSortFlag = "notesort";
export const cNoteToggleFlag = "notetoggle";

class notesTab /*extends SidebarTab*/ {
	constructor(options) {
		//super(options);
		
		this.tab = options.tab;
		
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
	
	get defaultNoteOptions() {
		return {
			mouseHoverCallBack : (pID) => {this.onMouseHoverNote(pID)},
			onTickChange : (pID) => {this.onTickChange(pID)}
		}
	}
	
	get sortorder() {
		let vSort = game.user.getFlag(cModuleName, cNoteSortFlag);
		
		if (!(typeof vSort == "object")) {
			vSort = {};
		}
		
		return vSort;
	}
	
	set sortorder(pSort) {
		game.user.setFlag(cModuleName, cNoteSortFlag, pSort);
	}
	
	render() {
		let vHeader = document.createElement("header");
		vHeader.style.flex = "none";
		
		let vButtons = document.createElement("div");
		vButtons.classList.add("header-actions", "action-buttons", "flexrow");
		
		let vNewNoteButton = document.createElement("button");
		vNewNoteButton.classList.add("create-document", "create-entry");
		vNewNoteButton.onclick = (pEvent) => {
			if (pEvent.shiftKey) {
				this.createEntry("text");
			}
			else {
				noteCreation(this.createEntry);
			}
		};
		
		let vNewNoteIcon = document.createElement("i");
		vNewNoteIcon.classList.add("fa-solid", cNoteIcon);
	
		let vNewNoteLabel = document.createElement("label");
		vNewNoteLabel.innerHTML = Translate("Titles.createNote");
		
		vNewNoteButton.appendChild(vNewNoteIcon);
		vNewNoteButton.appendChild(vNewNoteLabel);
		
		vButtons.appendChild(vNewNoteButton);
		
		vHeader.appendChild(vButtons);
		vHeader.appendChild((new noteFilter((pFilter) => {this.filterEntries(pFilter)})).element);
		
		this.tab.appendChild(vHeader);
		
		this.entries = document.createElement("ol");
		this.entries.style.padding = "1px";
		this.entries.style.overflowY = "auto";
		this.entries.ondrop = (pEvent) => {this.ondrop(pEvent)};
		
		this.tab.appendChild(this.entries);
		
		this.renderEntries();
	}
	
	renderEntries() {
		for (let vKey of Object.keys(this.notes)) {
			let vClass = CONFIG[cModuleName].noteTypes[this.notes[vKey].type];
			
			let vToggles = this.noteToggle;
			
			if (vClass) {
				this.notes[vKey] = new vClass(vKey, this.notes[vKey], this.defaultNoteOptions);
				
				this.entries.appendChild(this.notes[vKey].render());
			}
			else {
				delete this.notes[vKey];
			}
		}
		
		this.sortEntries();
		this.rebuildTickList();
	}
	
	renderPopout() {
		console.log("Please implement me");
	}
	
	checkEnabled() {
		for(let vNote of Object.values(this.notes)) {
			vNote.checkEnabled();
		}
	}
	
	createEntry(pType, pData) {
		let vClass = CONFIG[cModuleName].noteTypes[pType];
		
		if (vClass) {
			NoteManager.createNewNote({...pData, type : pType});
		}
	}
	
	addNode(pID) {
		this.deleteNote(pID);
		
		let vNote = NoteManager.getNote(pID);
		
		if (vNote) {
			let vClass = CONFIG[cModuleName].noteTypes[vNote.type];
		
			if (vClass && NoteManager.canSeeSelf(vNote)) {
				this.notes[pID] = new vClass(pID, vNote, this.defaultNoteOptions);
							
				this.entries.appendChild(this.notes[pID].render());
				
				this.sortEntries();
				this.rebuildTickList();
			}
		}
	}
	
	deleteNote(pID) {
		let vNote = this.notes[pID];
		
		if (vNote) {
			delete this.notes[pID];
			
			vNote.element.remove();
		}
	}
	
	renderUpdate(pNewNoteData, pNoteDataUpdate, pContext) {
		let vNote = this.notes[pNewNoteData.id];
		
		if (vNote) {
			if (pContext.deletion || !NoteManager.canSeeSelf(pNewNoteData)) {
				this.deleteNote(pNewNoteData.id);
			}
			else {
				vNote.updateRender(pNewNoteData, pNoteDataUpdate);
			}
		}
		else {
			if (NoteManager.canSeeSelf(pNewNoteData)) {
				this.addNode(pNewNoteData.id);
			}
		}
	}
	
	ondrop(pEvent) {
		let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
		
		if (vDropData.isNote) {
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
	
	filterEntries(pFilter) {
		if (pFilter) {
			for (let vNote of Object.values(this.notes)) {
				vNote.applyFilter(pFilter);
			}
		}
	}
	
	sortEntries(pSort = undefined) {
		let vSort = pSort;
		if (!vSort) {
			vSort = this.sortorder;
		}
		
		let vNewSort = {order : []};
		let vSorted = [];
		
		let fPushNote = (pNoteID) => {
			vNewSort.order.push(pNoteID);
			vSorted.push(pNoteID);
			
			this.entries.appendChild(this.notes[pNoteID].element);
		}
		
		let fUnshiftNote = (pNoteID) => {
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
		
		for (let vNoteID of vUnsorted) {
			fUnshiftNote(vNoteID);
		}
		
		this.sortorder = vNewSort;
	}
}