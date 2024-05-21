import {cModuleName, Translate} from "../utils/utils.js";

import {cPermissionTypes, NoteManager} from "../MainData.js";

export class notePermissionsWindow extends Application {
	constructor(pNoteID, pNoteData, pOptions) {
		super(pOptions);
		
		this.vOptions = pOptions;
		
		this.noteData = pNoteData;
		
		this.noteID = pNoteID;
		
		this.selector = {};
		
		if (this.owner != game.user && !game.user.isGM) {
			this.close();
		}
	}
	
	get defaultNoteOptions() {
		return {
			mouseHoverCallBack : (pID) => {this.onMouseHoverNote(pID)},
			onTickChange : (pID) => {this.onTickChange(pID)}
		}
	}
	
	//app stuff
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["notePermissionsWindow"],
			popOut: true,
			width: 400,
			height: 300,
			template: `modules/${cModuleName}/templates/default.html`,
			jQuery: true,
			title: Translate("Titles.permissions"),
			resizable: true
		});
	}
	
	async _render(pforce=false, poptions={}) {
		await super._render(pforce, poptions);
		
		
	}
}