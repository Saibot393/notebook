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
		
		this.tab.appendChild(this.entries);
		
		this.renderEntries();
	}
	
	renderEntries() {
		for (let vKey of Object.keys(this.notes)) {
			let vClass = CONFIG[cModuleName].noteTypes[this.notes[vKey].type];
			
			if (vClass) {
				this.notes[vKey] = new vClass(vKey, this.notes[vKey]);
				this.entries.appendChild(this.notes[vKey].element);
			}
		}
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
			this.notes[pID] = new vClass(pID, vNote);
			this.entries.appendChild(this.notes[pID].element);
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
	
	filterEntries() {
		
	}
	
	sortEntries() {
		
	}
}