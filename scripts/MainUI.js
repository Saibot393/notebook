import {cModuleName} from "./utils/utils.js";
import {NoteManager} from "./MainData.js";

import {basicNote} from "./components/basicNote.js";

import {textNote} from "./components/textNote.js";

const cNoteIcon = "fa-note-sticky";

CONFIG[cModuleName] = {
	basicNote : basicNote,
	noteTypes : {
		text : textNote
	}
}

Hooks.once("init", () => {
	Hooks.call(cModuleName + ".notesInit", {basicNote : basicNote});
});

Hooks.once("ready", () => {
	let vSidebar = ui.sidebar._element[0];
	if (game.user.isGM) {
		vSidebar.style.width = "315px"
	}
	
	let vNoteTabButton = document.createElement("a");
	vNoteTabButton.classList.add("item");
	vNoteTabButton.setAttribute("data-tab", "notes");
	vNoteTabButton.setAttribute("aria-controls", "notes");
	vNoteTabButton.setAttribute("role", "tab");
	
	let vNoteIcon = document.createElement("i");
	vNoteIcon.classList.add("fa-solid", cNoteIcon);
	
	vNoteTabButton.appendChild(vNoteIcon);
	
	vSidebar.querySelector("nav").querySelector(`[data-tab="journal"]`).after(vNoteTabButton);
	
	let vNoteTab = document.createElement("section");
	vNoteTab.classList.add("tab", "sidebar-tab", "chat-sidebar", "directory", "flexcol");
	vNoteTab.setAttribute("id", "notes");
	vNoteTab.setAttribute("data-tab", "notes");
	
	Hooks.call(cModuleName + ".prepareNotes", {NoteTab : vNoteTab, basicNote : basicNote});
	
	ui.sidebar.tabs[cModuleName] = new Notes({tab : vNoteTab});
	
	vSidebar.appendChild(vNoteTab);
	
	Hooks.call(cModuleName + ".notesReady", {NoteTab : vNoteTab, basicNote : basicNote, notes : ui.sidebar.tabs[cModuleName]});
});

const cNoteSortFlag = "notesort";
export const cNoteToggleFlag = "notetoggle";

class Notes /*extends SidebarTab*/ {
	constructor(options) {
		//super(options);
		
		this.tab = options.tab;
		
		this.notes = NoteManager.viewableNotes();
		
		if (this.tab) {
			this.render();
		}
		
		Hooks.on(cModuleName + ".updateNote", (pNewNoteData, pNoteDataUpdate, pContext) => {this.renderUpdate(pNewNoteData, pNoteDataUpdate, pContext)});
	}
	
	get defaultNoteOptions() {
		
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
		vNewNoteButton.onclick = () => {this.createEntry("text")};
		
		let vNewNoteIcon = document.createElement("i");
		vNewNoteIcon.classList.add("fa-solid", cNoteIcon);
		
		vNewNoteButton.appendChild(vNewNoteIcon);
		
		vButtons.appendChild(vNewNoteButton);
		
		vHeader.appendChild(vButtons);
		
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
				
				this.entries.appendChild(this.notes[vKey].element);
			}
		}
		
		this.sortEntries();
	}
	
	async createEntry(pType) {
		let vClass = CONFIG[cModuleName].noteTypes[pType];
		
		if (vClass) {
			let vID = await NoteManager.createNewNote({type : pType});
			
			this.addNode(vID);
		}
	}
	
	addNode(pID) {
		this.deleteNote(pID);
		
		let vNote = NoteManager.getNote(pID);
		
		let vClass = CONFIG[cModuleName].noteTypes[vNote.type];
	
		if (vClass && NoteManager.canSeeSelf(vNote)) {
			this.notes[pID] = new vClass(pID, vNote, this.defaultNoteOptions);
						
			this.entries.appendChild(this.notes[pID].element);
			
			this.sortEntries();
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
		console.log(pEvent);
		
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
	
	filterEntries() {
		
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