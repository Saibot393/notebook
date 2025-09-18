import {cModuleName, Translate} from "../utils/utils.js";

export class tabWindowv2 extends foundry.applications.api.ApplicationV2 {
	constructor(pOptions = {}) {
		super(pOptions);
		
		this._tabHTML = document.querySelector(`.tab[id="notebook"]`);
	}
	
	get header() {
		return this.element.querySelector("header");
	}
	
	get body() {
		return this.element.querySelector("section.window-content");
	}
	
	//app stuff
	static DEFAULT_OPTIONS = {
		id: `${cModuleName}-popout`,
		classes: ["application", "tab", "sidebar-tab", "directory", "flexcol", "sidebar-popout", "themed"],
		tag: "section",
		window: {
		  frame: true,
		  positioned: true,
		  title: cModuleName + ".Titles.notebook",
		  icon: "",
		  controls: [],
		  minimizable: true,
		  resizable: true,
		  contentTag: "section",
		  contentClasses: []
		},
		actions: {},
		form: {
		  handler: undefined,
		  submitOnChange: false,
		  closeOnSubmit: false
		},
		position: {
		  width: "auto",
		  height: "auto"
		}
	}
	
	async _renderHTML(pforce=false, pOptions={}) {
		await super._renderHTML(pforce, pOptions);

		this.body.style.padding = "0px";

		this.body.appendChild(this._tabHTML);
		
		let vSidebar = ui.sidebar.element;
		
		vSidebar.querySelector("nav").querySelector(`[data-tab="notebook"]`).style.display = "none";
		
		this._tabHTML.classList.add("active");
		
		ui.sidebar.activateTab("chat");
	}
	
	async _replaceHTML() {
		await super._replaceHTML();
	}
	
	close() {
		this._tabHTML.classList.remove("active");
		
		let vSidebar = ui.sidebar.element;
		
		vSidebar.querySelector('[id="sidebar-content"]').appendChild(this._tabHTML);
		
		vSidebar.querySelector("nav").querySelector(`[data-tab="notebook"]`).style.display = "";
		
		ui.sidebar.activateTab("notebook");
		
		super.close();
	}
}