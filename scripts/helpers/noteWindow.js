import {cModuleName, cTickInterval, Translate} from "../utils/utils.js";

import {cPermissionTypes, NoteManager} from "../MainData.js";

export class noteWindow extends Application {
	constructor(pNoteID, pNoteData, pOptions = {}) {
		let vClass = CONFIG[cModuleName].noteTypes[pNoteData.type];
		
		let vOptions = vClass?.windowOptions || {};
		console.log(vOptions);
		super(vOptions);
		
		this._ticking = false;
		
		this.tickCount = 0;
		
		this._ishowpopup = pOptions.ishowpopup;
		
		if (vClass) {
			this.note = new vClass(pNoteID, pNoteData, this.defaultNoteOptions);
		}
		else {
			this.close();
		}
		
		this.onTickChange(this.noteID);
		
		this.hooks = [];
		
		this.hooks.push({id : Hooks.on(cModuleName + ".updateNote", (pNewNoteData, pNoteDataUpdate, pContext) => {this.renderUpdate(pNewNoteData, pNoteDataUpdate, pContext)}), name : cModuleName + ".updateNote"});
		
		this.hooks.push({id : Hooks.on("userConnected", () => {this.checkEnabled()}), name : "userConnected"});
	}
	
	get noteID() {
		return this.note?.id;
	}
	
	get noteData() {
		return this.note?.noteData;
	}
	
	get defaultNoteOptions() {
		return {
			mouseHoverCallBack : (pID) => {this.onMouseHoverNote(pID)},
			onTickChange : (pID) => {this.onTickChange(pID)},
			window : this
		}
	}
	
	get header() {
		return this._element[0].querySelector("header");
	}
	
	get body() {
		return this._element[0].querySelector("div.content");
	}
	
	get hasTick() {
		return this.note.hastick;
	}
	
	get ishowpopup() {
		return this._ishowpopup;
	}
	
	//app stuff
	static get defaultOptions() {
		return {
			...super.defaultOptions, 
			classes: ["notePermissionsWindow"],
			popOut: true,
			width: 400,
			height: 300,
			template: `modules/${cModuleName}/templates/default.html`,
			jQuery: true,
			//title: Translate("Titles.permissions"),
			resizable: true
		}
	}
	
	async _render(pforce=false, poptions={}) {
		await super._render(pforce, poptions);
		
		this.note.render();
		
		//fix some stuff
		this.header.querySelector(".window-title").remove();
		this.header.appendChild(this.header.querySelector(".close"));
		this.header.style.paddingLeft = "0"
		this._element[0].querySelector(".window-content").style.padding = "0";
		this._element[0].onmouseenter = () => {this.note.isMouseHover = true};
		this._element[0].onmouseleave = () => {this.note.isMouseHover = false};
	}
	
	renderUpdate(pNewNoteData, pNoteDataUpdate, pContext) {
		if (this.noteID == pNewNoteData.id) {
			if (pContext.deletion || (!this.ishowpopup && !NoteManager.canSeeSelf(pNewNoteData))) {
				this.close();
			}
			else {
				this.note.updateRender(pNewNoteData, pNoteDataUpdate, pContext);
			}
		}
	}
	
	checkEnabled() {
		if(this.note) {
			this.note.checkEnabled();
		}
	}
	
	onTickChange(pID) {
		if (this.hasTick && !this._ticking) {
			this.tick();
		}
	}
	
	tick(pForce) {
		if (this.hasTick) {
			this._ticking = true;
			this.tickCount = this.tickCount + 1;
			this.note?.tickbasic(this.tickCount);
			setTimeout(() => {this.tick()}, cTickInterval);
		}
		else {
			this._ticking = false;
		}
	}
	
	async minimize() {
		await super.minimize();
		
		this.note.reduceCaption();
	}
	
	async maximize() {
		await super.maximize();
		
		this.note.expandCaption();
	}
	
	close() {
		if (this.hooks) {
			for (let vHook of this.hooks) {
				Hooks.off(vHook.name, vHook.id);
			}
		}
		
		this.note?.close();
		
		super.close();
	}
}