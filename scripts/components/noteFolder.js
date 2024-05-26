import {cModuleName} from "../utils/utils.js";

import {cNoteSortFlag} from "../MainTab.js";

const cdefaultSort() {
	id : "",
	color : "black",
	name : Translate("Titles.newFolder"),
	order : []
}

export class noteFolder {
	constructor(pID = "", pOptions = {}) {
		this.rendered = false;
		
		this._folderid = "";
		
		if (pID) {
			this._folderid = pID;
		
			this._parentFolder = pOptions.parentFolder;
		}
		
		if (pOptions.sort) {
			if (this._sort.id == this.id) {
				this._sort = pOptions.sort;
			}
			else {
				//warning here
			}
		}
		else {
			if (this.isRoot) {
				this._sort = game.user.getFlag(cModuleName, cNoteSortFlag);
			}
			else {
				this._sort = cdefaultSort;
			}
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
	
	set parentFolder(pFolder) {
		let vPrevRank = this.rank;
		if (!this.isRoot) {
			this._parentFolder = pFolder;
		}
		if (vPrevRank != this.rank) {
			this.updateRank();
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
			let vOrder = this.oder;
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
		
		for (vOrdered of vOrderedSub) {
			vSubs[vOrdered.id] = this.folders[vOrdered];
		}
		
		return vSubs;
	}
	
	get allsubFolders() {
		let vSubs = {};
		
		for (let vSub of Object.entries(this.subFolders)) {
			vSubs[vSub.id] = vSub;
			vSubs = {...vSubs, ...vSub.subFolders};
		}
		
		return vSubs;
	}

	get subNotes() {
		let vSubs = {};
		
		for (vElement of this.order) {
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
		
		for (vElement of this.order) {
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
	
	get sort() {
		if (this._sort) {
			return {this._sort, id : this.id, oder : this.order);
		}
		
		return cdefaultSort;
	}
	
	set sort(pSort) {
		this._sort = pSort;
		
		this.updateName();
		this.updateColor();
	}
	
	get order() {
		if (this._sort) {
			this.updateOrder();
			
			return this._sort.order;
		}
		
		return [];
	}
	
	updateOrder() {
		for (let vIndex in this._sort.order) {
			if (typeof this._sort.order[vIndex] == "object") {
				let vID = this._sort.order[vIndex].id;
				
				this._sort.order[vIndex] = this.folders[vID].sort;
			}
		}
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
		
		return this.parentFolder.folders();
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
	
	get name() {
		return this.sort.name;
	}
	
	get color() {
		return this.sort.color;
	}
	
	get rank() {
		if (this.parentFolder) {
			return this.parentFolder.rank + 1;
		}
		
		if (this.id) {
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
	
	async saveOrder() {
		if (this.isRoot) {
			await game.user.getFlag(cModuleName, cNoteSortFlag, this.sort);
		}
		else {
			await this.parentFolder.saveOrder();
		}
	}
	
	render() {
		this.element = document.createElement("div");
		
		this.captionElement = document.createElement("div");
		this.captionElement.ondragstart = (event) => {
			event.dataTransfer.setData("text/plain", JSON.stringify({
				id : this.id,
				isFolder : true
			}));
		};
		
		this.rendered = true;
	}
	
	updateName() {
		
	}
	
	updateColor() {
		
	}
	
	updateRank() {
		
	}
	
	createNote(pAdd = true) {
		let vID;
		
		if (this._createNote) {
			let vID = this._createNote();
		}
		else {
			this.parentFolder.createNote(false);
		}
		
		if (vID) {
			if (pAdd) {
				this.addNote(vID);
			}
			
			return vID;
		}
	}
	
	createFolder() {
		let vFolder = new noteFolder(randomID(), {parentFolder : this});
		
		if (this.rendered) {
			vFolder.render();
		}
		
		this.addFolder(vFolder.id, {position : 0, saveNewOrder : true, applyOrder : true});
	}
	
	delete(pShiftContent = true) {
		if (!this.isRoot) {
			if (pShiftContent) {
				this.parentFolder.addEntries(this.order, position : this.position, removeOld : false, saveNewOrder : false, applyOrder : true);
			}
			
			this.parentFolder.removeFolder(this.id, {saveNewOrder : true});
			
			this.element.remove();
		}
		else {
			console.warn(`Please do not delete this root folder, otherwise bad things will happen (this is not a threat)`);
		}
	}
	
	addFolder(pID, pOptions = {}) {
		let vOptions = {position : 0, removeOld : true, saveNewOrder : true, applyOrder : false, ...pOptions};
		
		let vFolder = this.folders[pID];
		
		if (vFolder && vFolder.id == pID) {
			if (vOptions.removeOld && vFolder.parentFolder) {
				vFolder.parentFolder.removeFolder(vFolder.id, {saveNewOrder : false});
			}
			
			let vOldOrder = this.order;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.position));
			
			vNewOrder = [...vOldOrder.slice(0, vPosition), vFolder.sort, ...vOldOrder.slice(vPosition, vOldOrder.length)];
			
			vFolder.parentFolder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.saveOrder();
			}
			
			if (vOptions.applyOrder) {
				this.applyOrder();
			}
			
			return vFolder;
		}
		
		return false;
	}
	
	addNote(pID, pOptions = {}) {
		let vOptions = {position : 0, removeOld : true, saveNewOrder : true, applyOrder : false, ...pOptions};
		
		let vNote = this.notes[pID];
		
		if (vNote && vNote.id == pID) {
			if (vOptions.removeOld && vNote.folder) {
				vNote.folder.removeNote(vNote.id, {saveNewOrder : false});
			}
			
			let vOldOrder = this.order;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.position));
			
			vNewOrder = [...vOldOrder.slice(0, vPosition), vNote.id, ...vOldOrder.slice(vPosition, vOldOrder.length)];
			
			vFolder.folder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.saveOrder();
			}
			
			if (vOptions.applyOrder) {
				this.applyOrder();
			}
			
			return vNote;
		}
		
		return false;
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
				vAdded = this.addNote(vEntry.id, {...vOptions, position : vOptions.position + vAddedElements.length, saveNewOrder : false, applyOrder : false})
			}
			
			if (vAdded) {
				vAddedElements.push(vAdded);
			}
		}
		
		if (vOptions.saveNewOrder) {
			this.saveOrder();
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
				this.saveOrder();
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
				this.saveOrder();
			}
			
			return this.notes[pID];
		}
		
		return false;
	}
	
	applyOrder(papplySubOrder = false) {
		if (this.rendered) {
			if (this.contentElement) {
				for (let vElement of this.order) {
					if (typeof vElement == "string") {
						if (this.notes[vElement]) {
							this.contentElement.appendChild(this.notes[vElement].element);
						}
					}
					
					if (typeof vElement == "object") {
						if (!this.folders[vElement.id]) {
							let vFolder = new noteFolder(vElement.id, {parentFolder : this, sort : vElement});
							
							vFolder.render();
						}
						this.contentElement.appendChild(this.folders[vElement.id].element);
						
						if (papplySubOrder) {
							this.folders[vElement.id].papplySubOrder;
						}
					}
				}
				
				return true;
			}
		}
		
		return false;
	}
}