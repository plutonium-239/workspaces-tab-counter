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
			localStorage.setItem('flavour', flavour);
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

export async function get_flavour() {
	let t0 = performance.now()
	let flavour = localStorage.getItem('flavour')
	console.log(`localStorage took ${performance.now() - t0} ms.`);
	// console.log('Loaded flavour', flavour);
	if (flavour === null) {
		console.log(`Trying to find...`);
		flavour = find_and_save_flavour()
	} else {
		flavour = parseInt(flavour)
	}
	console.log('Returning flavour', flavour);
	return flavour
}