import {cModuleName} from "../utils/utils.js";

import {cPermissionTypes} from "../MainData.js";

export class notePermissionsWindow extends Application {
	constructor(pNoteID, pNoteData, pOptions) {
		super(pOptions);
		
		this.vOptions = pOptions;
		
		this.noteData = pNoteData;
		
		this.noteID = pNoteID;
		
		if (this.owner != game.user && !game.user.isGM) {
			this.close();
		}
	}
	
	get owner() {
		return game.users.get(this.noteData.owner);
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
			//title: Translate(cWindowID + ".titles." + "VisionChannels"),
			resizable: false
		});
	}
	
	relevantUsers() {
		return Array.from(game.users).filter(vUser => vUser != this.owner);
	}
	
	async _render(pforce=false, poptions={}) {
		await super._render(pforce, poptions);
		
		let vMainDIV = document.createElement("div");
		vMainDIV.style.height = "100%";
		vMainDIV.style.display = "flex";
		vMainDIV.style.flexDirection = "column";
		
		let vPermissionTable = document.createElement("table");
		vPermissionTable.style.overflowY = "auto";
		
		let vRelevantUsers = this.relevantUsers();
		
		let vTitle = document.createElement("tr");
		
		let vNameTitle = document.createElement("td");
		vNameTitle.innerHTML = "name";
		vNameTitle.style.width = "70%";
		
		let vPermissionTitle = document.createElement("td");
		vPermissionTitle.innerHTML = "name";
		
		vTitle.appendChild(vNameTitle);
		vTitle.appendChild(vPermissionTitle);
		
		vPermissionTable.appendChild(vTitle);
		
		for (let vUser of vRelevantUsers) {
			let vEntry = document.createElement("tr");
			
			let vName = document.createElement("td");
			vName.innerHTML = vUser.name;
			
			if (vUser.isGM) {
				vName.innerHTML = vName.innerHTML + "[GM]";
			}
			
			vEntry.appendChild(vName);
			
			let vPermission = document.createElement("td");
			let vPermissionSelect = document.createElement("select");
			vPermissionSelect.id = vUser.id;
			
			for (let vType of cPermissionTypes) {
				let vOption = document.createElement("option");
				vOption.value = vType;
				vOption.innerHTML = vType;
				
				vPermissionSelect.appendChild(vOption);
			}
			
			vPermission.appendChild(vPermissionSelect);
			
			vEntry.appendChild(vPermission);
			
			vPermissionTable.appendChild(vEntry);
		}
		
		let vSpacer = document.createElement("div");
		vSpacer.style.flexGrow = "1";
		
		let vButtons = document.createElement("div");
		
		let vConfirmButton = document.createElement("button");
		vConfirmButton.onclick = () => {this.applyPermissions()};
		
		let vConfirmIcon = document.createElement("i");
		vConfirmIcon.classList.add("fa-solid", "fa-check");
		
		vConfirmButton.appendChild(vConfirmIcon);
		
		vButtons.appendChild(vConfirmButton);
		
		vMainDIV.appendChild(vPermissionTable);
		vMainDIV.appendChild(vSpacer);
		vMainDIV.appendChild(vButtons);
		
		this._element[0].querySelector(".content").appendChild(vMainDIV);
	}
	
	applyPermissions() {
		
	}
}