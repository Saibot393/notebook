import {cModuleName} from "../utils/utils.js";

export function noteCreation(pCreationCallback) {
	let vTypes = Object.keys(CONFIG[cModuleName].noteTypes);
	
	let vContent = `
			<div style="display:flex;margin-bottom:5px"> 
				<label> name </label>
				<div style="flex-grow:1"></div>
				<input type="text" name="name" placeholder="" style="width:60%" autofocus></input>
			</div>
			<div style="display:flex;margin-bottom:5px">
				<label> type </label>
				<div style="flex-grow:1"></div>
				<select name="type" style="width:60%">
	`
	for (let vType of vTypes) {
		vContent +=	`
					<option value=${vType}>
						${vType}
					</option>
					`
	}
	vContent +=	`
				</select>
			</div>
	`
	
	new Dialog({
		title: "",
		content: vContent,
		buttons : {
			accept : {
				label : "",
				icon : '<i class="fa-solid fa-check"> </i>',
				callback: (pHTML) => {
					if (pCreationCallback) {
						let vName = pHTML.find('[name="name"]').val();
						let vType = pHTML.find('[name="type"]').val();
						
						pCreationCallback(vType, {title : vName});
					}
				}
			}
		},
		default : "accept"
	}).render(true);
}

/*
export class noteCreation extends Application {
	constructor(pCreationCallBack, pOptions) {
		super(pOptions);
		
		this.vCreationCallback = pCreationCallBack;
		
		this.vOptions = pOptions;
	}
	
	//app stuff
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["notePermissionsWindow"],
			popOut: true,
			width: 300,
			height: 143,
			template: `modules/${cModuleName}/templates/default.html`,
			jQuery: true,
			//title: Translate(cWindowID + ".titles." + "VisionChannels"),
			resizable: false
		});
	}
	
	noteTypes() {
		return Object.keys(CONFIG[cModuleName].noteTypes);
	}
	
	async _render(pforce=false, poptions={}) {
		await super._render(pforce, poptions);
		
		let vMainDIV = document.createElement("div");
		vMainDIV.style.height = "100%";
		vMainDIV.style.display = "flex";
		vMainDIV.style.flexDirection = "column";
		
		let vNameDIV = document.createElement("div");
		vNameDIV.style.display = "flex";
		vNameDIV.style.flexDirection = "row";
		vNameDIV.style.marginBottom = "5px";
		
		let vNameTitle = document.createElement("a");
		vNameTitle.innerHTML = "name";
		let vNameSpacer = document.createElement("div");
		vNameSpacer.style.flexGrow = "1";
		let vNameInput = document.createElement("input");
		vNameInput.type = "text";
		vNameInput.style.width = "60%";
		
		vNameDIV.appendChild(vNameTitle);
		vNameDIV.appendChild(vNameSpacer);
		vNameDIV.appendChild(vNameInput);
		
		let vTypeDIV = document.createElement("div");
		vTypeDIV.style.display = "flex";
		vTypeDIV.style.flexDirection = "row";
		
		let vTypeTitle = document.createElement("a");
		vTypeTitle.innerHTML = "type";
		let vTypeSpacer = document.createElement("div");
		vTypeSpacer.style.flexGrow = "1";
		let vTypeSelect = document.createElement("select");
		vTypeSelect.style.width = "60%";
		for (let vType of this.noteTypes()) {
			let vOption = document.createElement("option");
			vOption.value = vType;
			vOption.innerHTML = vType;
			
			vTypeSelect.appendChild(vOption);
		}
		
		vTypeDIV.appendChild(vTypeTitle);
		vTypeDIV.appendChild(vTypeSpacer);
		vTypeDIV.appendChild(vTypeSelect);
		vTypeDIV.style.marginBottom = "7px";
		
		let vButtonDIV = document.createElement("div");
		vButtonDIV.style.display = "flex";
		vButtonDIV.style.flexDirection = "row";
		
		let vAcceptButton = document.createElement("button");
		
		let vConfirmIcon = document.createElement("i");
		vConfirmIcon.classList.add("fa-solid", "fa-check");
		
		vAcceptButton.appendChild(vConfirmIcon);
		vAcceptButton.onclick = () => {
			if (this.vCreationCallback) {
				this.vCreationCallback(vTypeSelect.value, {title : vNameInput.value});
			}
			this.close();
		};
		
		vButtonDIV.appendChild(vAcceptButton);
		
		vNameInput.onkeydown = (pEvent) => {if (pEvent.keyCode == 13) vAcceptButton.onclick()};
		
		vMainDIV.appendChild(vNameDIV);
		vMainDIV.appendChild(vTypeDIV);
		vMainDIV.appendChild(vButtonDIV);
		
		this._element[0].querySelector(".content").appendChild(vMainDIV);
	}
}
*/