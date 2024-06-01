import {cModuleName, Translate} from "../utils/utils.js";

import {cPermissionTypes, NoteManager} from "../MainData.js";

export class notePermissionsWindow extends Application {
	constructor(pNoteID, pNoteData, pOptions) {
		super(pOptions);
		
		this.vOptions = pOptions;
		
		this.noteData = pNoteData;
		
		this.noteID = pNoteID;
		
		this.showcheck = {};
		this.selector = {};
		
		if (this.owner != game.user && !game.user.isGM) {
			this.close();
		}
	}
	
	get owner() {
		return game.users.get(this.noteData.owner);
	}
	
	get permissions() {
		return this.noteData.permissions;
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
	
	relevantUsers(pWithDefault = false) {
		let vUsers =  Array.from(game.users).filter(vUser => vUser != this.owner);
		
		vUsers.unshift({
			name :  game.user.isGM ? Translate("Titles.alldefault") : Translate("Titles.default"),
			id : "default"
		});
		
		vUsers = vUsers.filter(vUser => !vUser.isGM);
		
		return vUsers;
	}
	
	async _render(pforce=false, poptions={}) {
		await super._render(pforce, poptions);
		
		let vMainDIV = document.createElement("div");
		vMainDIV.style.height = "100%";
		vMainDIV.style.display = "flex";
		vMainDIV.style.flexDirection = "column";
		
		let vTableDIV = document.createElement("div");
		vTableDIV.style.overflowY = "auto";
		//vTableDIV.style.flexGrow = "1";
		vTableDIV.style.height = "calc(100%-32px)";
		
		let vPermissionTable = document.createElement("table");
		
		let vRelevantUsers = this.relevantUsers(true);
		
		let vTitle = document.createElement("tr");
		
		let vNameTitle = document.createElement("th");
		vNameTitle.innerHTML =  Translate("Titles.userName");
		vNameTitle.style.width = "70%";
		
		let vShowTitle;
		if (game.user.isGM) {
			vShowTitle = document.createElement("th");
			vShowTitle.innerHTML =  Translate("Titles.showtouser");
		}
		
		let vPermissionTitle = document.createElement("th");
		vPermissionTitle.innerHTML =  Translate("Titles.permissions");
		
		vTitle.appendChild(vNameTitle);
		if(vShowTitle) vTitle.appendChild(vShowTitle);
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
			
			let vShowCheck;
			if (game.user.isGM) {
				vShowCheck = document.createElement("input");
				vShowCheck.type = "checkbox";
				vShowCheck.onchange = () => {
					if (vUser.id == "default") {
						this.synchshowtodefault();
					}
					else {
						this.synchshowdefault();
					}
				}
				this.showcheck[vUser.id] = vShowCheck;
			}
			if (vShowCheck) vEntry.appendChild(vShowCheck);
			
			let vPermission = document.createElement("td");
			vPermission.style.textAlign = "center";
			let vPermissionSelect = document.createElement("select");
			vPermissionSelect.id = vUser.id;
			this.selector[vUser.id] = vPermissionSelect;
			
			let vPermissionTypes = cPermissionTypes;
			if (vUser.id == "default") vPermissionTypes = vPermissionTypes.filter(vType => vType != "default");
				
			for (let vType of vPermissionTypes) {
				let vOption = document.createElement("option");
				vOption.value = vType;
				vOption.innerHTML = Translate("Titles.permissionsTypes." + vType);
				
				vPermissionSelect.appendChild(vOption);
			}
			
			vPermission.appendChild(vPermissionSelect);
			let vDefaultID = 0;
			if (vUser.id == "default") {
				vDefaultID = 1;
			}
			vPermissionSelect.value = this.permissions[vUser.id] || cPermissionTypes[vDefaultID];
			
			vEntry.appendChild(vPermission);
			
			vPermissionTable.appendChild(vEntry);
		}
		
		vTableDIV.appendChild(vPermissionTable);
		
		let vSpacer = document.createElement("div");
		vSpacer.style.flexGrow = "1";
		
		let vButtons = document.createElement("div");
		vButtons.style.height = "32px";
		
		let vConfirmButton = document.createElement("button");
		vConfirmButton.onclick = () => {
			this.applyPermissions();
			this.close();
		};
		
		let vConfirmIcon = document.createElement("i");
		vConfirmIcon.classList.add("fa-solid", "fa-check");
		
		vConfirmButton.appendChild(vConfirmIcon);
		
		vButtons.appendChild(vConfirmButton);
		
		vMainDIV.appendChild(vTableDIV);
		vMainDIV.appendChild(vSpacer);
		vMainDIV.appendChild(vButtons);
		
		this._element[0].querySelector(".content").appendChild(vMainDIV);
	}
	
	synchshowtodefault() {
		if (this.showcheck.default) {
			for (let vKey of Object.keys(this.showcheck)) {
				if (vKey != "default") {
					this.showcheck[vKey].checked = this.showcheck.default.checked;
				}
			}
		}
	}
	
	synchshowdefault() {
		if (this.showcheck.default) {
			let vChecked = true;
			
			for (let vKey of Object.keys(this.showcheck)) {
				if (vKey != "default") {
					vChecked = vChecked && this.showcheck[vKey].checked;
				}
			}
			
  			this.showcheck.default.checked = vChecked;
		}
	}
	
	getshowIDs() {
		return Object.keys(this.showcheck).filter(vKey => this.showcheck.default.checked || this.showcheck[vKey].checked);
	}
	
	async applyPermissions() {
		let vCurrentPermission = {};
		
		let vUsers = this.relevantUsers(true);
		
		for (let vUserID of vUsers.map(vUser => vUser.id)) {
			vCurrentPermission[vUserID] = this.selector[vUserID].value;
		}
		
		await NoteManager.updateNote(this.noteID, {permissions : vCurrentPermission});
		
		NoteManager.requestNotePopup(this.noteID, this.getshowIDs());
	}
}