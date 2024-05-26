import {cModuleName} from "../utils/utils.js";

import {cNoteSortFlag} from "../MainTab.js";

const cDefaultFolder() {
	
}

export class noteFolder {
	constructor(pID = "", pOptions = {}) {
		this._folderid = "";
		
		if (pID) {
			this._folderid = pOptions.id;
		
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
		}
		
		this.getNotes = pOptions.getNotes;
		
		if (this.isRoot) {
			this._folders = {};
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
		this.sort
	}
	
	get sort() {
		if (this._sort) {
			return {this._sort, id : this.id, oder : this.order);
		}
		
		return {};
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
		if (this.getNotes) {
			return this.notes();
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
		
	}
	
	updateName() {
		
	}
	
	updateColor() {
		
	}
	
	updateRank() {
		
	}
	
	addFolder(pID, pOptions = {}) {
		let vOptions = {...pOptions, postion : 0, removeOld : true, saveNewOrder : false};
		
		let vFolder = this.folders[pID];
		
		if (vFolder && vFolder.id == pID) {
			if (vOptions.removeOld && vFolder.parentFolder) {
				vFolder.parentFolder.removeFolder(vFolder.id);
			}
			
			let vOldOrder = this.order;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.postion));
			
			vNewOrder = [...vOldOrder.slice(0, vPosition), vFolder.sort, ...vOldOrder.slice(vPosition, vOldOrder.length)];
			
			vFolder.parentFolder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.saveOrder();
			}
			
			return vFolder;
		}
		
		return false;
	}
	
	addNote(pID, pOptions = {postion : 0, removeOld : true, saveNewOrder : false}) {
		let vOptions = {...pOptions, postion : 0, removeOld : true, saveNewOrder : false};
		
		let vNote = this.notes[pID];
		
		if (vNote && vNote.id == pID) {
			if (vOptions.removeOld && vNote.folder) {
				vNote.folder.removeNote(vNote.id);
			}
			
			let vOldOrder = this.order;
			
			let vPosition = Math.max(0, Math.min(vOldOrder.length, vOptions.postion));
			
			vNewOrder = [...vOldOrder.slice(0, vPosition), vNote.id, ...vOldOrder.slice(vPosition, vOldOrder.length)];
			
			vFolder.folder = this;
			
			this._sort.order = vNewOrder;
			
			if (vOptions.saveNewOrder) {
				this.saveOrder();
			}
			
			return vNote;
		}
		
		return false;
	}
	
	removeFolder(pID, pOptions = {}) {
		let vOptions = {saveNewOrder : false, ...pOptions};
		
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
		let vOptions = {saveNewOrder : false, ...pOptions};
		
		if (this._sort.order.find(vElement => vElement == pID)) {
			this._sort.order = this._sort.order.filter(vElement => vElement != pID);
			
			if (vOptions.saveNewOrder) {
				this.saveOrder();
			}
			
			return this.notes[pID];
		}
		
		return false;
	}
}