import {cModuleName, colorUtils, Translate, isActiveElement} from "../utils/utils.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cResetIcon = "fa-xmark";

const cColorRadius = Math.sqrt(3 * 10**2);

export class noteFilter {
	constructor(pApplyFilter, pOptions = {}) {
		this.applyFilter = pApplyFilter;
		
		this._oldUI = pOptions.oldUI;
		
		this.render();
	}
	
	get useoldUI() {
		return this._oldUI;
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.style.display = "flex";
		this.element.style.flexDirection = "column";
		this.element.style.color = "var(--color-text-light-highlight)";
		if (!this.useoldUI) {
			this.element.style.paddingInline = "8px";
			this.element.style.gap = "8px";
		}
		this.element.onmouseenter = () => {vDetailDIV.style.display = "flex"};
		this.element.onmouseleave = () => {if (!Object.values(this.inputs).find(vInput => isActiveElement(vInput))) vDetailDIV.style.display = "none"};
		
		let vMainDIV = document.createElement("div");
		vMainDIV.style.display = "flex";
		vMainDIV.style.padding = "3px";
		
		let vTitleInput = document.createElement("input");
		vTitleInput.type = "text";
		vTitleInput.style.background = this.useoldUI ? "rgba(255, 255, 245, 0.8)" : "transparent";
		vTitleInput.placeholder = Translate("Titles.searchNote");
		
		let vResetButton = document.createElement("i");
		vResetButton.classList.add("fa-solid", cResetIcon);
		vResetButton.style.margin = "auto";
		vResetButton.style.marginLeft = "5px";
		vResetButton.style.marginRight = "5px";
		vResetButton.onclick = () => {this.resetFilter()};
		registerHoverShadow(vResetButton);
		
		vMainDIV.appendChild(vTitleInput);
		vMainDIV.appendChild(vResetButton);
		
		let vDetailDIV = document.createElement("div");
		vDetailDIV.style.display  = "none";
		vDetailDIV.style.padding = "3px";
		
		let vTypeSelect = document.createElement("select");
		vTypeSelect.style.flexGrow = "1";
		vTypeSelect.style.maxWidth = "110px";
		vTypeSelect.style.background = this.useoldUI ? "rgba(255, 255, 245, 0.8)" : "transparent";
		vTypeSelect.style.margin = "2px";
		vTypeSelect.style.marginLeft = "0px";
		for (let vType of ["", ...Object.keys(CONFIG.notebook.noteTypes)]) {
			let vTypeOption = document.createElement("option");
			vTypeOption.value = vType;
			vTypeOption.innerHTML = vType ? CONFIG.notebook.noteTypes[vType].displayType : "";
			vTypeSelect.appendChild(vTypeOption);
			vTypeSelect.style.background = "var(--sidebar-background, var(--color-cool-5-90))";
			vTypeSelect.style.color = "var(--color-text-primary)";
		}
		
		let vPermissionSelect = document.createElement("select");
		vPermissionSelect.style.flexGrow = "1";
		vPermissionSelect.style.maxWidth = "110px";
		vPermissionSelect.style.background = this.useoldUI ? "rgba(255, 255, 245, 0.8)" : "transparent";
		vPermissionSelect.style.margin = "2px";
		for (let vPermission of ["", "owner", "edit", "see"]) {
			let vPermissionOption = document.createElement("option");
			vPermissionOption.value = vPermission;
			vPermissionOption.innerHTML = vPermission ? Translate("Titles.permissionsTypes." + vPermission) : "";
			vPermissionSelect.appendChild(vPermissionOption);
			vPermissionSelect.style.background = "var(--sidebar-background, var(--color-cool-5-90))";
			vPermissionSelect.style.color = "var(--color-text-primary)";
		}
		
		let vOwnerSelect = document.createElement("select");
		vOwnerSelect.style.flexGrow = "1";
		vOwnerSelect.style.maxWidth = "110px";
		vOwnerSelect.style.background = this.useoldUI ? "rgba(255, 255, 245, 0.8)" : "transparent";
		vOwnerSelect.style.margin = "2px";
		for (let vOwner of [{id : ""}, ...Array.from(game.users).filter(vUser => !vUser.isSelf)]) {
			let vOwnerOption = document.createElement("option");
			vOwnerOption.value = vOwner.id;
			vOwnerOption.innerHTML = vOwner.name ? vOwner.name : "";
			vOwnerSelect.appendChild(vOwnerOption);
			vOwnerSelect.style.background = "var(--sidebar-background, var(--color-cool-5-90))";
			vOwnerSelect.style.color = "var(--color-text-primary)";
		}
		
		vDetailDIV.appendChild(vTypeSelect);
		vDetailDIV.appendChild(vPermissionSelect);
		vDetailDIV.appendChild(vOwnerSelect);
		
		this.element.appendChild(vMainDIV);
		this.element.appendChild(vDetailDIV);
		
		this.inputs = {
			title : vTitleInput,
			type : vTypeSelect,
			permission : vPermissionSelect,
			owner : vOwnerSelect
		}
		
		for (let vKey of Object.keys(this.inputs)) {
			this.inputs[vKey].oninput = () => {
				this.updateFilter();
			}
			/*
			this.inputs[vKey].onchange = () => {
				this.updateFilter();
			}
			*/
		}
	}
	
	updateFilter() {
		this.filterData = {
		}
		
		for (let vKey of Object.keys(this.inputs)) {
			if (this.inputs[vKey].value) {
				this.filterData[vKey] = this.inputs[vKey].value
			}
		}
		
		if (!isEmpty(this.filterData)) {
			this.filterData.match = (pData, patLeastOne = false) => {return this.match(pData, patLeastOne)};
		}
		
		this.startFilter();
	}
	
	startFilter() {
		if (this.applyFilter) {
			this.applyFilter(this.filterData);
		}
	}
	
	resetFilter() {
		for (let vKey of Object.keys(this.inputs)) {
			this.inputs[vKey].value = "";
		}
		
		this.filterData = {};
		
		this.startFilter();
	}
	
	match(pData, patLeastOne = false) {
		if (!isEmpty(this.filterData)) {
			let vMatch = false;
			for (let vKey of Object.keys(this.filterData)) {
				if (pData.hasOwnProperty(vKey) && vKey != "match") {
					vMatch = !patLeastOne;
					
					switch (vKey) {
						case "title" :
							vMatch = pData.title.toLowerCase().includes(this.filterData.title.toLowerCase());
							break;
						case "color" :
							vMatch = colorUtils.colorDistance(pData.color, this.filterData.color) < cColorRadius;
							break;
						case "match" :
							vMatch = true;
						default:
							vMatch = pData[vKey] == this.filterData[vKey];
							break;
					}
					
					if (pData.title == "Neuer Ordner") {
						console.log(vMatch);
					}
					
					if (!vMatch) {
						break;
					}
				}
			}
			
			return vMatch;
		}
		
		return true;
	}
}