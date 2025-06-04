import { get, getMany } from "./idb-keyval.js";
import {update_dicts} from "./utils.js"


document.addEventListener("DOMContentLoaded", () => {setColor();make_table();}, false);
chrome.runtime.onMessage.addListener(make_table)

async function setColor() {
	let colors = await get('colors')
	console.log('setting colors', colors)
	for (const [v, p] of Object.entries(colors)) {
		document.documentElement.style.setProperty(`--${v}`, p);
	}

}

async function make_table() {
	const countdisplay = document.querySelector("#countdisplay");
	const tbl = document.createElement('table');
	tbl.id = 'countdisplay'
	const dsu = (map1) => Object.keys(map1)
		.map((item, index) => [Object.values(map1)[index], item]) // add the args to sort by
		.sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
		.map(([, item]) => item); // extract the sorted items

	const [counts, wids, totaltabs] = await getMany(['counts', 'wids', 'totaltabs'])
	const sortedkeys = Object.keys(counts).sort((kv1, kv2) => wids[kv1] - wids[kv2]);
	// const maxTabs = Math.max(...Object.values(counts));

	const th = tbl.createTHead();
	const thr = th.insertRow();
	thr.insertCell().innerText = "Workspace";
	thr.insertCell().innerText = "# tabs";
	thr.insertCell().innerText = "Rank";

	const tb = tbl.createTBody();
	sortedkeys.forEach(function(wname) {
		const tr = tb.insertRow();
		tr.insertCell().innerText = wname;
		tr.insertCell().innerText = counts[wname];
		tr.insertCell().innerText = dsu(counts).indexOf(wname) + 1;
		console.log(wname + ' : ' + counts[wname])
	});
	const tr = tb.insertRow();
	tr.insertCell().innerText = "Total";
	tr.insertCell().innerText = totaltabs;
	tr.insertCell().innerText = "";
	tr.classList.add("final-row");

	countdisplay.replaceWith(tbl)
}