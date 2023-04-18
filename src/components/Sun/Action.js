import { get_UniqueID } from './ModuleSlot.js'

export class Action {
	constructor() {
		this.uid = get_UniqueID();
		this.type = "Base Action";
		this.name = 'Action';
	}

	execute(editor) {

	}

	undo(editor) {

	}

	redo(editor) {

	}

	dispose(editor) {

	}
}