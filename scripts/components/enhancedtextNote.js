import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

let vMaxTextLength = 20000;

export class enhancedtextNote extends basicNote {
	constructor(...args) {
		super(...args);
		
		this._editMode = false;
	}
	
	get windowedAMH() {
		return false; //if being windowed should always be treated as always(A) having a mouse(M) hover(H) the note (AMH)
	}
	
	get icon() {
		return "fa-arrow-up-right-from-square";
	}
	
	get defaultContent() {
		return {
			text : "Test @UUID[Item.37KBvOIHZa3yyM9n]{New Item}"
		};
	}
	
	get text() {
		return this.content.text;
	}
	
	set text(pText) {
		this.updateContent({text : pText});
	}
	
	get JournalPage() {
		return {
			content : this.text
		};
	}
	
	get activeEdit() {
		return this._editMode && this.canEdit;
	}
	
	renderContent() {
		let vTextDIV = document.createElement("div");
		vTextDIV.style.display = "flex";
		vTextDIV.style.height = "100%";
		vTextDIV.style.padding = "5px";
		
		let venhancedText = document.createElement("div");
		venhancedText.style.width = "100%";
		venhancedText.style.backgroundColor = this.color;
		venhancedText.style.resize = "none";
		venhancedText.style.borderRadius = "0";
		venhancedText.style.color = "black";
		venhancedText.style.minHeight = this.smallHeightLimit;
		venhancedText.style.lineHeight = "21px";
		
		let vtextInput = document.createElement("textarea");
		vtextInput.style.width = "100%";
		vtextInput.style.borderRadius = "0";
		vtextInput.style.borderColor = this.primeColor;
		vtextInput.style.resize = "none";
		vtextInput.ondrop = (pEvent) => {this.onDataDrop(pEvent)};
		
		let veditButton = document.createElement("i");
		veditButton.classList.add("fa-solid");
		veditButton.style.top = "0px";
		veditButton.style.right = "0px";
		veditButton.style.marginLeft = "3px";
		veditButton.style.color = this.primeColor;
		veditButton.onclick = () => {
			this.toggleEditMode();
		}
		veditButton.oncontextmenu = () => {
			this.toggleEditMode(false);
		}
		
		vTextDIV.appendChild(venhancedText);
		vTextDIV.appendChild(vtextInput);
		vTextDIV.appendChild(veditButton);
		this.mainElement.appendChild(vTextDIV);
		
		this.contentElements.enhancedtext = venhancedText;
		this.contentElements.textinput = vtextInput;
		this.contentElements.editbutton = veditButton;
		this.contentElements.textdiv = vTextDIV;
		
		this.synchEditMode();
	}
	
	toggleEditMode(pSave = true) {
		if (this.canEdit) {
			if (this._editMode && pSave) {
				this.text = this.contentElements.textinput.value;
			}
			
			this._editMode = !this._editMode;
		}
		else {
			this._editMode = false;
		}
		
		this.synchEditMode();
	}
	
	synchEditMode() {
		if (this.activeEdit) {
			this.contentElements.editbutton.classList.add("fa-floppy-disk");
			this.contentElements.editbutton.classList.remove("fa-pen-to-square");
			
			this.contentElements.enhancedtext.style.display = "none";
			this.contentElements.textinput.style.display = "";
		}
		else {
			this.contentElements.editbutton.classList.add("fa-pen-to-square");
			this.contentElements.editbutton.classList.remove("fa-floppy-disk");
			
			this.contentElements.enhancedtext.style.display = "";
			this.contentElements.textinput.style.display = "none";
		}
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate, pContext) {
		if (pContentUpdate.hasOwnProperty("text")) {
			this.renderEnhancedText();
			
			this.updateTextHeight();
		}
	}
	
	async renderEnhancedText() {
		this.contentElements.enhancedtext.innerHTML = await TextEditor.enrichHTML(this.text);
		this.contentElements.textinput.value = this.text;
	}
	
	async onDataDrop(pEvent) {
		if (this.activeEdit) {
			let vData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
			
			let vUUID = vData?.uuid;
			
			if (vUUID) {
				let vObject = await fromUuid(vUUID);
				
				if (vObject) {
					let vTextInsert = `@UUID[${vUUID}]{${vObject.name}}`;
					
					let vInsertPosition = this.contentElements.textinput.value.length;
					
					if (isActiveElement(this.contentElements.textinput)) {
						vPrevPosition = this.contentElements.textinput.selectionStart;
					}
					
					let vOldText = this.contentElements.textinput.value;
					
					this.contentElements.textinput.value = [vOldText.slice(0, vInsertPosition), vTextInsert, vOldText.slice(vInsertPosition)].join('');
				}
			}
		}
	}
	
	disable() {
		this.contentElements.textinput.disabled = true;
	}
	
	enable() {
		this.contentElements.textinput.disabled = false;
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover && this.canEdit) {
			this.contentElements.editbutton.style.display = "";
		}
		else {
			this.contentElements.editbutton.style.display = "none";
		}
	}
	
	updateTextHeight() {
		if (!this.windowed) {
			this.contentElements.enhancedtext.style.height = 'auto';
			this.contentElements.enhancedtext.style.height = `${this.contentElements.enhancedtext.scrollHeight+2}px`;
			
			if (isActiveElement(this.contentElements.enhancedtext) || this.isMouseHover) {
				this.contentElements.enhancedtext.style.maxHeight = this.largeHeightLimit;
			}
			else {
				this.contentElements.enhancedtext.style.maxHeight = this.smallHeightLimit;
			}
		}
	}
}