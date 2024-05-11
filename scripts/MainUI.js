const cNoteIcon = "fa-note-sticky";

Hooks.once("ready", () => {
	let vSidebar = ui.sidebar._element[0];
	
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
	
	new SidebarTab({tab : vNoteTab})
	
	vSidebar.appendChild(vNoteTab);
});

class Notes extends SidebarTab {
	constructor(options) {
		
	}
}