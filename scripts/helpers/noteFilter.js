import {cModuleName, colorUtils, Translate} from "../utils/utils.js";

const cResetIcon = "fa-xmark";

const cColorRadius = Math.sqrt(3 * 10**2);

export class noteFilter {
	constructor(pApplyFilter) {
		this.applyFilter = pApplyFilter;
		
		this.render();
	}
	
	render() {
		this.element = document.createElement("div");
		this.element.style.display = "flex";
		this.element.style.flexDirection = "column";
		this.element.style.color = "var(--color-text-light-highlight)";
		
		let vMainDIV = document.createElement("div");
		vMainDIV.style.display = "flex";
		vMainDIV.style.padding = "3px";
		
		let vTitleInput = document.createElement("input");
		vTitleInput.type = "text";
		vTitleInput.style.background = "rgba(255, 255, 245, 0.8)";
		
		let vResetButton = document.createElement("i");
		vResetButton.classList.add("fa-solid", cResetIcon);
		vResetButton.style.margin = "auto";
		vResetButton.style.marginLeft = "5px";
		vResetButton.style.marginRight = "5px";
		vResetButton.onclick = () => {this.resetFilter()};
		
		vMainDIV.appendChild(vTitleInput);
		vMainDIV.appendChild(vResetButton);
		
		let vDetailDIV = document.createElement("div");
		
		this.element.appendChild(vMainDIV);
		this.element.appendChild(vDetailDIV);
		
		this.inputs = {
			title : vTitleInput
		}
		
		for (let vKey of Object.keys(this.inputs)) {
			this.inputs[vKey].oninput = () => {
				this.updateFilter();
			}
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
			this.filterData.match = (pData) => {return this.match(pData)};
		}
		
		this.startFilter();
	}
	
	startFilter() {
		if (this.applyFilter) {
			this.applyFilter(this.filterData);
		}
	}
	
	resetFilter() {
		this.inputs.title.value = "";
		
		this.filterData = {};
		
		this.startFilter();
	}
	
	match(pData) {
		if (!isEmpty(this.filterData)) {
			let vMatch = true;
			for (let vKey of Object.keys(this.filterData)) {
				vMatch = true;
				
				if (pData.hasOwnProperty(vKey)) {
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