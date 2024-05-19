export function registerHoverShadow(pElement) {
	let vPrevEnter = pElement.onmouseenter;
	let vPrevLeave = pElement.onmouseleave;
	
	pElement.onmouseenter = (pEvent) => {
		pElement.style.textShadow = "0 0 8px red";
		
		if (vPrevEnter) {
			vPrevEnter(pEvent);
		}
	}
	
	pElement.onmouseleave = (pEvent) => {
		pElement.style.textShadow = "";
		
		if (vPrevLeave) {
			vPrevLeave(pEvent);
		}
	}
}