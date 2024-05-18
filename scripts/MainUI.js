import {cModuleName} from "./utils/utils.js";
import {NoteManager} from "./MainData.js";

import {basicNote} from "./components/basicNote.js";

import {textNote} from "./components/textNote.js";

const cNoteIcon = "fa-note-sticky";

Hooks.once("ready", () => {
	CONFIG[cModuleName] = {
		basicNote : basicNote,
		noteTypes : {
			text : textNote
		}
	}
	
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
	
	ui.sidebar.tabs[cModuleName] = new Notes({tab : vNoteTab});
	
	vSidebar.appendChild(vNoteTab);
	
	Hooks.call(cModuleName + ".notesReady", {NoteTab : vNoteTab, basicNote : basicNote});
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
		vNewNoteButton.onclick = () => {this.addEntry("text")};
		
		let vNewNoteIcon = document.createElement("i");
		vNewNoteIcon.classList.add("fa-solid", cNoteIcon);
		
		vNewNoteButton.appendChild(vNewNoteIcon);
		
		vButtons.appendChild(vNewNoteButton);
		
		vHeader.appendChild(vButtons);
		
		this.tab.appendChild(vHeader);
		
		this.entries = document.createElement("ol");
		this.entries.style.padding = "1px";
		
		this.tab.appendChild(this.entries);
		
		this.renderEntries();
	}
	
	renderEntries() {
		for (let vKey of Object.keys(this.notes)) {
			let vClass = CONFIG[cModuleName].noteTypes[this.notes[vKey].type];
			
			this.notes[vKey] = new vClass(vKey, this.notes[vKey]);
			this.entries.appendChild(this.notes[vKey].element);
		}
	}
	
	addEntry(pType) {
		let vClass = CONFIG[cModuleName].noteTypes[pType];
		
		if (vClass) {
			let vID = NoteManager.createNewNote({type : pType});
			
			let vNote = NoteManager.getNote(vID);
		
			this.notes[vID] = new vClass(vID, vNote);
			this.entries.appendChild(this.notes[vID].element);
			this.notes[vID].onElementAdded();
		}
	}
	
	renderUpdate(pNewNoteData, pNoteDataUpdate, pContext) {
		let vNote = this.notes[pNewNoteData.id];
		
		if (vNote) {
			vNote.updateRender(pNewNoteData, pNoteDataUpdate);
		}
	}
	
	filterEntries() {
		
	}
	
	sortEntries() {
		
	}
}