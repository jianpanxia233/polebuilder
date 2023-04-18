///////////////////////////////////////////
//               ShortCuts
///////////////////////////////////////////

// in .vue file
// import {bind_ShortCut}
// bind_ShortCut('ctrl+c', 'copy', 'FileSystemPanel', this.shortcut_Copy)
// bind_ShortCut('ctrl+v', 'paste', 'FileSystemPanel', this.shortcut_Paste)
import { HTML } from '../Utils.js'

let shortcuts = {};
let mousepos = [0, 0];
let panelobjs = null;
let mainlayoutdiv = null;
let check = null;

export function set_Layouter(l, c, call) {
	mainlayoutdiv = document.getElementById(l.layout_id);
	panelobjs = {};
	check = c;
	l.panel_id_list.forEach((p) => {
		let div = document.getElementById(p);
		if (div !== null)
			panelobjs[p] = div;
	});
}

function in_Panel(div, x, y) {
	if (div.style.visibility === 'hidden') return false;
	let divx1 = div.offsetLeft;
	let divy1 = div.offsetTop;
	let divx2 = div.offsetLeft + div.offsetWidth;
	let divy2 = div.offsetTop + div.offsetHeight;
	return (x >= divx1 && x <= divx2 && y >= divy1 && y <= divy2)
}

function get_CurrentPanel() {
	let x = mousepos[0] - mainlayoutdiv.offsetLeft;
	let y = mousepos[1] - mainlayoutdiv.offsetTop;
	for (let key in panelobjs) {
		// console.log(key, mousepos[0], mousepos[1], panelobjs[key].offsetLeft, panelobjs[key].offsetTop, panelobjs[key].offsetLeft + panelobjs[key].offsetWidth, panelobjs[key].offsetTop + panelobjs[key].offsetHeight)
		if (in_Panel(panelobjs[key], x, y)) {
			// console.log(key)
			return key
		}

	}
	return null
}

function mousemove(e) {
	mousepos[0] = e.clientX;
	mousepos[1] = e.clientY;
}

export function get_AllShortCuts() {
	let arr = []
	for (let key in shortcuts) {
		let keys = shortcuts[key]
		let keycode = key.split('+').map(i => HTML.create_Button(i)).join(' + ')
		keys.forEach((keys2) => {
			arr.push({ key: keycode, panel: keys2.target, description: keys2.description })
		})
	}
	return arr
}

export function bind_ShortCut(keys, action, target, callback, repeat = false, description = "无描述") {
	if (shortcuts[keys]) {
		shortcuts[keys].push({ action: action, target: target, callback: callback, repeat: repeat, description: description });
	}
	else {
		shortcuts[keys] = [{ action: action, target: target, callback: callback, repeat: repeat, description: description }];
	}
}

export function remove_ShortCut(action) {
	// console.log(action);
	for (let key in shortcuts) {
		for (let i = 0; i < shortcuts[key].length; i++) {
			if (shortcuts[key][i].action === action) {
				shortcuts[key].splice(i, 1);
				if (shortcuts[key].length === 0) {
					delete shortcuts[key];
				}
				// console.log(shortcuts);
				return;
			}
		}
	}
}

function filter_Keys(key) {
	switch (key) {
		case ' ': return 'space';
		default: return key.toLowerCase();
	}
}

function keybutton(e) {
	let keyCode = filter_Keys(e.key);
	if (panelobjs === null || (check !== null && !check(keyCode))) return;
	if (keyCode === 'control' || keyCode === 'shift' || keyCode === 'alt') keyCode = undefined;
	let code = [e.ctrlKey ? 'ctrl' : undefined, e.shiftKey ? 'shift' : undefined, e.altKey ? 'alt' : undefined, keyCode].filter((key) => {
		return key !== undefined;
	}).join('+');
	let prevent = false;
	let current_panel = get_CurrentPanel();
	if (shortcuts[code]) {
		for (let key = 0; key < shortcuts[code].length; key++) {
			if (shortcuts[code][key].target === current_panel || shortcuts[code][key].target === undefined) {
				if (!e.repeat || shortcuts[code][key].repeat === e.repeat) {
					shortcuts[code][key].callback(shortcuts[code][key].action)
					prevent = true
				}
			}
		}
	}
	if (prevent) e.preventDefault()
}

window.addEventListener('mousemove', mousemove);
window.addEventListener('keydown', keybutton);

export function release_Event() {
	window.removeEventListener('mousemove', mousemove)
	window.removeEventListener('keydown', keybutton)
	shortcuts = {}
	panelobjs = null
	check = null
}
