import { get } from "/idb-keyval.js";
import { setColor, update_dicts } from "/utils.js"

self.addEventListener('install', (event) => {
	console.log("installing service worker (event)", event);
	event.waitUntil(
		setColor()
	)
})

self.addEventListener('activate', (event) => {
	console.log('Service Worker activated');
	event.waitUntil(
		get('colors').then((colors) => {
			console.log('found colors', colors);
			if (colors === undefined || colors.fg === undefined || colors.bg === undefined) {
				return setColor();
			}
		})
	)
});

// console.log("starting service worker")

async function update_badge() {
	// await setColor()

	let curr_work_name;
	await chrome.tabs.query({
		currentWindow: true
	}).then(tabs => {
		curr_work_name = tabs[0].workspaceName
		return update_dicts(tabs)
	});

	let curr_work_tabs = 0;
	// cant do a promise.all because 'counts' idb is updated in update_dicts
	const counts = await get('counts')
	curr_work_tabs = counts[curr_work_name];
	// console.log("CALLED", counts, curr_work_name, curr_work_tabs);

	chrome.action.setBadgeText({text: curr_work_tabs.toString()});
	opr.sidebarAction.setBadgeText({text: curr_work_tabs.toString()});

	await sendUpdateMsg()
}

async function sendUpdateMsg() {
	try {
		await chrome.runtime.sendMessage({});
	} catch {
		console.log('tried to send update but popup is not alive')
	}
}

// setInterval(() => {console.log('TING')}, 5000)

chrome.action.onClicked.addListener(() => update_badge())
chrome.tabs.onCreated.addListener((tab) => update_badge())
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => update_badge())

opr.palette.onPaletteChanged.addListener(async () => {
	await setColor()
	await sendUpdateMsg()
})