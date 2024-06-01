import {cModuleName, isActiveElement, Translate} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

export class sliderNote extends basicNote {
	get icon() {
		return "fa-sliders";
	}
	
	static get windowOptions() {
		return {
			...super.windowOptions,
			resizable: {
				resizeX : true,
				resizeY : false
			},
			height: 100.19
		}
	}
	
	get defaultContent() {
		return {
			value : 0,
			min : -10,
			max : 10,
			step : 1
		};
	}
	
	get value(){
		return this.content.value;
	}
	
	set value(pValue) {
		let vValue = Math.round(Number(pValue)/this.step)*this.step;
		vValue = Math.min(this.max, Math.max(this.min, pValue));
		this.updateContent({value : vValue});
	}
	
	get min(){
		return this.content.min;
	}
	
	set min(pMin) {
		let vUpdate = {min : Number(pMin)};
		
		if (this.value < pMin) {
			vUpdate.value = pMin;
		}
		
		this.updateContent(vUpdate);
	}
	
	get max(){
		return this.content.max;
	}
	
	set max(pMax) {
		let vUpdate = {max : Number(pMax)};
		
		if (this.value > pMax) {
			vUpdate.value = pMax;
		}
		
		this.updateContent(vUpdate);
	}
	
	get step(){
		return this.content.step;
	}
	
	set step(pStep) {
		if (pStep > 0) {
			this.updateContent({step : Number(pStep)});
		}
	}
	
	renderContent() {
		let vSliderDIV = document.createElement("div");
		vSliderDIV.style.width = "100%";
		vSliderDIV.style.height = "auto";
		vSliderDIV.style.display = "flex";
		vSliderDIV.style.padding = "6px";
		
		let vSlider = document.createElement("input");
		vSlider.type = "range";
		vSlider.min = this.min;
		vSlider.max = this.max;
		vSlider.step = this.step;
		//vSlider.value = this.value;
		vSlider.style.flexGrowth = "1";
		vSlider.style.margin = "auto"
		vSlider.oninput = () => {
			this.value = vSlider.value;
		}
		
		let vSliderInput = document.createElement("input");
		vSliderInput.type = "number";
		//vSliderInput.value = this.value;
		vSliderInput.style.borderWidth = "2px";
		vSliderInput.style.borderRadius = "0";
		vSliderInput.style.borderColor	 = this.primeColor;
		vSliderInput.style.maxWidth = "50px";
		vSliderInput.style.marginLeft = "8px";
		vSliderInput.oninput = () => {
			if (vSliderInput.value != "") {
				this.value = vSliderInput.value;
			}
		}
		
		this.contentElements.slider = vSlider;
		this.contentElements.sliderInput = vSliderInput;
		
		vSliderDIV.appendChild(vSlider);
		vSliderDIV.appendChild(vSliderInput);
		
		let vSettingDIV = document.createElement("div");
		vSettingDIV.style.width = "100%";
		vSettingDIV.style.height = "auto";
		vSettingDIV.style.padding = "0.1px";
		
		let vSettingBar = document.createElement("div");
		vSettingBar.style.backgroundColor = this.primeColor;
		vSettingBar.style.width = "50px";
		vSettingBar.style.height = "5px";
		vSettingBar.style.borderRadius = "5px";
		vSettingBar.style.margin = "auto";
		vSettingBar.style.marginBottom = "3px";
		
		let vSettingContentDIV = document.createElement("div");
		vSettingContentDIV.style.width = "100%";
		vSettingContentDIV.style.height = "auto";
		vSettingContentDIV.style.display = "flex";
		vSettingContentDIV.style.color = this.primeColor;
		vSettingContentDIV.style.textAlign = "center";
		
		let vMinLabel  = document.createElement("label");
		vMinLabel.innerHTML = Translate("Titles.min") + ":";
		vMinLabel.style.margin = "auto";
		vMinLabel.style.marginLeft = "3px";
		vMinLabel.style.marginRight = "3px";
		
		let vMinInput = document.createElement("input");
		vMinInput.type = "number";
		vMinInput.style.flexGrowth = "1";
		//vMinInput.value = this.min;
		vMinInput.style.border = "0px";
		vMinInput.style.borderRadius = "0";
		vMinInput.style.margin = "3px";
		vMinInput.oninput = () => {
			this.min = vMinInput.value;
		}
		
		let vMaxLabel = document.createElement("label");
		vMaxLabel.innerHTML = Translate("Titles.max") + ":";
		vMaxLabel.style.margin = "auto";
		vMaxLabel.style.marginLeft = "3px";
		vMaxLabel.style.marginRight = "3px";
		
		let vMaxInput = document.createElement("input");
		vMaxInput.type = "number";
		vMaxInput.style.flexGrowth = "1";
		//vMaxInput.value = this.max;
		vMaxInput.style.border = "0px";
		vMaxInput.style.borderRadius = "0";
		vMaxInput.style.margin = "3px";
		vMaxInput.oninput = () => {
			this.max = vMaxInput.value;
		}
		
		let vStepLabel  = document.createElement("label");
		vStepLabel.innerHTML = Translate("Titles.steps") + ":";
		vStepLabel.style.margin = "auto";
		vStepLabel.style.marginLeft = "3px";
		vStepLabel.style.marginRight = "3px";
		
		let vStepInput = document.createElement("input");
		vStepInput.type = "number";
		vStepInput.style.flexGrowth = "1";
		//vStepInput.value = this.step;
		vStepInput.style.border = "0px";
		vStepInput.style.borderRadius = "0";
		vStepInput.style.margin = "3px";
		vStepInput.oninput = () => {
			this.step = vStepInput.value;
		}
		
		this.contentElements.min = vMinInput;
		this.contentElements.max = vMaxInput;
		this.contentElements.step = vStepInput;
		
		vSettingContentDIV.appendChild(vMinLabel);
		vSettingContentDIV.appendChild(vMinInput);
		vSettingContentDIV.appendChild(vMaxLabel);
		vSettingContentDIV.appendChild(vMaxInput);
		vSettingContentDIV.appendChild(vStepLabel);
		vSettingContentDIV.appendChild(vStepInput);
		
		if (!this.windowed) {
			vSettingDIV.appendChild(vSettingBar);
			
			vSettingContentDIV.style.display = "none";
			
			vSettingDIV.onmouseenter = () => {
				vSettingContentDIV.style.display = "flex";
			}
			vSettingDIV.onmouseleave = () => {
				vSettingContentDIV.style.display = "none";
			}
		}
		
		vSettingDIV.appendChild(vSettingContentDIV);
		
		this.contentElements.settings = vSettingDIV;
		
		this.mainElement.appendChild(vSliderDIV);
		this.mainElement.appendChild(vSettingDIV);
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate) {
		if (pContentUpdate.hasOwnProperty("value")) {
			if (this.contentElements.slider.value != pContentUpdate.value) {
				this.contentElements.slider.value = pContentUpdate.value;
			}
			
			if (this.contentElements.sliderInput.value != pContentUpdate.value || this.contentElements.sliderInput.value == "") {
				this.contentElements.sliderInput.value = pContentUpdate.value;
			}
		}
		
		for (let vKey of ["min", "max", "step"]) {
			if (pContentUpdate.hasOwnProperty(vKey)) {
				if (this.contentElements[vKey].value != pContentUpdate[vKey]) {
					this.contentElements[vKey].value = pContentUpdate[vKey];
				}

				if (this.contentElements.slider[vKey] != pContentUpdate[vKey]) {
					this.contentElements.slider[vKey] = pContentUpdate[vKey];
				}			
			}
		}
	}
	
	disable() {
		this.contentElements.slider.disabled = true;
		this.contentElements.sliderInput.disabled = true;
		this.contentElements.min.disabled = true;
		this.contentElements.max.disabled = true;
		this.contentElements.step.disabled = true;
	}
	
	enable() {
		this.contentElements.slider.disabled = false;
		this.contentElements.sliderInput.disabled = false;
		this.contentElements.min.disabled = false;
		this.contentElements.max.disabled = false;
		this.contentElements.step.disabled = false;
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover) {
			if (this.canEdit) {
				this.contentElements.settings.style.display = "";
			}
		}
		else {
			this.contentElements.settings.style.display = "none";
		}
	}
}