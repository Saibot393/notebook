export const cModuleName = "notebook";

export const cTickInterval = 100; //ms

export function Translate(pName, pWords = {}){
	let vContent = game.i18n.localize(cModuleName+"."+pName);
	
	for (let vWord of Object.keys(pWords)) {
		vContent = vContent.replace("{" + vWord + "}", pWords[vWord]);
	}
 
	return vContent;
}