var tbl = document.querySelector("#countdisplay");
var sortedkeys;
var totaltabs = 0;
let counts = {};
let wids = {};

function show() {
	setColor();

	if (typeof opr.workspacesPrivate !== "undefined") {
		opr.workspacesPrivate.getWorkspacesInfo(
			workspaces => update_dicts_operaone(workspaces)
		).then(make_table);
	} else {
		chrome.tabs.query({
			currentWindow: true
		}).then(tabs => update_dicts(tabs)).then(make_table);
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

function update_dicts_operaone(workspaces) {
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
		workspaces => update_dicts_operaone(workspaces)
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
} else {
	chrome.tabs.onActivated.addListener(update_badge)
}

function setColor() {

	opr.palette.getPalette(palette => {
		for (const paletteColor of palette) {
			opr.palette.getColor(paletteColor, color => {
				document.documentElement.style.setProperty(`--palette-${paletteColor}`, `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`);
			});
		}
	});

	// need to resort to this as waiting for async fn as callback inside async fn is not very fun. python ftw <3
	setTimeout(() => {
		console.log(document.documentElement.style.getPropertyValue('--palette-gx_secondary_base'))
		console.log(document.documentElement.style.getPropertyValue('--palette-gx_accent'))
		chrome.action.setBadgeBackgroundColor({color: document.documentElement.style.getPropertyValue('--palette-gx_secondary_base')});
		chrome.action.setBadgeTextColor({color: document.documentElement.style.getPropertyValue('--palette-gx_accent')});
	}, 100)
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