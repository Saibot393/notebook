import {cModuleName} from "./utils/utils.js";

const cNotesFlag = "notes";

const cDefaultNote = {
	type : "text",
	title : "no title",
	content : {},
	owner : "",
	permissions : {},
	backColor : "white"
}

const cTypes = ["text", "counter", "slider", "battlemap", "timer", "roundcounter"];

class NoteManager {
	//DECLARATIONS
	static async createNewNote(pData) {} //creates a new note, all settings not included in pData are defaulted to cDefaultNote and returns the new notes id
	
	static viewableNotes() {} //returns an object with all viewable notes
	
	static async updateNote(pID, pUpdate, pExplicitDelete = false) {} //updates pData with pUpdate of note identified iva pID (if access is granted)
	
	static requestNoteUpdate(pID, pUpdate) {} //requests the owner of a Note to update
	
	static async noteUpdateRequest(pID, pUpdate) {} //handels the update request for a Note
	
	static deleteNote(pID) {} //deletes notes with id pID
	
	static getNote(pID, pTestPermission = false) {} //returns note identified via pID
	
	static owner(pID) {} //returns owner of note with pID
	
	static ownsNote(pNote) {} //returns if this user owns note (either ID or Note)
	
	static canEdit(pNote, pUserID, pExplicit = false) {} //returns if user with pUserID can edit pNote (either ID or Note)
	
	static canEditSelf(pNote, pExplicit = false) {} //returns if this user can edit pNote (either ID or Note)
	
	static canSee(pNote, pUserID, pExplicit = false) {} //returns if user with pUserID can see pNote (either ID or Note)
	
	static canSeeSelf(pNote, pExplicit = false) {} //returns if this user can see pNote (either ID or Note)
	
	static canDelete(pNote, pUserID) {} //returns if user with pUserID can delete pNote (either ID or Note)
	
	static canDeleteSelf(pNote) {} //returns if this user can delete pNote (either ID or Note)
	
	//IMPLEMENTATIONS
	static async createNewNote(pData) {
		let vID = randomID();
		
		let vData = {...cDefaultNote,...pData, owner : game.user.id};
		
		await game.user.setFlag(cModuleName, cNotesFlag + `.${vID}`, vData);
		
		return vID;
	}
	
	static viewableNotes() {
		let vNotes = {};
		
		for (let vUser of Array.from(game.users)) {
			let vUserNotes = vUser.getFlag(cModuleName, cNotesFlag);
			
			if (vUserNotes) {
				for (let vKey of Object.keys(vUserNotes)) {
					if (NoteManager.canSeeSelf(vUserNotes[vKey])) {
						vNotes[vKey] = vUserNotes[vKey];
					}
				}
			}
		};
		
		return vNotes;
	}
	
	static async updateNote(pID, pUpdate, pExplicitDelete = false) {
		if (pUpdate || pExplicitDelete) {
			if (NoteManager.canEditSelf(pID)) {
				if (NoteManager.owner(pID)) {
					await game.user.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate);
				}
				else {
					if (game.user.isGM) {
						let vOwner = NoteManager.owner(pID);
						
						await vOwner.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate);
					}
					else {
						NoteManager.requestUpdate(pID, pUpdate, {userID : game.user.id});
					}
				}
			}
		}
	}
	
	static requestNoteUpdate(pID, pUpdate) {
		game.socket.emit("module."+cModuleName, {pFunction : "noteUpdateRequest", pData : {pNoteID : pID, pUpdate : pUpdate, pSender : game.user.id}});
	}
	
	static async noteUpdateRequest(pData) {
		let vIsUpdater = NoteManager.ownsNote(pData.pNoteID);
		
		if (vIsUpdater || game.user.isGM) {
			let vRequesterhasPermission = NoteManager.canEdit(pData.pNoteID, pData.pSender);
			
			if (vRequesterhasPermission) {
				if (vIsUpdater) {
					await this.user.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate);
				}
				else {
					if (game.user.isGM) {
						let vOwner = NoteManager.owner(pData.pNoteID);
						
						if (!vOwner?.active) {
							await vOwner.setFlag(cModuleName, cNotesFlag + `.${pID}`, pUpdate);
						}
					}
				}
			}
		}
	}
	
	static deleteNote(pID) {
		if (NoteManager.canDeleteSelf(pID)) {
			NoteManager.updateNote(pID, null, true);
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
			
			return vNote;
		}
	}
	
	static owner(pID) {
		if (game.user.getFlag(cModuleName, cNotesFlag + `.${pID}`)?.owner == game.user.id) {
			return game.user;
		}
		
		let vNote = NoteManager.getNote(pID);
		
		if (vNote) {
			return game.users.get(vNote.owner);
		}
	}
	
	static ownsNote(pNote) {
		if (typeof pNote == "string") {
			game.user.getFlag(cModuleName, cNotesFlag + `.${pNote}`).owner == game.user.id;
		}
		
		if (typeof pNote == "object") {
			return this.user.id == pNote.owner;
		}
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
			return vNote.permissions[pUserID] == "edit" || NoteManager.ownsNote(pNote);
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
			return pNote.permissions[pUserID] == "see" || NoteManager.ownsNote(pNote);
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
		
		if (pNote) {
			return pNote.owner == pUserID;
		}
	}
	
	static canDeleteSelf(pNote) {
		return NoteManager.canDelete(pNote, game.user.id);
	}
}

Hooks.on("updateActor", (pActor, pChanges, pContext) => {
	if (pChanges.flags[cModuleName] && Changes.flags[cModuleName][cNotesFlag]) {
		let vNoteUpdates = Changes.flags[cModuleName][cNotesFlag];
		
		for (let vKey of vNoteUpdates) {
			let vPermission = pChanges.flags[cModuleName][cNotesFlag][vKey].permissions ? pChanges.flags[cModuleName][cNotesFlag][vKey].permissions[game.user.id] : undefined;
			let vDeletion = pChanges.flags[cModuleName][cNotesFlag][vKey] == null;
			
			Hooks.call(cModuleName + ".updateNote", {...pActor.flags[cModuleName][cNotesFlag][vKey], id : vKey}, {...vNoteUpdates[vKey]}, {...pContext, permission : vPermission, deletion : vDeletion});
		}
	}
});

export {NoteManager};