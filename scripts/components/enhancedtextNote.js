import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

let vMaxTextLength = 20000;

const cFastNumber = {
	shift : 5,
	alt : 50
}

export class enhancedtextNote extends basicNote {
	constructor(...args) {
		super(...args);
		
		this._editMode = false;
	}
	
	get windowedAMH() {
		return false; //if being windowed should always be treated as always(A) having a mouse(M) hover(H) the note (AMH)
	}
	
	get icon() {
		return "fa-file-lines";
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
		vTextDIV.style.overflowY = "auto";
		vTextDIV.style.position = "relative";
		
		let venhancedText = document.createElement("div");
		venhancedText.style.width = "100%";
		venhancedText.style.backgroundColor = this.color;
		venhancedText.style.resize = "none";
		venhancedText.style.borderRadius = "0";
		venhancedText.style.color = "black";
		venhancedText.style.minHeight = this.smallHeightLimit;
		venhancedText.style.maxHeight = this.largeHeightLimit;
		venhancedText.style.lineHeight = "21px";
		venhancedText.onclick = (pEvent) => {this.counterClick(pEvent, "left")};
		venhancedText.oncontextmenu = (pEvent) => {this.counterClick(pEvent, "right")};
		
		let vtextInput = document.createElement("textarea");
		vtextInput.style.width = "100%";
		vtextInput.style.borderRadius = "0";
		vtextInput.style.borderColor = this.primeColor;
		vtextInput.style.resize = "none";
		vtextInput.style.height = this.largeHeightLimit;
		vtextInput.ondrop = (pEvent) => {this.onDataDrop(pEvent)};
		
		let veditButton = document.createElement("i");
		veditButton.classList.add("fa-solid");
		veditButton.style.marginLeft = "3px";
		veditButton.style.color = this.primeColor;
		veditButton.style.cursor = "pointer";
		veditButton.style.position = "absolute";
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
			
			this.contentElements.editbutton.style.top = "7px";
			this.contentElements.editbutton.style.right = "7px";
		}
		else {
			this.contentElements.editbutton.classList.add("fa-pen-to-square");
			this.contentElements.editbutton.classList.remove("fa-floppy-disk");
			
			this.contentElements.enhancedtext.style.display = "";
			this.contentElements.textinput.style.display = "none";
			
			this.contentElements.editbutton.style.top = "3px";
			this.contentElements.editbutton.style.right = "3px";
		}
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate, pContext) {
		if (pContentUpdate.hasOwnProperty("text")) {
			this.renderEnhancedText();
		}
	}
	
	async renderEnhancedText() {
		this.contentElements.enhancedtext.innerHTML = await TextEditor.enrichHTML(enhancedtextNote.enrichCounter(this.text));
		this.contentElements.textinput.value = this.text;
	}
	
	async onDataDrop(pEvent) {
		if (this.activeEdit) {
			pEvent.stopPropagation();
			
			let vTransferTypes = pEvent.dataTransfer.types;
			
			let vInsertTex = "";
			
			let vData;
			
			if (vTransferTypes.includes("text/html")) {
				let vData = pEvent.dataTransfer.getData("text/html");
				
				vInsertTex = vData;
			}
			else {
				if (vTransferTypes.includes("text/plain")) {
					try {
						vData = JSON.parse(pEvent.dataTransfer.getData("text/plain"));
					} catch (pError) {
						console.log(pError);
						
						vData = "";
					}
					
					let vUUID = vData?.uuid;
					
					if (vUUID) {
						let vObject = await fromUuid(vUUID);
						
						if (vObject) {
							vInsertTex = `@UUID[${vUUID}]{${vObject.name}}`;
						}
					}
				}
			}
			
			if (vInsertTex) {
					let vInsertPosition = this.contentElements.textinput.value.length;
					
					let vOldText = this.contentElements.textinput.value;
					
					this.contentElements.textinput.value = [vOldText.slice(0, vInsertPosition), vInsertTex, vOldText.slice(vInsertPosition)].join('');
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
			if (!this._editMode) {
				this.contentElements.editbutton.style.display = "none";
			}
		}
	}
	
	counterClick(pEvent, pClickType) {
		if (this.canEdit) {
			let vTarget = pEvent.target;
			
			if (vTarget?.classList?.contains("notebookcounter")) {
				let vChange = 0;
				
				switch (pClickType) {
					case "left":
						vChange = 1;
						break;
					case "right":
						vChange = -1;
						break;
				}
				
				let vFactor = 1;
				
				if (pEvent.shiftKey) {
					vFactor = cFastNumber.shift;
				}
				if (pEvent.altKey) {
					vFactor = cFastNumber.alt;
				}
				
				vChange = vChange * vFactor;
				
				if (vChange) {
					let vValue = Number(vTarget.getAttribute("value"));
					let vMax = vTarget.getAttribute("max");
					
					let vTextPosition = Number(vTarget.getAttribute("textposition"));
					let vTextLength = Number(vTarget.getAttribute("textlength"));
					
					vValue = vValue + vChange;
					
					let vInsertText;
					
					vValue = Math.max(vValue, 0);
					
					if (vMax != null) {
						if (pEvent.ctrlKey) {
							if (vChange < 0) {
								vValue = 0;
							}
							if (vChange > 0) {
								vValue = vMax;
							}
						}
						
						vValue = Math.min(vValue, Number(vMax));
						
						vInsertText = `[[${vValue}/${vMax}]]`;
					}
					else {
						vInsertText = `[[${vValue}]]`;
					}
					
					let vText = this.text;
					
					vText = [vText.slice(0, vTextPosition), vInsertText, vText.slice(vTextPosition + vTextLength)].join('');
					
					this.text = vText;
				}
			}
		}
	}
	
	static enrichCounter(pText) {
		let vText = pText;
		
		let cRGX = /\[\[[0-9]+\/[0-9]+\]\]|\[\[[0-9]+\]\]/g; //match [[number/number]] or [[number]]
		
		let vMatch = cRGX.exec(vText);
		while(vMatch) {
			let vPosition = vMatch.index;
			let vMatchText = vMatch[0];
			
			let vMatchContent = vMatchText.substring(2, vMatchText.length - 2);
			
			let vValue = Number(vMatchContent.split("/")[0]);
			let vMax = Number(vMatchContent.split("/")[1]);
			
			let vHTML = `
				<a class="notebookcounter" value="${vValue}" max="${vMax}" textposition="${vPosition}" textlength="${vMatchText.length}" style="border: 1px solid var(--color-border-dark-tertiary); background:#DDD; padding: 1px 4px; border-radius: 2px; white-space: nowrap; word-break: break-all">
					<i class="fas-solid fa-hashtag"> </i>
					${vMatchContent}
				</a>
			`;
			
			vText =  [vText.slice(0, vPosition), vHTML, vText.slice(vPosition + vMatchText.length)].join('');
			
			vMatch = cRGX.exec(vText);
		}
		
		return vText;
	}
}