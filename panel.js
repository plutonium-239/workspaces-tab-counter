import {get_flavour, Flavours} from "./opera_flavour_helper.js"

var tbl = document.querySelector("#countdisplay");
var sortedkeys;
var totaltabs = 0;
let counts = {};
let wids = {};

// ! opr.workspacesPrivate is NEVER available, inside show(), yet somehow available inside update_badge

// let global_start = performance.now()

function show() {
	// let t0 = performance.now()
	// console.log(`show.start (from global) took ${t0 - global_start} ms.`);
	setColor();
	// let t1 = performance.now()
	// console.log(`setColor took ${t1 - t0} ms.`);

	if (typeof opr.workspacesPrivate !== "undefined") {
		opr.workspacesPrivate.getWorkspacesInfo(
			workspaces => update_dicts_oprpvt(workspaces)
		).then(make_table);
		console.log("Working with opr.workspacesPrivate")
	} else {
		chrome.tabs.query({
			currentWindow: true
		}).then(tabs => update_dicts(tabs)).then(make_table);
		console.log("Working with chrome.tabs")
	}
	// sortedkeys = chrome.storage.local.get(["sortedkeys"]).then((result) => {
	// 	console.log("Value currently is " + result.key);
	// });
}

function update_dicts(tabs) {
	counts = {};
	wids = {};
	totaltabs = 0;
	tabs.forEach(function(tab) {
		counts[tab.workspaceName] = 1 + (counts[tab.workspaceName] || 0);
		wids[tab.workspaceName] = tab.workspaceId;
		totaltabs += 1;
	});
}

function update_dicts_oprpvt(workspaces) {
	counts = {};
	wids = {};
	totaltabs = 0;
	workspaces.forEach(function(workspace) {
		opr.workspacesPrivate.getWorkspaceStats(workspace.id, stats => {counts[workspace.name] = stats.num_tabs});
		wids[workspace.name] = workspace.id;
		totaltabs += counts[workspace.name];
	});
}

function update_badge() {
	chrome.tabs.query({
		currentWindow: true
	}).then(tabs => update_dicts(tabs));

	let curr_work_tabs = 0;
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		curr_work_tabs = counts[tabs[0].workspaceName];
		chrome.action.setBadgeText({text: curr_work_tabs.toString()});
	});
	// console.log("CALLED" + curr_work_tabs);
}

function update_badge_operaone() {
	opr.workspacesPrivate.getWorkspacesInfo(
		workspaces => update_dicts_oprpvt(workspaces)
	);

	opr.workspacesPrivate.getWorkspacesInfo(workspaces => {
		workspaces.forEach(workspace => {
			if (workspace.active_in_current_window) {
				opr.workspacesPrivate.getWorkspaceStats(workspace.id, 
					stats => chrome.action.setBadgeText({text: stats.num_tabs.toString()})
				)
			}
		})
	})
}

document.addEventListener("DOMContentLoaded", show, false);

if (typeof opr.workspacesPrivate !== "undefined") {
	opr.workspacesPrivate.onActiveWorkspaceChanged(update_badge_operaone)
	console.log("Listening for badge with opr.workspacesPrivate")
} else {
	chrome.tabs.onActivated.addListener(update_badge)
	console.log("Listening for badge with chrome.tabs")
}

async function setColor() {
	var colors_dict;
	// let t0 = performance.now()
	let flavour = await get_flavour();
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
			['fg', 'archipelago_avocado'],
		]
		document.documentElement.style.setProperty(`--bg`, '#0005');
	}
	// let t1 = performance.now()
	// console.log(`waiting for get_flavour took ${t1 - t0} ms.`);

	console.log("Inside setColor", colors_dict)
	for (const [varName, paletteColor] of colors_dict) {
		opr.palette.getColor(paletteColor, color => {
			// console.log([varName, paletteColor, color])
			document.documentElement.style.setProperty(`--${varName}`, `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`);
			// document.documentElement.style.setProperty(`--${varName}`, `hsl(${color.h},${color.s},${color.l})`);
		});
	}

	// need to resort to this as waiting for async fn as callback inside async fn is not very fun. python ftw <3
	setTimeout(() => {
		let fg = document.documentElement.style.getPropertyValue('--fg')
		let bg = document.documentElement.style.getPropertyValue('--bg')
		console.log('Using colors in badge:', {fg, bg})
		chrome.action.setBadgeBackgroundColor({color: bg});
		chrome.action.setBadgeTextColor({color: fg});
	}, 50)
}

function toHex(number) {
	let hex = number.toString(16);
	while (hex.length < 2) {
		hex = `0${hex}`;
	}
	return hex;
}

function make_table() {
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
}