import {NoteManager} from "../MainData.js";

class basicNote {
	constructor(pNoteID, pNoteData) {
		this.noteID = pNoteID;
		
		this.noteData = pNoteData;
	}
	
	get isOwner() {
		NoteManager.ownsNote(this.noteData);
	}
	
	get canEdit() {
		return NoteManager.canEditSelf(this.noteData);
	}
	
	render() {
		
	}
	
	updateRender(pNewNote, pUpdate) {
		
	}
	
	updateData(pData) {
		NoteManager.updateNote(this.noteID, pData);
	}
	
	applyFilter(pFilter) {
		
	}
}