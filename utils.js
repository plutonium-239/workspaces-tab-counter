import {get,set} from "./idb-keyval.js"

export function update_dicts(tabs) {
	let counts = {};
	let wids = {};
	let totaltabs = 0;
	tabs.forEach(function(tab) {
		counts[tab.workspaceName] = 1 + (counts[tab.workspaceName] || 0);
		wids[tab.workspaceName] = tab.workspaceId;
		totaltabs += 1;
	});

	return Promise.all([set('counts', counts), set('wids', wids),set('totaltabs', totaltabs)])
}


export async function setColor() {
	let colors_dict;
	let colors = {};
	const flavour = await find_and_save_flavour();
	if (flavour === Flavours.GX) {
		// # Opera GX
		colors_dict = [
			['fg', 'gx_accent'],
			['bg', 'gx_secondary_base']
		]
	} else if (flavour === Flavours.One) {
		// # Opera one/air
		colors_dict = [
			['fg', 'accent_dark'],
			['bg', 'background_dark']
		]
	} else if (flavour === Flavours.Air) {
		// opera air does not have any accent color, add a green-ish color matching the browser
		// however it has a transparent background
		colors_dict = [
			['bg_opaque', 'archipelago_avocado'],
		]
		colors[`fg`] = '#000';
		colors[`bg`] = 'hsl(from var(--bg_opaque) h s l / 50%)';
	}

	// console.log("Inside setColor", colors_dict)
	for (const [varName, paletteColor] of colors_dict) {
		await new Promise((resolve) => {
			opr.palette.getColor(paletteColor, color => {
				// console.log([varName, paletteColor, color])
				// let l = (Math.max(color.r, color.g, color.b) + Math.min(color.r, color.g, color.b))/(2*255);
				// if (varName === "bg" && l > 0.3) {
				// 	colors[varName] = `hsl(from())`;
				// } else{
				// }
				colors[varName] = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
				resolve();
			});
		})
	}
	// console.log("Setting colors to", colors)
	console.log(`Setting badge colors to ${colors.fg}, ${colors.bg}`)
	await set('colors', colors)
	chrome.action.setBadgeBackgroundColor({color: colors.bg});
	chrome.action.setBadgeTextColor({color: colors.fg});
	opr.sidebarAction.setBadgeBackgroundColor({color: colors.bg});
	opr.sidebarAction.setBadgeTextColor({color: colors.fg});
}

function toHex(number) {
	let hex = number.toString(16);
	while (hex.length < 2) {
		hex = `0${hex}`;
	}
	return hex;
}


/* # Flavour finding/saving utils*/

export const Flavours = Object.freeze({
	GX : 0,
	One: 1,
	Air: 2
})

function decipher_flavour(f) {
	switch (f) {
		case 0:
			return 'GX'
		case 1:
			return 'One'
		case 2:
			return 'Air'
		default:
			reportError(`unknown browser flavour ${f}`)
	}
}

async function find_and_save_flavour() {
	let flavour;
	let calcd = new Promise((resolve, reject) => {
		opr.palette.getPalette(palette => {
			if (palette.includes('gx_accent')) {
				flavour = Flavours.GX
			} else if (palette.includes('accent_dark')) {
				flavour = Flavours.One
			} else {
				flavour = Flavours.Air
			}
			console.log(`Found flavour ${flavour}`);
			// chrome.storage.local.set({flavour})
			// set('flavour', flavour);
			console.log("Found and saved flavour " + decipher_flavour(flavour));
			resolve()
		})
	})
	await calcd
	console.log("flavour is" + flavour);
	return flavour
}

// export async function get_flavour() {
// 	let t0 = performance.now()
// 	let result = await chrome.storage.local.get(["flavour"]);
// 	console.log(`localStorage took ${performance.now() - t0} ms.`);
// 	// console.log('Loaded flavour', result.flavour);
// 	if (result.flavour === undefined) {
// 		console.log(`Trying to find...`);
// 		result.flavour = find_and_save_flavour()
// 	}
// 	console.log('Returning flavour', result.flavour);
// 	return result.flavour
// }

// export async function get_flavour() {
// 	let t0 = performance.now()
// 	let flavour = await get('flavour')
// 	console.log(`idb-keyval(flavour) took ${performance.now() - t0} ms.`);
// 	// console.log('Loaded flavour', flavour);
// 	if (flavour === null) {
// 		console.log(`Trying to find...`);
// 		flavour = find_and_save_flavour()
// 	}
// 	console.log('Returning flavour', flavour);
// 	return flavour
// }