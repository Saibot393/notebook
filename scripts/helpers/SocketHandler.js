import { NoteManager } from "../MainData.js";

//execute functions with pData depending on pFunction
function organiseSocketEvents({pFunction, pData} = {}) {
	switch(pFunction) {
		case "noteUpdateRequest":
			NoteManager.noteUpdateRequest(pData);
			break;
		case "notePopupRequest":
			NoteManager.notePopupRequest(pData);
			break;
	}
}

Hooks.once("ready", () => { game.socket.on("module.notebook", organiseSocketEvents); });