import {cModuleName, Translate} from "../utils/utils.js";

export class tabWindow extends Application {
	constructor(pOptions = {}) {
		super(pOptions);
		
		this._tabHTML = document.querySelector(`.tab[id="notebook"]`);
	}
	
	get header() {
		return this._element[0].querySelector("header");
	}
	
	get body() {
		return this._element[0].querySelector("div.content");
	}
	
	//app stuff
	static get defaultOptions() {
		return {
			...super.defaultOptions, 
			classes: ["sidebar-popout"],
			id : "notebook-popout",
			popOut: true,
			width: 300,
			height: 337,
			template: `modules/${cModuleName}/templates/default.html`,
			jQuery: true,
			title: Translate("Titles.notebook"),
			resizable: true
		}
	}
	
	async _render(pforce=false, pOptions={}) {
		await super._render(pforce, pOptions);

		this.body.appendChild(this._tabHTML);
		
		ui.sidebar._element[0].querySelector("nav").querySelector(`[data-tab="notebook"]`).style.display = "none";
		
		ui.sidebar.activateTab("chat")
	}
	
	close() {
		ui.sidebar._element[0].appendChild(this._tabHTML);
		
		ui.sidebar._element[0].querySelector("nav").querySelector(`[data-tab="notebook"]`).style.display = "";
		
		ui.sidebar.activateTab("notebook")
		
		super.close();
	}
}