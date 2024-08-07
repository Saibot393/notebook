import {cModuleName, Translate} from "./utils/utils.js";

Hooks.once(cModuleName + ".registerNoteSettings", () => {
	let vNoteTypes = Object.keys(CONFIG[cModuleName].noteTypes);
	let vNoteOptions = {"manually" : Translate("Titles.manually")};
	vNoteTypes.forEach(vKey => vNoteOptions[vKey] = CONFIG[cModuleName].noteTypes[vKey].displayType);

	//Settings
	game.settings.register(cModuleName, "shiftquickcreate", {
		name: Translate("Settings.shiftquickcreate.name"),
		hint: Translate("Settings.shiftquickcreate.descrp"),
		scope: "client",
		choices : vNoteOptions,
		config: true,
		type: String,
		default: "text"
	}); 
  
	game.settings.register(cModuleName, "ctrlquickcreate", {
		name: Translate("Settings.ctrlquickcreate.name"),
		hint: Translate("Settings.ctrlquickcreate.descrp"),
		scope: "client",
		choices : vNoteOptions,
		config: true,
		type: String,
		default: "manually"
	}); 
	
	game.settings.register(cModuleName, "altquickcreate", {
		name: Translate("Settings.altquickcreate.name"),
		hint: Translate("Settings.altquickcreate.descrp"),
		scope: "client",
		choices : vNoteOptions,
		config: true,
		type: String,
		default: "manually"
	}); 
	
	game.settings.register(cModuleName, "smallnoteheight", {
		name: Translate("Settings.smallnoteheight.name"),
		hint: Translate("Settings.smallnoteheight.descrp"),
		scope: "client",
		config: true,
		range: {
			min: 50,
			max: 250,
			step: 1
		},
		type: Number,
		default: 87
	});   
  
	game.settings.register(cModuleName, "largenoteheight", {
		name: Translate("Settings.largenoteheight.name"),
		hint: Translate("Settings.largenoteheight.descrp"),
		scope: "client",
		config: true,
		range: {
			min: 100,
			max: 500,
			step: 1
		},
		type: Number,
		default: 190
	}); 
	
	game.settings.register(cModuleName, "backgroundpattern", {
		name: Translate("Settings.backgroundpattern.name"),
		hint: Translate("Settings.backgroundpattern.descrp"),
		scope: "client",
		config: true,
		choices: {
			"../ui/parchment.jpg" : Translate("Settings.backgroundpattern.options.parchment"),
			"../ui/parchment-white.jpg" : Translate("Settings.backgroundpattern.options.parchment-white"),
			"../ui/denim065.png" : Translate("Settings.backgroundpattern.options.denim065")
		},
		type: String,
		default: "../ui/parchment.jpg",
		requiresReload : true
	});  
});