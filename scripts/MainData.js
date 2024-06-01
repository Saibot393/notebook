import {cModuleName, Translate} from "./utils/utils.js";

import {basicNote} from "./components/basicNote.js";

import {noteWindow} from "./helpers/noteWindow.js";

import {textNote} from "./components/textNote.js";
import {counterNote} from "./components/counterNote.js";
import {listNote} from "./components/listNote.js";
import {sliderNote} from "./components/sliderNote.js";
import {chatNote} from "./components/chatNote.js";
import {timerNote} from "./components/timerNote.js";
import {progressclockNote} from "./components/progressclockNote.js";
import {roundcounterNote} from "./components/roundcounterNote.js";
import {macroNote} from "./components/macroNote.js";

const cNoteTypes = [textNote, counterNote, listNote, sliderNote, chatNote, timerNote, progressclockNote, roundcounterNote, macroNote];

CONFIG.debug.notebook = false;

const cNotesFlag = "notes";

const cDefaultNote = {
	type : "text",
	title : "",
	content : {},
	owner : "",
	permissions : {
		default : "none"
	},
	backColor : "white",
	notifySound : "sounds/notify.wav"
}

const cLockedProperties = ["type", "owner"];

export const cPermissionTypes = ["default", "none", "see", "edit"];

//const cTypes = ["text", "counter", "list", "slider", "battlemap", "timer", "roundcounter", "chat", "image", "macros", "freehand", "calculator(eval)"];

CONFIG[cModuleName] = {
	basicNote : basicNote,
	noteTypes : {
		/*
		text : text,
		counter : counter,
		list : list,
		slider : slider,
		chat : chat,
		timer : timer,
		progressclock : progressclock,
		roundcounter : roundcounter,
		macro : macro
		*/
	}
}

export async function cleanUserData() {
	//remove empty note flags
	let vNotes = game.user.getFlag(cModuleName, "notes");
	
	if (vNotes) {
		let vIDs = Object.keys(vNotes);
		
		for (let vID of vIDs) {
			if (vNotes[vID] == null) {
				await game.user.unsetFlag(cModuleName, `${cNotesFlag}.${vID}`);
			}
		}
	}
};

class NoteManager {
	//DECLARATIONS
	static async createNewNote(pData) {} //creates a new note, all settings not included in pData are defaulted to cDefaultNote and returns the new notes id
	
	static viewableNotes() {} //returns an object with all viewable notes
	
	static notesIDlist() {} //returns all note ids in this game
	
	static async updateNote(pID, pUpdate, pContext = {}) {} //updates pData with pUpdate of note identified iva pID (if access is granted)
	
	static requestNoteUpdate(pID, pUpdate, pContext = {}) {} //requests the owner of a Note to update
	
	static async noteUpdateRequest(pData) {} //handels the update request for a Note
	
	static deleteNote(pID) {} //deletes notes with id pID
	
	static requestNotePopup(pNoteID, pUserIDs) {} //request pUserIDs to popup notes
	
	static notePopupRequest (pData) {} //ansers a request for a note popup
	
	static popupNote(pID, pOptions = {}) {} //popups note for this player
	
	static getNote(pID, pTestPermission = false) {} //returns note identified via pID
	
	static owner(pNote) {} //returns owner of note with pID
	
	static ownsNote(pNote) {} //returns if this user owns note (either ID or Note)
	
	static isPrimeEditor(pNote) {} //returns if puser is prime editor
	
	static permissionLevel(pNote, pUserID) {} //retruns permission level of pUserID for pNote
	
	static permissionOverview(pNote) {} //returns overview of permissions
	
	static isActive(pNote) {} //if pNote is active, i.e. some who can edit it is online
	
	static canEdit(pNote, pUserID, pExplicit = false) {} //returns if user with pUserID can edit pNote (either ID or Note)
	
	static canEditSelf(pNote, pExplicit = false) {} //returns if this user can edit pNote (either ID or Note)
	
	static canSee(pNote, pUserID, pExplicit = false) {} //returns if user with pUserID can see pNote (either ID or Note)
	
	static canSeeSelf(pNote, pExplicit = false) {} //returns if this user can see pNote (either ID or Note)
	
	static canDelete(pNote, pUserID) {} //returns if user with pUserID can delete pNote (either ID or Note)
	
	static canDeleteSelf(pNote) {} //returns if this user can delete pNote (either ID or Note)
	
	//IMPLEMENTATIONS
	static async createNewNote(pData, pContext = {}) {
		let vID = game.release.generation >= 12 ? foundry.utils?.randomID() : randomID();
		
		let vData = {...cDefaultNote, ...pData, owner : game.user.id, moduleversion : game.modules.get(cModuleName)._source.version};
		
		let vContext = {...pContext};
		
		if (CONFIG[cModuleName].noteTypes[vData.type]) {
			if (!vData.title) {
				vData.title = Translate("Titles.newNote");
			}
			
			//await game.user.setFlag(cModuleName, cNotesFlag + `.${vID}`, vData);
			await game.user.update({
				flags : {
					[cModuleName] : {
						[cNotesFlag + `.${vID}`] : vData
					}
				}
			}, vContext);
			
			return vID;
		}
		else {
			console.warn(`Note type "{vData.type}" unknown, tried creating note with data:`, vData)
		}
	}
	
	static viewableNotes() {
		let vNotes = {};
		
		for (let vUser of Array.from(game.users)) {
			let vUserNotes = vUser.getFlag(cModuleName, cNotesFlag);
			
			if (vUserNotes) {
				for (let vKey of Object.keys(vUserNotes)) {
					if (vUserNotes[vKey]) {
						if (NoteManager.canSeeSelf(vUserNotes[vKey])) {
							vNotes[vKey] = {...cDefaultNote, ...vUserNotes[vKey]};
						}
					}
				}
			}
		};
		
		return vNotes;
	}
	
	static notesIDlist() {
		let vIDs = [];
		
		for (let vUser of Array.from(game.users)) {
			let vUserNotes = vUser.getFlag(cModuleName, cNotesFlag);
			
			if (vUserNotes) {
				vIDs.push(...Object.keys(vUserNotes));
			}
		}
		
		return vIDs;
	}
	
	static async updateNote(pID, pUpdate, pContext = {}) {
		if (pUpdate || pContext.delete) {
			for (let vDelete of cLockedProperties) {
				if (pUpdate?.hasOwnProperty(vDelete)) {
					delete pUpdate[vDelete];
				}
			}
			
			if (NoteManager.canEditSelf(pID)) {
				if (NoteManager.ownsNote(pID)) {
					//await game.user.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate, pContext);
					game.user.update({
						flags : {
							[cModuleName] : {
								[cNotesFlag + `.${pID}`] : pUpdate
							}
						}
					}, pContext);
				}
				else {
					if (game.user.isGM) {
						let vOwner = NoteManager.owner(pID);
						
						//await vOwner.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate, pContext);
						vOwner.update({
							flags : {
								[cModuleName] : {
									[cNotesFlag + `.${pID}`] : pUpdate
								}
							}
						}, pContext);
					}
					else {
						NoteManager.requestNoteUpdate(pID, pUpdate, pContext)
					}
				}
			}
		}
	}
	
	static requestNoteUpdate(pID, pUpdate, pContext = {}) {
		game.socket.emit("module."+cModuleName, {pFunction : "noteUpdateRequest", pData : {pNoteID : pID, pUpdate : pUpdate, pContext : pContext, pSender : game.user.id}});
	}
	
	static async noteUpdateRequest(pData) {
		let vIsUpdater = NoteManager.ownsNote(pData.pNoteID);
		
		if (vIsUpdater || game.user.isGM) {
			let vRequesterhasPermission = NoteManager.canEdit(pData.pNoteID, pData.pSender);
			
			if (vRequesterhasPermission) {
				if (vIsUpdater) {
					//await game.user.setFlag(cModuleName, cNotesFlag + `.${pData.pNoteID}`, pData.pUpdate, pData.pContext);
					game.user.update({
						flags : {
							[cModuleName] : {
								[cNotesFlag + `.${pData.pNoteID}`] : pData.pUpdate
							}
						}
					}, pData.pContext);
				}
				else {
					if (game.user.isGM) {
						let vOwner = NoteManager.owner(pData.pNoteID);
						
						if (!vOwner?.active) {
							//await vOwner.setFlag(cModuleName, cNotesFlag + `.${pID}`, pData.pUpdate, pData.pContext);
							vOwner.update({
								flags : {
									[cModuleName] : {
										[cNotesFlag + `.${pData.pNoteID}`] : pData.pUpdate
									}
								}
							}, pData.pContext);
						}
					}
				}
			}
		}
	}
	
	static deleteNote(pID) {
		if (NoteManager.canDeleteSelf(pID)) {
			NoteManager.updateNote(pID, null, {delete : true});
		}
	}
	
	static requestNotePopup(pNoteID, pUserIDs) {
		game.socket.emit("module."+cModuleName, {pFunction : "notePopupRequest", pData : {pNoteID : pNoteID, pUserIDs : pUserIDs, pSender : game.user.id}});
	}
	
	static notePopupRequest (pData) {
		if (pData.pUserIDs?.includes(game.user.id)) {
			let vSender = game.users.get(pData.pSender);
			let vNoteID = pData.pNoteID;
			
			if (vSender?.isGM) {
				NoteManager.popupNote(vNoteID, {ishowpopup : true});
			}
		}
	}
	
	static popupNote(pID, pOptions = {}) {
		let vNote = NoteManager.getNote(pID);
		
		if (vNote) {
			new noteWindow(pID, vNote, pOptions).render(true);
		}
	}
	
	static getNote(pID, pTestPermission = false) {
		if (!pTestPermission || NoteManager.canSeeSelf(pID)) {
			let vUsers = Array.from(game.users);
			
			let vNote;
			
			let i = 0;
			
			while (i < vUsers.length && !vNote) {
				let vUser = vUsers[i];
				
				vNote = vUser.getFlag(cModuleName, cNotesFlag + `.${pID}`);

				i = i + 1;
			}
			
			return {...cDefaultNote, ...vNote};
		}
	}
	
	static owner(pNote) {
		if (pNote?.owner) {
			return game.users.get(pNote.owner);
		}
		
		if (game.user.getFlag(cModuleName, cNotesFlag + `.${pNote}`)?.owner == game.user.id) {
			return game.user;
		}
		
		let vNote = NoteManager.getNote(pNote);
		
		if (vNote) {
			return game.users.get(vNote.owner);
		}
	}
	
	static ownsNote(pNote) {
		if (typeof pNote == "string") {
			return game.user.getFlag(cModuleName, cNotesFlag + `.${pNote}`)?.owner == game.user.id;
		}
		
		if (typeof pNote == "object") {
			return game.user.id == pNote.owner;
		}
	}
	
	static isPrimeEditor(pNote) {
		let vOwner = NoteManager.owner(pNote);
		
		if (vOwner.isSelf) {
			return true;
		}
		
		if (!vOwner.active) {
			return Array.from(game.users).find(vUser => vUser.isGM)?.isSelf
		}
		
		return false;
	}
	
	static permissionLevel(pNote, pUserID) {
		let vNote;
		
		if (typeof pNote == "string") {
			vNote = NoteManager.getNote(pNote);
		}
		
		if (typeof pNote == "object") {
			vNote = pNote;
		}
		
		if (vNote) {
			if (NoteManager.ownsNote(vNote)) {
				return "owner";
			}
			
			let vLevel = vNote.permissions ? vNote.permissions[pUserID] : undefined;
			
			if (!vLevel || vLevel == "default") {
				vLevel = vNote.permissions?.default || cPermissionTypes[1];
			}
			
			return vLevel;
		}
	}
	
	static permissionOverview(pNote) {
		let vOverview = ``;
		
		let vOwner = game.users.get(pNote.owner);
		
		if (vOwner) {
			vOverview = vOverview + `<b>${Translate("Titles.owner")}:</b> ${vOwner.name}${vOwner.isSelf ? ` [${Translate("Titles.self")}]` : ""}`
		}
		else {
			vOverview = vOverview + `<b>${Translate("Titles.owner")}:</b> ???`
		}
		
		let vEdit = [];
		
		let vSee = [];
		
		for (let vKey of Array.from(game.users.keys()).filter(vKey => (vKey != pNote.owner) && !game.users.get(vKey).isGM)) {
			let vPermission = pNote.permissions[vKey] || pNote.permissions.default;
			
			if (vPermission == "default") {
				vPermission = pNote.permissions.default;
			}
			
			switch(vPermission) {
				case "edit" :
					vEdit.push(game.users.get(vKey));
					break;
				case "see" :
					vSee.push(game.users.get(vKey));
					break;
			}
		}
		
		if (vEdit.length) {
			vOverview = vOverview + `<br><b>${Translate("Titles.editor")}</b>`;
			
			for (let vEditor of vEdit) {
				vOverview = vOverview + `<br>• ${vEditor.name}${vEditor.isSelf ? ` [${Translate("Titles.self")}]` : ""}`
			}
		}
		
		if (vSee.length) {
			vOverview = vOverview + `<br><b>${Translate("Titles.seer")}</b>`;
			
			for (let vSeer of vSee) {
				vOverview = vOverview + `<br>• ${vSeer.name}${vSeer.isSelf ? ` [${Translate("Titles.self")}]` : ""}`
			}
		}
		
		return vOverview;
	}
	
	static isActive(pNote) {
		if (game.user.isGM) {
			return true;
		}
		
		let vNote;
		
		if (typeof pNote == "string") {
			vNote = NoteManager.getNote(pNote);
		}
		
		if (typeof pNote == "object") {
			vNote = pNote;
		}
		
		if (vNote) {
			if (game.user.id == vNote.owner) {
				return true;
			}
			
			let vActiveUser = Array.from(game.users).filter(vUser => vUser.active);
			
			return vActiveUser.find(vUser => vUser.isGM || vUser.id == vNote.owner);
		}
		
		return false;
	}
	
	static canEdit(pNote, pUserID, pExplicit = false) {
		if (!pExplicit && game.users.get(pUserID)?.isGM) {
			return true;
		}
		
		let vNote;
		
		if (typeof pNote == "string") {
			vNote = NoteManager.getNote(pNote);
		}
		
		if (typeof pNote == "object") {
			vNote = pNote;
		}
		
		if (vNote) {
			return ["owner", "edit"].includes(NoteManager.permissionLevel(vNote, pUserID));
		}
	}
	
	static canEditSelf(pNote, pExplicit = false) {
		return NoteManager.canEdit(pNote, game.user.id, pExplicit);
	}
	
	static canSee(pNote, pUserID, pExplicit = false) {
		if (!pExplicit && game.users.get(pUserID)?.isGM) {
			return true;
		}
		
		let vNote;
		
		if (typeof pNote == "string") {
			vNote = NoteManager.getNote(pNote);
		}
		
		if (typeof pNote == "object") {
			vNote = pNote;
		}
		
		if (pNote) {
			return ["owner", "edit", "see"].includes(NoteManager.permissionLevel(vNote, pUserID));
		}
	}
	
	static canSeeSelf(pNote, pExplicit = false) {
		return NoteManager.canSee(pNote, game.user.id, pExplicit);
	}
	
	static canDelete(pNote, pUserID) {
		if (game.users.get(pUserID)?.isGM) {
			return true;
		}
		
		let vNote;
		
		if (typeof pNote == "string") {
			vNote = NoteManager.getNote(pNote);
		}
		
		if (typeof pNote == "object") {
			vNote = pNote;
		}
		
		if (vNote) {
			return vNote.owner == pUserID;
		}
	}
	
	static canDeleteSelf(pNote) {
		return NoteManager.canDelete(pNote, game.user.id);
	}
}

Hooks.on("updateUser", (pUser, pChanges, pContext) => {
	if (pChanges.flags && pChanges.flags[cModuleName] && pChanges.flags[cModuleName][cNotesFlag]) {
		let vNoteUpdates = pChanges.flags[cModuleName][cNotesFlag];

		for (let vKey of Object.keys(vNoteUpdates)) {
			let vPermission = pUser.flags[cModuleName][cNotesFlag][vKey]?.permissions ? Boolean(pUser.flags[cModuleName][cNotesFlag][vKey].permissions[game.user.id]) : undefined;
			let vDeletion = !pChanges.flags[cModuleName][cNotesFlag][vKey];

			Hooks.call(cModuleName + ".updateNote", {...pUser.flags[cModuleName][cNotesFlag][vKey], id : vKey}, {...vNoteUpdates[vKey]}, {...pContext, permission : vPermission, deletion : vDeletion});
		}
	}
});

Hooks.once("init", () => {
	for (let vClass of cNoteTypes) {
		CONFIG[cModuleName].noteTypes[vClass.type] = vClass;
	}
	
	game.modules.get(cModuleName).api = {
		NoteManager : NoteManager
	}
	
	Hooks.callAll(cModuleName + ".notesInit", {NoteManager, basicNote});
	
	Hooks.callAll(cModuleName + ".registerNoteSettings", {NoteManager, basicNote});
});

export {NoteManager};