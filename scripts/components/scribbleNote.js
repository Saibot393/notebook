import {cModuleName, isActiveElement} from "../utils/utils.js";

import {NoteManager} from "../MainData.js";
import {basicNote} from "./basicNote.js";

import {registerHoverShadow} from "../helpers/visualHelpers.js";

const cDefaultWidth = 1000;
const cDefaultHeight = 1000;
const cDistanceThreshold = 15;

export class scribbleNote extends basicNote {
	constructor(...args) {
		super(...args);
		
		this._drawing = false;
		this._currentDrawing = undefined;
	}
	
	static get windowOptions() {
		return {
			resizable: true,
			width: 313,
			height: 343
		}
	}
	
	get windowedAMH() {
		return false;
	}
	
	get defaultContent() {
		return {
			drawings : {}
		}; 
	}
	
	get drawings() {
		return this.content.drawings;
	}
	
	set drawings(pDrawings) {
		this.updateContent({drawings : pDrawings}, {updatedDrawings : Object.keys(pDrawings)});
	}
	
	get icon() {
		return "fa-pencil";
	}
	
	get isDrawing() {
		return this._drawing;
	}
	
	get currentDrawing() {
		return this._currentDrawing;
	}
	
	get drawingCount() {
		//return Math.max(...Object.keys(this.drawings).map(vKey => Number(vKey)).filter(vValue => !isNaN(vValue)));
		return Object.keys(this.drawings).length;
	}
	
	get lowestFreeDrawing() {
		let vKeys = Object.keys(this.drawings).map(vKey => Number(vKey));
		
		for (let i = 0; i <= Math.max(0,...vKeys.map(vKey => Number(vKey)).filter(vValue => !isNaN(vValue)))+1; i++) {
			if (!vKeys.includes(i)) return i;
		}
	}	
	
	get drawingColor() {
		return game.user.color;
	}
	
	deleteAllDrawings() {
		if (this.isOwner) {
			let vKeys = Object.keys(this.drawings);
		
			let vDeletes = {};
			
			for (let vKey of vKeys) {
				vDeletes["-=" + vKey] = null;
			}
			
			this.drawings = vDeletes;
		}
	}
	
	deleteOwnDrawings() {
		if (this.canEdit) {
			let vKeys = Object.keys(this.drawings).filter(vKey => this.drawings[vKey].drawer == game.user.id);
		
			let vDeletes = {};
			
			for (let vKey of vKeys) {
				vDeletes["-=" + vKey] = null;
			}
			
			this.drawings = vDeletes;
		}
	}
	
	startDrawing() {
		this._currentDrawing = this.lowestFreeDrawing;
		this.drawings = {[this.currentDrawing] : {
			drawer : game.user.id,
			color : this.drawingColor,
			points : []
		}};
		this._drawing = true;
	}
	
	stopDrawing() {
		this._drawing = false;
		this._currentDrawing = undefined;
	}
	
	renderContent() {
		let vscribbleDIV = document.createElement("div");
		vscribbleDIV.style.display = "flex";
		vscribbleDIV.style.width = "100%";
		vscribbleDIV.style.height = "100%";
		vscribbleDIV.style.position = "relative";
		
		let vCanvas = document.createElement("canvas");
		vCanvas.style.width = "100%";
		vCanvas.style.height = "100%";
		vCanvas.style.top = 0;
		vCanvas.style.left = 0;
		vCanvas.width = cDefaultWidth;
		vCanvas.height = cDefaultHeight;
		vCanvas.onmousedown = () => {this.startDrawing()};
		vCanvas.onmouseup = () => {this.stopDrawing()};
		vCanvas.onmousemove = (pEvent) => {this.draw(pEvent)};
		
		let vclearButton = document.createElement("i");
		vclearButton.classList.add("fa-solid", "fa-eraser");
		vclearButton.style.top = "3px";
		vclearButton.style.right = "3px";
		vclearButton.style.color = this.primeColor;
		vclearButton.style.cursor = "pointer";
		vclearButton.style.position = "absolute";
		registerHoverShadow(vclearButton);
		vclearButton.onclick = (pEvent) => {
			if (pEvent.shiftKey && this.isOwner) {
				this.deleteAllDrawings();
			}
			else {
				this.deleteOwnDrawings();
			}
		}
		
		vscribbleDIV.appendChild(vCanvas);
		vscribbleDIV.appendChild(vclearButton);
		this.contentElement.appendChild(vscribbleDIV);
		
		this.contentElements.scribble = vscribbleDIV;
		this.contentElements.canvas = vCanvas;
		this.contentElements.clearbutton = vclearButton;
	}
	
	draw(pEvent) {
		if (this.isDrawing && this.canEdit) {
			let vKey = this.currentDrawing;
			
			let vDrawingPoints = this.drawings[vKey]?.points;
			
			if (vDrawingPoints) {
				let vNewPoint = this.scaledXY(pEvent);
				
				let vLastPoint = vDrawingPoints[vDrawingPoints.length - 1];
				
				if (!vLastPoint || scribbleNote.xydistance(vNewPoint, vLastPoint) > cDistanceThreshold) {
					vDrawingPoints.push(vNewPoint);
					
					this.drawings = {[vKey] : {points : vDrawingPoints}};
				}
			}
		}
	}
	
	updateRenderContent(pupdatedNote, pContentUpdate, pUpdate, pContext) {
		if (pContentUpdate.hasOwnProperty("drawings")) {
			this.renderDrawings(pContext.content?.updatedDrawings);
		}
	}
	
	renderDrawings(pUpdatedDrawings = undefined) {
		let vRedrawAll = !pUpdatedDrawings || pUpdatedDrawings.find(vKey => vKey.indexOf("-=") >= 0);
		
		let vRedraws = pUpdatedDrawings;
		
		let vCanvasDraw = this.contentElements.canvas.getContext("2d");
		
		if (vRedrawAll) {
			vRedraws = Object.keys(this.drawings);
			
			vCanvasDraw.clearRect(0, 0, cDefaultWidth, cDefaultHeight);
		}
		
		vCanvasDraw.lineWidth = 4;
		
		for (let vKey of vRedraws) {
			let vDrawing = this.drawings[vKey];
			
			vCanvasDraw.beginPath();
			
			vCanvasDraw.strokeStyle = vDrawing.color;
			
			let vPoints = vDrawing.points;
			
			let vFirstPoint = true;
			
			for (let vPoint of vPoints) {
				if (vFirstPoint) {
					vCanvasDraw.moveTo(vPoint.x, vPoint.y);
					vFirstPoint = false;
				}
				else {
					vCanvasDraw.lineTo(vPoint.x, vPoint.y);
				}
			}
			
			vCanvasDraw.stroke();
		}
	}
	
	disable() {
		this.contentElements.clearbutton.style.display = "none";
	}
	
	enable() {
		this.contentElements.clearbutton.style.display = "";
	}
	
	onMouseHoverChange() {
		if (this.isMouseHover && this.canEdit) {
			this.contentElements.clearbutton.style.display = "";
		}
		else {
			this.contentElements.clearbutton.style.display = "none";
		}
	}
	
	scaledXY(pEvent) {
		let vRect = this.contentElements.canvas.getBoundingClientRect();
		
		let vxy = {};
		
		vxy.x = pEvent.pageX - (vRect.left);
		vxy.y = pEvent.pageY - (vRect.top);
		
		vxy.x = Math.round(vxy.x/vRect.width * this.contentElements.canvas.width);
		vxy.y = Math.round(vxy.y/vRect.height * this.contentElements.canvas.height);
		
		return vxy;
	}
	
	static xydistance(pP1, pP2) {
		return Math.sqrt((pP1.x - pP2.x)**2 + (pP1.y - pP2.y)**2)
	}
}