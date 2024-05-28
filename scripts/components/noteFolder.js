import {cModuleName, Translate} from "../utils/utils.js";

import {cNoteSortFlag, cFolderIcon, cNoteIcon} from "../MainTab.js";
import {NoteManager} from "../MainData.js";

const cdefaultSort = {
	id : "",
	color : "#181818",
	title : "",
	state : true,
	order : []
}

const cFolderOpenIcon = "fa-folder-open";
const cPlusIcon = "fa-plus";
const cDeleteIcon = "fa-trash-can";

						//w			g			o			r			g			b
export const cColors = ["#181818", "#909090", "#e8ae1a", "#c73443", "#34c765", "#4287f5"];

export class noteFolder {
	constructor(pID = "", pOptions = {}) {
		this.ready = false;
		
		this._folderid = "";
		
		if (pID && pID != "root") {
			this._folderid = pID;
		
			this._parentFolder = pOptions.parentFolder;
		}
		
		if (pOptions.sort && !isEmpty(pOptions.sort)) {
			if (!pOptions.sort.id || pOptions.sort.id == this.id) {
				this._sort = {...cdefaultSort, id : this.id, ...pOptions.sort};
			}
			else {
				//warning here
			}
		}
		else {
			if (this.isRoot) {
				this._sort = game.user.getFlag(cModuleName, cNoteSortFlag) || {...cdefaultSort, title : "root"};
			}
			else {
				this._sort = {...cdefaultSort};
			}
		}
		
		if (!this._sort.title) {
			this._sort.title = Translate("Titles.newFolder");
		}
		
		this._getNotes = pOptions.getNotes;
		this._createNote = pOptions.createNote;
		
		if (this.isRoot) {
			this._folders = {};
		}
		else {
			this.root.registerFolder(this);
		}
	}
	
	get id() {
		return this._folderid;
	}
	
	get idpath() {
		if (this.isRoot) {
			return "root";
		}
		
		return this.parentFolder.id + "." + this.id;
	}
	
	get isRoot() {
		return this.id == "" && !this.parentFolder;
	}
	
	get root() {
		if (this.isRoot) {
			return self;
		}
		
		return this.parentFolder;
	}
	
	get parentFolder() {
		return this._parentFolder;
	}
	
	get allParents() {
		if (this.isRoot) {
			return [];
		}
		
		return this.parentFolder.allParents.concat([this.parentFolder.id]);
	}
	
	set parentFolder(pFolder) {
		if (!this.isRoot) {
			this._parentFolder = pFolder;
		}
	}
	
	get position() {
		if (this.parentFolder) {
			this.parentFolder.positionof(this.id);
		}
		
		return 0;
	}
	
	positionof(pID) {
		if (pID) {
			let vOrder = this.order;
			for (let vIndex in vOrder) {
				if (vOrder[vIndex] == pID || vOrder[vIndex].id == pID) {
					return vIndex;
				}
			}
		}
		
		return -1;
	}
	
	get subFolders() {
		let vSubs = {};
		
		let vOrderedSub = this.order.filter(vElement => typeof vElement == "object");
		
		for (let vOrdered of vOrderedSub) {
			vSubs[vOrdered.id] = this.folders[vOrdered.id];
		}
		
		return vSubs;
	}
	
	get allsubFolders() {
		let vSubs = {};
		
		for (let vSub of Object.entries(this.subFolders)) {
			vSubs[vSub.id] = vSub;
			vSubs = {...vSubs, ...vSub.allsubFolders};
		}
		
		return vSubs;
	}

	get subNotes() {
		let vSubs = {};
		
		for (let vElement of this.order) {
			if (typeof vElement == "string") {
				if (this.notes[vElement]) {
					vSubs[vElement] = this.notes[vElement];
				}
			}
		}
		
		return vSubs;
	}
	
	get allsubNotes() {
		let vSubs = {};
		
		for (let vElement of this.order) {
			if (typeof vElement == "string") {
				if (this.notes[vElement]) {
					vSubs[vElement] = this.notes[vElement];
				}
			}
			
			if (typeof vElement == "object") {
				vSubs = {...vSubs, ...this.folders[vElement.id].allsubNotes};
			} 
		}
		
		return vSubs;
	}
	
	hasNote(pNote) {
		if (this.order.includes(pNote)) {
				return true;
		}
		
		if (typeof pNote == "object") {
			return this.hasNote(pNote.id);
		}
		
		return false;
	}
	
	folderofNote(pNote) {
		return Object.values(this.folders).find(vFolder => vFolder.hasNote(pNote));
	}
	
	get subEntries() {
		let vSubs = {};
		
		for (let vElement of this.order) {
			if (typeof vElement == "string") {
				if (this.notes[vElement]) {
					vSubs[vElement] = this.notes[vElement];
				}
			}
			if (typeof vElement == "object") {
				vSubs[vElement.id] = this.folders[vElement.id];
			}
		}
		
		return vSubs;
	}
	
	get allsubEntries() {
		let vSubs = {};
		
		for (let vElement of this.order) {
			if (typeof vElement == "string") {
				if (this.notes[vElement]) {
					vSubs[vElement] = this.notes[vElement];
				}
			}
			if (typeof vElement == "object") {
				let vSubFolder = this.folders[vElement.id];
				
				if (vSubFolder) {
					vSubs[vSubFolder.id] = this.folders[vSubFolder.id];
					vSubs = {...vSubs, ...vSubFolder.allsubEntries};
				}
			}
		}
		
		return vSubs;
	}
	
	get sort() {
		if (this._sort) {
			return {...this._sort, id : this.id};
		}
		
		return {...cdefaultSort, id : this.id, order : this.order};
	}
	
	get order() {
		if (this._sort) {
			return this._sort.order;
		}
		
		return [];
	}
	
	
	get updatedSort() {
		this.updateOrder();
		
		return this.sort;
	}
	
	get updatedOrder() {
		if (this._sort) {
			if (this.ready) this.updateOrder();
			
			return this._sort.order;
		}
		
		return [];
	}
	
	updateOrder() {
		for (let vIndex in this._sort.order) {
			if (typeof this._sort.order[vIndex] == "object") {
				let vID = this._sort.order[vIndex].id;
				this._sort.order[vIndex] = this.folders[vID].updatedSort;
			}
		}
		
		this._sort.order = this._sort.order.filter(vElement => vElement.length != 0)
	}
	
	get noteSort() {
		if (this._sort) {
			return this.order.filter(vElement => typeof vElement == "string");
		}
	}
	
	get notes() {
		if (this._getNotes) {
			return this._getNotes();
		}
		
		if (this.parentFolder) {
			return this.parentFolder.notes;
		}
		
		return {};
	}
	
	get folders() {
		if (this.isRoot) {
			return this._folders;
		}
		
		return this.parentFolder.folders;
	}
	
	registerFolder(pFolder) {
		if (pFolder?.id) {
			if (this.isRoot) {
				this._folders[pFolder.id] = pFolder;

				return true;
			}
			else {
				return this.parentFolder.registerFolder(pFolder);
			}
		}	
	}
	
	deregisterFolder(pID) {
		if (this.isRoot) {
			let vFolder = this._folders[pID];
			
			if (vFolder) {
				delete this._folders[pID];
				
				return vFolder;
			}
		}
		else {
			return this.parentFolder.deregisterFolder(pID);
		}	
	}

	get element() {
		return this._element;
	}
	
	get title() {
		if (this.isRoot) {
			return "root";
		}
		
		return this.sort.title;
	}
	
	set title(pTitle) {
		this._sort.title = pTitle;
		
		this.save();
		
		this.synchTitle();
	}
	
	get state() {
		if (this.isRoot) {
			return true;
		}
		
		return this.sort.state;
	}
	
	set state(pState) {
		this._sort.state = pState;
		
		this.save();
		
		this.synchState();
	}
	
	toggleState() {
		this.state = !this.state;
	}
	
	get color() {
		return this.sort.color;
	}
	
	set color(pColor) {
		this._sort.color = pColor;
		
		this.save();
		
		this.synchColor();
	}
	
	get rank() {
		if (this.parentFolder) {
			return this.parentFolder.rank + 1;
		}
		
		if (!this.isRoot) {
			//this should not happen, panic is appropiate
			console.warn(`strange occurance at rank 0 folder [${this.id}]`);
		}
		
		return 0;
	}

	findsubFolder(pID) {
		return Object.entries(this.allsubFolders).find(vFolder => vFolder.id == pID);
	}
	
	findFolder(pID) {
		if (pID == "root") {
			return this.root;
		}
		return Object.entries(this.folders).find(vFolder => vFolder.id == pID);
	}
	
	async save() {
		if (this.isRoot) {
			this.updateOrder();
			
			return await game.user.setFlag(cModuleName, cNoteSortFlag, this.sort);
		}
		else {
			return await this.parentFolder.save();
		}
	}
	
	reduceOrder(pSave = false) {
		let vIDs = NoteManager.notesIDlist();
		
		let vOldOrder = this._sort.order.filter(vEntry => (typeof vEntry != "string") || vIDs.includes(vEntry));
		let vNewOrder = [];
		
		while (vOldOrder.length > 0) {
			let vElement = vOldOrder.shift();
			
			let vID = vElement.id || vElement;
			
			if (!vNewOrder.find(vEntry => vEntry == vID || vEntry.id == vID)) {
				vNewOrder.push(vElement);
			}
		}
		
		this._sort.order = vNewOrder;
		
		if (pSave) {
			this.save();
		}
	}
	
	render() {
		this._element = document.createElement("div");
		this._element.style.width = "100%";
		this._element.style.height = "auto";
		if (this.isRoot) {
			this._element.style.height = "100%";
			this._element.style.overflowY = "auto";
		}
		this._element.id = this.id || "root";
		this._element.style.border = "solid black 1px";
		
		if (!this.isRoot) {
			this.captionElement = document.createElement("div");
			this.captionElement.draggable = true;
			this.captionElement.style.height = "38px";
			this.captionElement.style.padding = "6px";
			this.captionElement.style.display = "flex";
			this.captionElement.style.textAlign = "center";
			this.captionElement.ondragstart = (event) => {
				event.dataTransfer.setData("text/plain", JSON.stringify({
					id : this.id,
					isFolder : true
				}));
			};
			this.captionElement.ondrop = (pEvent) => {
				if (this.state) {
					pEvent.stopPropagation();
					this.onHeaderDrop(pEvent);
				}
			}
			this.captionElement.onclick = () => {
				this.toggleState();
			}
			
			this.renderCaption();
		}
		
		this.mainElement = document.createElement("ol");
		this.mainElement.style.padding = "0px";
		this.mainElement.style.margin = "0px";
		this.mainElement.style.minHeight = "30px";
		if (!this.isRoot) {
			this.mainElement.style.borderLeftWidth = "3px";
			this.mainElement.style.borderLeftStyle = "solid";
			this.mainElement.style.paddingTop = "5px"
		}
		else {
			this.mainElement.style.minHeight = "100%";
		}
		this.mainElement.ondrop = (pEvent) => {
			pEvent.stopPropagation();
			this.onEntriesDrop(pEvent);
		}
		
		if (this.captionElement) this.element.appendChild(this.captionElement);
		if (this.mainElement) this.element.appendChild(this.mainElement);
		
		this.reduceOrder();
		
		this.applyOrder(true);
		
		if (!this.isRoot) {
			this.synchFolder();
		}
		
		this.ready = true;
		
		if (this.isRoot) {
			this.sortUnsorted();
			
			this.save();
		}
	}
	
	renderCaption() {
		this.captionElements = {};
		
		this.captionElements.icon = document.createElement("i");
		this.captionElements.icon.classList.add("fa-solid");
		this.captionElements.icon.style.margin = "auto";
		this.captionElements.icon.style.marginRight = "10px";
		
		this.captionElements.title = document.createElement("input");
		this.captionElements.title.style.background = "rgb(0,0,0, 0)";
		this.captionElements.title.style.color = "white";
		this.captionElements.title.style.minWidth = "25%";
		this.captionElements.title.style.flexGrow = "2.5";
		this.captionElements.title.style.width = "0";
		this.captionElements.title.style.border = "1px grey solid";
		this.captionElements.title.onblur = () => {
			this.title = this.captionElements.title.value;
		}
		this.captionElements.title.onclick = (pEvent) => {
			pEvent.stopPropagation();
		}
		
		const cColorSize = 10;
		this.captionElements.color = document.createElement("div");
		this.captionElements.color.id = "colorchoice";
		this.captionElements.color.style.gridTemplateColumns = `repeat(3, ${cColorSize}px)`;
		this.captionElements.color.style.display = "grid";
		this.captionElements.color.style.margin = "1px";
		this.captionElements.color.style.paddingTop = "1px";
		this.captionElements.color.style.border = "1px grey solid";
		this.captionElements.color.style.marginLeft = "3px";
		this.captionElements.onclick = (pEvent) => {this.captionElement.onclick(pEvent)};
		for (let vColor of cColors) {
			let vColorDiv = document.createElement("div");
			vColorDiv.style.width = `${cColorSize}px`;
			vColorDiv.style.height = `${cColorSize}px`;
			vColorDiv.style.borderRadius = "50%";
			vColorDiv.style.backgroundColor = vColor;
			vColorDiv.onclick = (pEvent) => {pEvent.stopPropagation(); this.color = vColor};
			
			this.captionElements.color.appendChild(vColorDiv);
		}

		
		let vSpacer = document.createElement("div");
		vSpacer.style.flexGrow = "1";
		
		this.captionElements.newfolder = document.createElement("a");
		this.captionElements.newfolder.style.position = "relative";
		this.captionElements.newfolder.style.margin = "auto";
		this.captionElements.newfolder.style.marginLeft = "5px";
		this.captionElements.newfolder.style.marginRight = "5px";
		let vNewFolderIcon = document.createElement("i");
		vNewFolderIcon.classList.add("fa-solid", cFolderIcon);
		let vNFPlusIcon = document.createElement("i");
		vNFPlusIcon.classList.add("fa-solid", cPlusIcon);
		vNFPlusIcon.style.position = "absolute";
		vNFPlusIcon.style.top = "-2px";
		vNFPlusIcon.style.right = "-2px";
		vNFPlusIcon.style.fontSize = "0.5rem";
		vNFPlusIcon.style.background = "black";
		vNFPlusIcon.style.padding = "1px";
		vNFPlusIcon.style.borderRadius = "4px";
		this.captionElements.newfolder.appendChild(vNewFolderIcon);
		this.captionElements.newfolder.appendChild(vNFPlusIcon);
		this.captionElements.newfolder.onclick = (pEvent) => {
			pEvent.stopPropagation();
			this.createFolder();
		}
		
		this.captionElements.newnote = document.createElement("a");
		this.captionElements.newnote.style.position = "relative";
		this.captionElements.newnote.style.margin = "auto";
		this.captionElements.newnote.style.marginLeft = "5px";
		this.captionElements.newnote.style.marginRight = "5px";
		let vNewNoteIcon = document.createElement("i");
		vNewNoteIcon.classList.add("fa-solid", cNoteIcon);
		let vNNPlusIcon = document.createElement("i");
		vNNPlusIcon.classList.add("fa-solid", cPlusIcon);
		vNNPlusIcon.style.position = "absolute";
		vNNPlusIcon.style.top = "-2px";
		vNNPlusIcon.style.right = "-2px";
		vNNPlusIcon.style.fontSize = "0.5rem";
		vNNPlusIcon.style.background = "black";
		vNNPlusIcon.style.padding = "1px";
		vNNPlusIcon.style.borderRadius = "4px";
		this.captionElements.newnote.appendChild(vNewNoteIcon);
		this.captionElements.newnote.appendChild(vNNPlusIcon);
		this.captionElements.newnote.onclick = (pEvent) => {
			pEvent.stopPropagation();
			this.createNote(this.id);
		}
		
		let vDelete = document.createElement("a");
		vDelete.style.position = "relative";
		vDelete.style.margin = "auto";
		vDelete.style.marginLeft = "5px";
		let vDeleteIcon = document.createElement("i");
		vDeleteIcon.classList.add("fa-solid", cDeleteIcon);
		vDeleteIcon.onclick = () => {
			this.delete();
		}
		vDelete.appendChild(vDeleteIcon);
		
		this.captionElement.appendChild(this.captionElements.icon);
		this.captionElement.appendChild(this.captionElements.title);
		this.captionElement.appendChild(this.captionElements.color);
		this.captionElement.appendChild(vSpacer);
		this.captionElement.appendChild(this.captionElements.newfolder);
		this.captionElement.appendChild(this.captionElements.newnote);
		this.captionElement.appendChild(vDelete);

		this.captionElements.newfolder.style.visibility = "hidden";
		this.captionElements.newnote.style.visibility = "hidden";
	}
	
	synchFolder() {
		this.synchState();
		
		this.synchTitle();
		
		this.synchColor();
	}
	
	synchState() {
		if (this.state) {
			this.mainElement.style.display = "";
			this.captionElements.icon.classList.remove(cFolderIcon);
			this.captionElements.icon.classList.add(cFolderOpenIcon);
			this.captionElements.newfolder.style.visibility = "visible";
			this.captionElements.newnote.style.visibility = "visible";
		}
		else {
			this.mainElement.style.display = "none";
			this.captionElements.icon.classList.remove(cFolderOpenIcon);
			this.captionElements.icon.classList.add(cFolderIcon);
			this.captionElements.newfolder.style.visibility = "hidden";
			this.captionElements.newnote.style.visibility = "hidden";
		}
	}
	
	synchTitle() {
		if (this.captionElements.title.value != this.title) {
			this.captionElements.title.value = this.title;
		}
	}
	
	synchColor() {
		if (this.captionElement.style.backgroundColor != this.color) {
			this.captionElement.style.backgroundColor = this.color;
		}
		
		if (this.mainElement.style.borderLeftColor != this.color) {
			this.mainElement.style.borderLeftColor = this.color;
		}
	}
	
	async createNote(pFolderID = "") {
		if (this._createNote) {
			await this._createNote({targetFolder : pFolderID});
		}
		else {
			if (!this.isRoot) {
				await this.parentFolder.createNote(pFolderID);
			}
		}
	}
	
	createFolder(pOptions = {}) {
		let vFolder = new noteFolder(randomID(), {sort : pOptions, parentFolder : this});
		
		vFolder.render();
		
		this.addFolder(vFolder.id, {position : 0, saveNewOrder : true, applyOrder : true});
	}
	
	addFolder(pID, pOptions = {}) {
		if (pID == this.id || this.allParents.includes(pID)) return false;
		
		let vOptions = {position : 0, removeOld : true, saveNewOrder : true, applyOrder : true, ...pOptions};
		
		let vOffset = 0;
		
		let vFolder = this.folders[pID];
		
		if (vFolder && vFolder.id == pID) {
			if (vOptions.removeOld && vFolder.parentFolder) {
				if (vFolder.parentFolder == this && this.positionof(vFolder.id) < vOptions.position) {
					vOffset = -1;
				}
				vFolder.parentFolder.removeFolder(vFolder.id, {saveNewOrder : false});
			}
			let vOldOrder = this.updatedOrder;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.position + vOffset));

			let vNewOrder = [...vOldOrder.slice(0, vPosition), vFolder.sort, ...vOldOrder.slice(vPosition, vOldOrder.length)];

			vFolder.parentFolder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.save();
			}
			
			if (vOptions.applyOrder) {
				this.applyOrder();
			}
			
			return vFolder;
		}
		
		return false;
	}
	
	addNote(pID, pOptions = {}) {
		let vOptions = {position : 0, removeOld : true, saveNewOrder : true, applyOrder : true, ...pOptions};
		
		let vOffset = 0;
		
		let vNote = this.notes[pID];
		
		if (vNote && vNote.id == pID) {
			if (vOptions.removeOld && vNote.folder) {
				if (vNote.folder == this && this.positionof(vNote.id) < vOptions.position) {
					vOffset = -1;
				}
				vNote.folder.removeNote(vNote.id, {saveNewOrder : false});
			}
			
			let vOldOrder = this.updatedOrder;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.position + vOffset));
			
			let vNewOrder = [...vOldOrder.slice(0, vPosition), vNote.id, ...vOldOrder.slice(vPosition, vOldOrder.length)];
			
			vNote.folder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.save();
			}
			
			if (vOptions.applyOrder) {
				this.applyOrder();
			}
			
			return vNote;
		}
		
		return false;
	}
	
	checkNote(pID, pContext = {}) {
		if (this.isRoot) {
			let vNote = this.notes[pID];
			
			if (!vNote.folder) {
				let vFolder = this.folderofNote(vNote);
				
				if (vFolder) {
					vFolder.applyOrder();
				}
				else {
					let vTargetFolder;
					
					if (pContext.targetFolder) {
						vTargetFolder = this.folders[pContext.targetFolder];
					}
					
					if (vTargetFolder) {
						vTargetFolder.addNote(pID);
					}
					else {
						this.addNote(pID);
					}
				}
			}
		}
		else {
			this.root.checkNote(pID);
		}
	}
	
	addEntries(pEntries, pOptions) {
		let vOptions = {position : 0, removeOld : true, saveNewOrder : true, applyOrder : false, ...pOptions};
		
		let vAddedElements = [];
		
		for (let vEntry of pEntries) {
			let vAdded;
			
			if (typeof vEntry == "string") {
				vAdded = this.addNote(vEntry, {...vOptions, position : vOptions.position + vAddedElements.length, saveNewOrder : false, applyOrder : false})
			}
			
			if (typeof vEntry == "object") {
				vAdded = this.addFolder(vEntry.id, {...vOptions, position : vOptions.position + vAddedElements.length, saveNewOrder : false, applyOrder : false})
			}
			
			if (vAdded) {
				vAddedElements.push(vAdded);
			}
		}
		
		if (vOptions.saveNewOrder) {
			this.save();
		}
		
		if (vOptions.applyOrder) {
			this.applyOrder();
		}
		
		return vAddedElements;
	}
	
	removeFolder(pID, pOptions = {}) {
		let vOptions = {saveNewOrder : true, ...pOptions};
		
		let vSubFolder = this.subFolders[pID];

		if (vSubFolder && vSubFolder.id == pID) {
			this._sort.order = this._sort.order.filter(vElement => vElement.id != pID);
			
			if (vOptions.saveNewOrder) {
				this.save();
			}
			
			return vSubFolder;
		}
		
		return false;
	}
	
	removeNote(pID, pOptions = {}) {
		let vOptions = {saveNewOrder : true, ...pOptions};
		
		if (this._sort.order.find(vElement => vElement == pID)) {
			this._sort.order = this._sort.order.filter(vElement => vElement != pID);
			
			if (vOptions.saveNewOrder) {
				this.save();
			}
			
			this.notes[pID].folder = undefined;
			
			return this.notes[pID];
		}
		
		return false;
	}
	
	applyOrder(papplySubOrder = false) {
		if (this.mainElement) {
			for (let vElement of this.order) {
				if (typeof vElement == "string") {
					if (this.notes[vElement]) {
						this.mainElement.appendChild(this.notes[vElement].element);
						this.notes[vElement].folder = this;
					}
				}
				
				if (typeof vElement == "object") {
					if (!this.folders[vElement.id]) {
						let vFolder = new noteFolder(vElement.id, {parentFolder : this, sort : vElement});
						
						vFolder.render();
					}
					this.mainElement.appendChild(this.folders[vElement.id].element);
					
					if (papplySubOrder) {
						this.folders[vElement.id].papplySubOrder;
					}
				}
			}
			
			return true;
		}
		
		return false;
	}
	
	sortUnsorted(pSave = false) {
		if (this.isRoot) {
			let vUnsorted = Object.values(this.notes).filter(vNote => !vNote.folder);

			if (vUnsorted.length) {
				let vNewOrder = this.updatedOrder;
				
				for (let vNote of vUnsorted) {
					if (vNote.valid) {
						vNewOrder.unshift(vNote.id);
						this.mainElement.prepend(vNote.element);
						vNote.folder = this;
					}
				}
				
				this._sort.order = vNewOrder;
				
				if (pSave) {
					this.save();
				}
			}
		}
		else {
			this.root.sortUnsorted();
		}
	}
	
	onHeaderDrop(pEvent) {
		let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
		
		if (vDropData?.isNote || vDropData?.isFolder) {
			if (vDropData.isNote) {
				this.addNote(vDropData.id);
			}
			if (vDropData.isFolder) {
				this.addFolder(vDropData.id);
			}
		}
	}
	
	onEntriesDrop(pEvent) {
		let vDropData = pEvent.dataTransfer.getData("text/plain") ? JSON.parse(pEvent.dataTransfer.getData("text/plain")) : undefined;
		
		if (vDropData?.isNote || vDropData?.isFolder) {
			let vY = pEvent.pageY;
			
			let vPosition = this.ytoPosition(vY);

			if (vDropData.isNote) {
				this.addNote(vDropData.id, {position : vPosition});
			}
			if (vDropData.isFolder) {
				this.addFolder(vDropData.id, {position : vPosition});
			}
		}
	}
	
	ytoPosition(pY) {
		let vEntries = Object.values(this.subEntries);
		
		let i = 0;
		
		let vBeforeCenter = false;
		
		while (i < vEntries.length && !vBeforeCenter) {
			let vRectangle =  vEntries[i].element.getBoundingClientRect();
			
			let vMiddle = vRectangle.top + vRectangle.height/2;
			vBeforeCenter = pY < vMiddle;
			
			if (!vBeforeCenter) {
				i = i+1;
			}
		}
		
		return i;
	}
	
	applyFilter(pFilter) {
		if (this.element) {
			let vElements = Object.values(this.subEntries);
			let vSelfMatch = !pFilter?.match || pFilter.match({
				title : this.title,
				color : this.color
			});
			
			let vMatch = vSelfMatch;
			
			for (let vElement of vElements) {
				if (vElement instanceof noteFolder) {
					vMatch = vElement.applyFilter(pFilter) || vMatch;
				}
				else {
					if (vSelfMatch) {
						//if folder matches all non folder elements match
						vElement.applyFilter(true);
					}
					else {
						vMatch = vElement.applyFilter(pFilter) || vMatch;
					}
				}
			}
			
			if (!this.isRoot) {
				if (!vMatch) {
					this.element.style.display = "none";
					return false;
				}
				else {
					this.element.style.display = "";
				}
			}
		}
		
		return true;
	}
	
	delete(pShiftContent = true) {
		if (!this.isRoot) {
			let vRoot = this.root;
			
			if (pShiftContent) {
				this.parentFolder.addEntries(this.order, {position : this.position, removeOld : false, saveNewOrder : false, applyOrder : true});
			}
			
			this.parentFolder.removeFolder(this.id, {saveNewOrder : true});
			
			this.element.remove();
			
			vRoot.deregisterFolder(this.id);
		}
		else {
			console.warn(`Please do not delete this root folder, otherwise bad things will happen (this is not a threat)`);
		}
	}
}