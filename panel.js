var tbl = document.querySelector("#countdisplay");
var sortedkeys;
var color_77;

function show(){
	setColor();
	chrome.tabs.query({
		currentWindow: true
	}, function(tabs) {

		var counts = {};
		var wids = {};
		var totaltabs = 0;
		tabs.forEach(function(tab) {
			counts[tab.workspaceName] = 1 + (counts[tab.workspaceName] || 0);
			wids[tab.workspaceName] = tab.workspaceId;
			totaltabs += 1;
		});

		const dsu = (map1) => Object.keys(map1)
			.map((item, index) => [Object.values(map1)[index], item]) // add the args to sort by
			.sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
			.map(([, item]) => item); // extract the sorted items

		// const dsu2 = (map1) => Object.keys(map1)
		// 	.map((item, index) => [Object.values(map1)[index], item]) // add the args to sort by

		// console.log(dsu(counts));
		// console.log(dsu2(counts));
		// console.log(dsu2(counts).sort(([arg1], [arg2]) => arg2 - arg1));
		// console.log(dsu2(counts).sort(([arg1], [arg2]) => arg2 - arg1).map(([, item]) => item));
		// console.log("Workspace counts:");

		var sortedkeys = Object.keys(counts).sort((kv1, kv2) => wids[kv1] - wids[kv2]);
		var maxTabs = Math.max(...Object.values(counts));

		// var sortedItemsbycount = Object.entries(counts).sort((kv1, kv2) => kv2[1] - kv1[1]);
		// console.log(sortedItemsbycount);

		// chrome.storage.local.set({"sortedkeys": sortedkeys}).then(() => {
		// 	console.log("Value is set to " + value);
		// });
		// var tbl = document.querySelector('#table');
		var th = tbl.createTHead();
		var thr = th.insertRow();
		thr.insertCell().innerText = "Workspace";
		thr.insertCell().innerText = "# tabs";
		thr.insertCell().innerText = "Rank";

		var tb = tbl.createTBody();
		sortedkeys.forEach(function(wname) {
			var tr = tb.insertRow();
			var td1 = tr.insertCell();
			td1.innerText = wname;
			var td2 = tr.insertCell();
			td2.innerText = counts[wname];
			// tr.style.setProperty('background', `#var(--palette-gx_no_77`);
			// tr.style.background ='var(--palette-gx_no_77)';
			// const colorval = Math.floor(counts[wname]/maxTabs*255);
			// tr.style.backgroundColor = bg + colorval;
			var td3 = tr.insertCell();
			td3.innerText = dsu(counts).indexOf(wname) + 1;
			console.log(wname + ' : ' + counts[wname])
		});
		var tr = tb.insertRow();
		var td1 = tr.insertCell();
		td1.innerText = "Total";
		var td2 = tr.insertCell();
		td2.innerText = totaltabs;
		// tr.style.setProperty('background', `#var(--palette-gx_no_77`);
		// tr.style.background ='var(--palette-gx_no_77)';
		// const colorval = Math.floor(counts[wname]/maxTabs*255);
		// tr.style.backgroundColor = bg + colorval;
		var td3 = tr.insertCell();
		td3.innerText = "";
		tr.classList.add("final-row");

	});
	// Object.keys(chrome.tabs).forEach((prop) => console.log(prop));

	// sortedkeys = chrome.storage.local.get(["sortedkeys"]).then((result) => {
	// 	console.log("Value currently is " + result.key);
	// });
	
	// if (!sortedkeys){
	// 	theValue = "";
	// }
	
	// maintext.value = sortedkeys;
}

document.addEventListener("DOMContentLoaded", show, false);

function setColor() {
	opr.palette.getPalette(palette => {
		for (const paletteColor of palette) {
			opr.palette.getColor(paletteColor, color => {
				document.documentElement.style.setProperty(`--palette-${paletteColor}`, `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`);
			});
		}
	});
}

function toHex(number) {
	let hex = number.toString(16);
	while (hex.length < 2) {
		hex = `0${hex}`;
	}
	return hex;
}

