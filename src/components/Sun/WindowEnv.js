let app = null;

export function set_App(a) {
	console.log("%cWindowEnv inited", "fontsize: 30px; background-color: rgb(10,10,10); border-radius: 8px; padding: 5px 10px; color: white;")
	app = a;
}

export function show_Form(form, param, input, description, parent) {
	let sym = Symbol(description);
	let resolve_func = undefined, reject_func = undefined;
	let func = (resolve, reject) => {
		resolve_func = resolve
		reject_func = reject
	}
	let promise = new Promise(func);
	let popupparam = { Form: form, PopupParam: param, Input: input, Self: sym, Parent: parent, Handler: { resolve: resolve_func, reject: reject_func } }
	app.$EventBus.$emit("app_new_Form", popupparam)
	return promise;
}

export function show_ContextMenu(list, param, data, description, parent) {
	param.x = param.x === undefined ? event.clientX : param.x
	param.y = param.y === undefined ? event.clientY : param.y
	param.first = param.first === undefined ? 0 : param.first
	param.shift = param.shift === undefined ? true : param.shift
	let sym = Symbol(description);
	let resolve_func = undefined, reject_func = undefined;
	let func = (resolve, reject) => {
		resolve_func = resolve
		reject_func = reject
	}
	let promise = new Promise(func);
	let contextmenuparam = { List: list, ContextMenuParam: param, Data: data, Self: sym, Parent: parent, Handler: { resolve: resolve_func, reject: reject_func } }
	app.$EventBus.$emit("contextmenu_new_ContextMenu", contextmenuparam)
	return promise;
}