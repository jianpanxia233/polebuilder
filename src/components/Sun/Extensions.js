import * as ShortCut from './ShortCut.js'
import * as Utils from '../Utils.js'
import * as ModuleSlot from './ModuleSlot.js'
import CryptoJS from 'crypto-js'
import * as FileSystem from './FileSystem.js'
import * as WindowEnv from './WindowEnv.js'
import { HTML } from '../Utils.js'
import { saveAs } from 'file-saver';

let eventbus = null;
let app = null;
let extensions = {

};

export function get_AllExtensions() {
	return extensions
}

function loadJS(src) {
	return new Promise((resolve, reject) => {
		let script = document.createElement('script');
		script.src = src;
		// script.type = 'module';
		script.type = "text/javascript";
		script.onload = () => { resolve(script) };
		script.onerror = reject;
		document.body.appendChild(script);
	});
}

export function init(eb, vm) {
	eventbus = eb
	app = vm
	console.log("%cSUN Extensions inited", "fontsize: 30px; background-color: rgb(10,10,10); border-radius: 8px; padding: 5px 10px; color: white;")
	// console.log("SUN Extensions inited")
}

export function fire_Event(ext, symbol, args) {
	// console.log(ext, symbol, args, extensions[ext], extensions[ext].actions[symbol])
	if (extensions[ext] && extensions[ext].script[extensions[ext].actions[symbol]]) {
		// console.log("fire")
		extensions[ext].script[extensions[ext].actions[symbol]](extensions[ext], args)
	}
}

export function install(url) {
	let ext = new Extension(url)
	return ext.promise
}

export class Extension {
	constructor(url, name, version, author, description) {
		this.symbols = {};
		this.actions = {};
		this.data = {};
		// console.log(this);
		if (extensions[name] !== undefined) throw new Error("extension existed");
		// window.import(url);
		extensions[name] = "loading";
		if (typeof (url) === 'string')
			this.loadpromise = new Promise((resolve, reject) => {
				loadJS(url).then((script) => {
					this.about = {
						name: name,
						version: version,
						author: author,
						description: description
					}
					try {
						this.script = window.ext(Utils, ModuleSlot, FileSystem, saveAs, WindowEnv)
						this.eventbus = eventbus
						this.shortcut = (action) => {
							fire_Event(name, action)
						}
						this.init();
					}
					catch (err) {
						document.body.removeChild(script)
						window.ext = null
						delete extensions[name]
						reject(err)
						return
					}
					document.body.removeChild(script)
					window.ext = null
					extensions[name] = this
					resolve()
				}, () => {
					delete extensions[name]
					reject('failed to load extension')
				})
			})
		else {
			extensions[name] = this
			this.about = {
				name: name,
				version: version,
				author: author,
				description: description
			}
			this.script = url(Utils, ModuleSlot, FileSystem, saveAs, WindowEnv)
			this.eventbus = eventbus
			this.shortcut = (action) => {
				fire_Event(name, action)
			}
			this.init();
		}
	}

	init() {
		this.script.init(this);
	}

	then(func = () => { }, error = (reason) => {
		console.error('failed to load extension')
		console.error(reason)
	}) {
		// console.log(this.loadpromise)
		return this.loadpromise.then(() => {
			return func();
		}, (reason) => {
			return error(reason);
		})
	}

	remove() {
		for (let key in this.symbols) {
			// console.log(this.symbols[key]);
			this.symbols[key].location.forEach((l) => {
				if (l === "Action") {
					this.eventbus.$emit("app_remove_Action", this.symbols[key].symbol);
				}
				else if (l === "ShortCut") {
					ShortCut.remove_ShortCut(this.symbols[key].symbol);
				}
			})
		}
		delete extensions[this.about.name];
		console.log(extensions);
	}

	add_ExtensionsMenuItem(title, action, list, icon) {
		if (this.symbols[action] === undefined) {
			this.symbols[action] = { symbol: Symbol(action), location: new Set(["ExtensionsMenuItem"]) };
			this.actions[this.symbols[action].symbol] = action;
		}
		else {
			this.symbols[action].location.add("ExtensionsMenuItem")
		}
		this.eventbus.$emit("app_add_ExtensionsMenuItem", this.about.name, title, this.symbols[action].symbol, list, icon)
	}

	add_ShortCut(key, action, panelid, description) {
		if (this.symbols[action] === undefined) {
			this.symbols[action] = { symbol: Symbol(action), location: new Set(["ShortCut"]) };
			this.actions[this.symbols[action].symbol] = action;
		}
		else {
			this.symbols[action].location.add("ShortCut")
		}
		ShortCut.bind_ShortCut(key, this.symbols[action].symbol, panelid, this.shortcut, false, description)
	}

	add_Action(title, action, icon, key, doc = '') {
		if (this.symbols[action] === undefined) {
			this.symbols[action] = { symbol: Symbol(action), location: new Set(["Action"]) };
			this.actions[this.symbols[action].symbol] = action;
		}
		else {
			this.symbols[action].location.add("Action")
		}
		this.eventbus.$emit("app_add_Action", this.about.name, title, this.symbols[action].symbol, icon, (key === '' ? '' : key.split('+').map(i => HTML.create_Button(i)).join(' + ')), doc)
	}

	crypto(aeskey, word) {
		const key = CryptoJS.enc.Utf8.parse(aeskey)
		const srcs = CryptoJS.enc.Utf8.parse(word)
		return CryptoJS.AES.encrypt(srcs, key, {
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7
		})
	}

	get_Panel(panelid) {
		if (panelid === undefined) {
			return app
		}
		return app.$refs[panelid]
	}

	log(text) {
		this.eventbus.$emit('console_add_Output', "log", `插件 ${this.about.name}`, text)
	}

	info(text) {
		this.eventbus.$emit('console_add_Output', "info", `插件 ${this.about.name}`, text)
	}

	error(text) {
		this.eventbus.$emit('console_add_Output', "error", `插件 ${this.about.name}`, text)
	}
}