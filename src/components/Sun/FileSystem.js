//////////////////////////////////////////////////////////
//                  SUN FileSystem
//////////////////////////////////////////////////////////

import { get_UniqueID } from '../Sun/ModuleSlot.js'
import { saveAs } from 'file-saver'

// class File
// - includes name, type (like txt, stl, svg...), data
export class File {
	constructor(name, type = 'txt', data = '') {
		this.type = "file";
		this.name = name;
		this.parent = null;
		this.filetype = type;
		this.data = data;
		this.uid = get_UniqueID();
		this.listener = [];
		this.presetPoleCode = 0;
		this.sourceType = 0;
		this.regionId = 0;
		this.poleId = 0;
	}

	// use to debug
	print(pre = '') {
		//console.log((pre === '' ? '' : pre + ' ') + "File", this.name + '.' + this.filetype, '\t\topen count: ' + this.listener.length);
	}

	get_Object(path) {
		return { type: 'file', path: path ? (path + '/' + this.name + '.' + this.filetype) : this.get_AbsolutePath(), uid: this.uid, name: this.name, filetype: this.filetype}
	}

	get_Object_Pole(path, presetPoleCode, sourceType, regionId, poleId) {
		return { type: 'file', path: path ? (path + '/' + this.name + '.' + this.filetype) : this.get_AbsolutePath(),
			uid: this.uid, name: this.name, filetype: this.filetype, presetPoleCode: presetPoleCode, sourceType: sourceType,
			regionId: regionId, poleId: poleId}
	}

	has_Listener(listener) {
		for (let i = 0; i < this.listener.length; i++) {
			if (this.listener === listener) return true;
		}
		return false;
	}

	// open this file
	// you need to pass in a listener (listener is a function ()=>{}) see // all listener change event below
	// return a filedescriptor
	open(listener) {
		if (this.has_Listener(listener)) return undefined;
		this.listener.push(listener);
		return { name: this.name, uid: this.uid, path: this.get_AbsolutePath(), file: this, filetype: this.filetype };
	}

	// close this file with the listener you used to open it
	close(listener) {
		let i = 0;
		while (i < this.listener.length) {
			if (this.listener[i] === listener) {
				this.listener.splice(i, 1);
			}
			else {
				i++;
			}
		}
	}

	// write to this file (override)
	set_Data(data) {
		this.data = data;
		this.on_DataChange();
	}

	// all listener change event
	on_PathChange() {
		this.listener.forEach((l) => {
			l({ event: 'pathchange', name: this.name, uid: this.uid, path: this.get_AbsolutePath(), file: this, filetype: this.filetype })
		})
	}

	on_Rename() {
		this.listener.forEach((l) => {
			l({ event: 'rename', name: this.name, uid: this.uid, path: this.get_AbsolutePath(), file: this, filetype: this.filetype })
		})
	}

	on_DataChange() {
		this.listener.forEach((l) => {
			l({ event: 'datachange', name: this.name, uid: this.uid, path: this.get_AbsolutePath(), file: this, filetype: this.filetype })
		})
	}

	on_Delete() {
		this.listener.forEach((l) => {
			l({ event: 'delete' })
		})
		this.listener = []
	}

	// get absolute path
	get_AbsolutePath() {
		let paths = [];
		paths.push(this.name + '.' + this.filetype);
		let parent = this.parent;
		while (parent !== null) {
			paths.push(parent.name);
			parent = parent.parent;
		}
		return paths.reverse().join('/');
	}

	// check whether this file has openers
	has_Open() {
		return this.listener.length > 0
	}
}

// class Directory
// - ROOT is a Directory instance
// - use directory.parent to get parent directory like "../"
export class Directory {
	constructor(name) {
		this.type = 'folder';
		this.name = name;
		this.children = [];
		this.parent = null;
	}

	// check whether has a folder in this directory
	has_Folder(name) {
		for (let i = 0; i < this.children.length; i++) {
			let folder = this.children[i];
			if (folder.type === 'folder' && folder.name === name) {
				return true;
			}
		}
		return false;
	}

	// get a folder in this directory
	// not found return null
	get_Folder(name) {
		for (let i = 0; i < this.children.length; i++) {
			let folder = this.children[i];
			if (folder.type === 'folder' && folder.name === name) {
				return folder;
			}
		}
		return null;
	}

	// check file has a folder in this directory
	has_File(name) {
		for (let i = 0; i < this.children.length; i++) {
			let file = this.children[i];
			if (file.type === 'file' && file.name === name) {
				return true;
			}
		}
		return false;
	}

	// get a file in this directory
	// not found return null
	get_File(name) {
		for (let i = 0; i < this.children.length; i++) {
			let file = this.children[i];
			if (file.type === 'file' && file.name === name) {
				return file;
			}
		}
		return null;
	}

	// donot use , it works but should not be used by a normal human
	get_File_by_UID(uid) {
		let stack = [this];
		while (stack.length > 0) {
			let node = stack.pop();
			for (let i = 0; i < node.children.length; i++) {
				let n = node.children[i];
				if (n.type === 'folder') {
					stack.push(n);
				}
				else if (n.type === 'file' && n.uid === uid) {
					return n
				}
			}
		}
		return null;
	}

	// remove a file or directory
	remove(node) {
		let i = 0;
		while (i < this.children.length) {
			if (this.children[i] === node) {
				let node = this.children.splice(i, 1);
				node.parent = null;
			}
			else {
				i++;
			}
		}
	}

	// add a file or directory, *this doesnot check the name of it*
	append(node) {
		this.children.push(node);
		node.parent = this;
	}

	// craete a folder in this directory
	create_Folder(name) {
		if (!this.has_Folder(name)) {
			let folder = new Directory(name);
			folder.parent = this;
			this.children.push(folder);
			return folder;
		}
		let i = BigInt(1);
		while (this.has_Folder(name + '(' + i.toString() + ')')) {
			i++;
		}
		let folder = new Directory(name + '(' + i.toString() + ')');
		folder.parent = this;
		this.children.push(folder);
		return folder;
	}

	create_File(name, type = 'txt', data = '') {
		if (!this.has_File(name)) {
			let file = new File(name, type, data);
			file.parent = this;
			this.children.push(file);
			return file;
		}
		let i = BigInt(1);
		while (this.has_File(name + '(' + i.toString() + ')')) {
			i++;
		}
		let file = new File(name + '(' + i.toString() + ')', type, data);
		file.parent = this;
		this.children.push(file);
		return file;
	}

	write_File(name, data, type = 'txt') {
		let file = this.get_File(name);
		if (file !== null) {
			file.data = data;
		}
		else {
			this.create_File(name, type, data);
		}
	}

	get_AbsolutePath() {
		let paths = [];
		paths.push(this.name);
		let parent = this.parent;
		while (parent !== null) {
			paths.push(parent.name);
			parent = parent.parent;
		}
		return paths.reverse().join('/');
	}

	print(pre = '+-') {
		//console.log((pre === '' ? '' : pre + ' ') + "Folder", this.name);
		this.children.forEach((child) => {
			child.print('   ' + pre);
		})
	}

	get(path = '') {
		if (path === '') return this;
		path = path.split('/')
		let node = this;
		let target = path.shift();
		if (this.name !== target) return null;
		// let flag = false;
		while (path.length > 0) {
			target = path.shift();
			let split = target.split('.');
			if (split.length >= 2) {
				// file
				node = node.get_File(split.slice(0, -1).join('.'));
				return node
			}
			else {
				// folder
				node = node.get_Folder(target);
				if (node === null) {
					return null;
				}
			}
		}
		return node;
	}

	rename(path, name = '') {
		if (name === '') return false;
		if (name.includes('/')) return false;
		let node = this.get(path);
		if (node !== null) {
			if (node.type === 'folder') {
				if (node.parent !== null && node.parent.has_Folder(name)) return false;
				else node.name = name;
				node.on_PathChange();
				return true;
			}
			if (node.type === 'file') {
				if (node.parent !== null && node.parent.has_File(name)) return false;
				else node.name = name;
				node.on_Rename();
				return true;
			}
		}
		return false;
	}

	write(path, data = '') {
		if (path === '') return this;
		path = path.split('/');
		let node = this;
		let target = path.shift();
		if (this.name !== target) this.name = target;
		// let flag = false;
		while (path.length > 0) {
			target = path.shift();
			let split = target.split('.');
			if (split.length >= 2) {
				// file
				let name = split.slice(0, -1).join('.')
				let file = node.get_File(name);
				if (file === null) {
					return node.create_File(name, split.slice(-1)[0], data);
				}
				else {
					file.set_Data(data)
				}
				return file;
			}
			else {
				// folder
				let folder = node.get_Folder(target);
				if (folder === null) {
					node = node.create_Folder(target);
				}
				else {
					node = folder;
				}
			}
		}
		return node;
	}

	clone(path) {
		let file = ROOT.get(path);
		if (file !== null && file.type === 'file') {
			let folder = file.parent;
			let data;
			if (file.data instanceof ArrayBuffer) {
				data = file.data.slice(0, file.data.length);
			}
			else {
				data = file.data;
			}
			let ans = folder.create_File(file.name, file.filetype, data);
			return ans;
		}
	}

	copy(pathfrom, pathto) {
		let file = ROOT.get(pathfrom);
		let folder = ROOT.get(pathto);
		if (file !== null && file.type === 'file' && folder !== null && folder.type === 'folder') {
			let data;
			if (file.data instanceof ArrayBuffer) {
				data = file.data.slice(0, file.data.length);
			}
			else {
				data = file.data;
			}
			let ans = folder.create_File(file.name, file.filetype, data);
			return ans;
		}
	}

	has_Open() {
		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].has_Open()) return true;
		}
		return false;
	}

	delete(path) {
		let node = this.get(path);
		if (node === null || node.parent === null) return null;
		else if (!node.has_Open()) {
			node.parent.remove(node);
			node.on_Delete();
			return node;
		}
	}

	on_Delete() {
		let stack = [this];
		while (stack.length > 0) {
			let node = stack.pop();
			for (let i = 0; i < node.children.length; i++) {
				let n = node.children[i];
				if (n.type === 'folder') {
					stack.push(n);
				}
				else if (n.type === 'file') {
					n.on_Delete();
				}
			}
		}
	}

	static is_Sub(a, b) {
		a = a.split('/');
		b = b.split('/');
		if (a.length < b.length) return false;
		for (let i = 0; i < b.length; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	move(from, to) {
		// //console.log(from, to, Directory.is_Sub(to, from))
		if (Directory.is_Sub(to, from)) return false;
		let nodefrom = this.get(from);
		let nodeto = this.get(to);
		if (nodefrom.parent === null) return false;
		if (nodeto.type !== 'folder') return false;
		if (nodefrom === null || nodeto === null) {
			return false;
		}
		else if (nodefrom.type === 'folder') {
			if (nodeto.has_Folder(nodefrom.name)) {
				return false
			}
		}
		else if (nodefrom.type === 'file') {
			if (nodeto.has_File(nodefrom.name)) {
				return false
			}
		}
		nodefrom.parent.remove(nodefrom);
		nodeto.append(nodefrom);
		nodefrom.on_PathChange();
		return true;
	}

	open(path, listener) {
		let file = this.get(path);
		if (file !== null && file.type === 'file') {
			return file.open(listener);
		}
	}

	close(path, listener) {
		let file = this.get(path);
		if (file !== null && file.type === 'file') {
			return file.close(listener);
		}
	}

	file_exist(path) {
		let file = this.get(path);
		if (file !== null && file.type === 'file') {
			return true;
		}
		return false;
	}

	on_PathChange() {
		let stack = [this];
		while (stack.length > 0) {
			let node = stack.pop();
			for (let i = 0; i < node.children.length; i++) {
				let n = node.children[i];
				if (n.type === 'folder') {
					stack.push(n);
				}
				else if (n.type === 'file') {
					n.on_PathChange();
				}
			}
		}
	}

	get_Object(path = null, deep = true) {
		path = path === null ? this.name : path + '/' + this.name
		let folder = { type: 'folder', path: path, name: this.name, list: [] }
		if (deep)
			this.children.forEach((child) => {
				folder.list.push(child.get_Object(path, deep))
			})
		return folder
	}

	get_Object_Pole(path, deep = true, presetPoleCode, sourceType, regionId, name, poleId) {

		path = path === null ? this.name : path + '/' + this.name
		let folder = { type: 'folder', path: path, name: this.name, list: [] }
		if (deep){
			this.children.forEach((child) => {
				if(child.name === name){
					child.presetPoleCode = presetPoleCode
					child.sourceType = sourceType
					child.regionId = regionId
					child.poleId = poleId
				}
				folder.list.push(child.get_Object_Pole(path, child.presetPoleCode, child.sourceType, child.regionId, child.poleId))
			})
		}
		return folder
	}

	get_ObjectShallow() {
		let path = this.get_AbsolutePath()
		let folder = { type: 'folder', path: this.get_AbsolutePath(), name: this.name, list: [] }
		this.children.forEach((child) => {
			folder.list.push(child.get_Object(path, false))
		})
		return folder
	}
}

// this is the base directory
// if you need to use filesystem use:
// import {ROOT, File, Directory} from 'FileSystem.js'
export const ROOT = new Directory('项目库')

// ROOT.create_Folder('杆件设计')
ROOT.create_File('测试合杆', 'pole', '{"components":{"poleId":17,"poleCode":"","isPlanningPole":true,"mainPole":{"mainId":2342,"mainPartsCode":null,"minorPoleFlag":null,"componentId":46,"fileAddr":"group1/M00/00/01/CggUzl6mi3mASJM4AAMKdFgAB9U911.STL","uid":null,"propertyInfo":{"material":"铝合金杆","thickness":"0","color":"哑光黑","partsType":"主杆","modelName":"ZG300-240-6.5-信达","length":"7000","weight":"0","shape":"十二棱形","topDiameter":"320","bottomDiameter":"280","ratedBend":"155","ratedTorque":"110","componentName":"主杆_主杆体底300-高7000"},"disassemblyPrimaryPoleList":[{"id":null,"componentId":46,"componentType":null,"disassemblyRawMaterialId":2,"disassemblyRawMaterialName":"侧边法兰一","disassemblyRawMaterialFileAddr":"group1/M00/00/03/CggUzl9wJGyASsNGAAFJPO7lvWk978.STL","flangeType":2,"sideFlangeHeight":5750,"sideFlangeAngle":270,"sideFlangeSpec":"法兰1： 6-M24","disassemblyType":2,"specsId":1,"moduleposition":["-0.25","0","0"],"modulerotation":["0","0","0"],"interfaces":[{"interfaceUID":525,"interfacename":"横臂插槽","slotType":2,"interfaceposition":["1.86","0","0"],"interfacerotation":["4.71238898038469","3.141592653589793","1.5707963267948966"],"rules":null}]},{"id":null,"componentId":46,"componentType":null,"disassemblyRawMaterialId":2,"disassemblyRawMaterialName":"侧边法兰一","disassemblyRawMaterialFileAddr":"group1/M00/00/03/CggUzl9wJGyASsNGAAFJPO7lvWk978.STL","flangeType":2,"sideFlangeHeight":6650,"sideFlangeAngle":270,"sideFlangeSpec":"法兰1： 6-M24","disassemblyType":2,"specsId":1,"moduleposition":["-0.25","0","0"],"modulerotation":["0","0","0"],"interfaces":[{"interfaceUID":525,"interfacename":"横臂插槽","slotType":2,"interfaceposition":["1.86","0","0"],"interfacerotation":["4.71238898038469","3.141592653589793","1.5707963267948966"],"rules":null}]},{"id":null,"componentId":46,"componentType":null,"disassemblyRawMaterialId":3,"disassemblyRawMaterialName":"底部法兰9","disassemblyRawMaterialFileAddr":"group1/M00/00/03/CggUzl-qRamAOEL1AAGN_E3qNQ8299.STL","flangeType":0,"sideFlangeHeight":null,"sideFlangeAngle":null,"sideFlangeSpec":"法兰9：8-M30","disassemblyType":3,"specsId":9,"moduleposition":["0","0.16","0"],"modulerotation":["0","0","0"],"interfaces":[]},{"id":null,"componentId":46,"componentType":null,"disassemblyRawMaterialId":4,"disassemblyRawMaterialName":"顶部法兰5,6","disassemblyRawMaterialFileAddr":"group1/M00/00/03/CggUzl9pjlOAfEH5AAFGHF75hGA059.STL","flangeType":1,"sideFlangeHeight":7000,"sideFlangeAngle":null,"sideFlangeSpec":"法兰3：8-M16","disassemblyType":4,"specsId":3,"moduleposition":["-0.1","0.61","0"],"modulerotation":["0","4.71238898038469","0"],"interfaces":[{"interfaceUID":524,"interfacename":"副杆插槽","slotType":1,"interfaceposition":["0","0.18","0"],"interfacerotation":["0","0","0"],"rules":null}]}],"moduleposition":["0","35.6","0"],"modulerotation":["0","0","0"],"interfaces":[],"vicePole":{"viceId":2346,"vicePartsCode":null,"componentId":19,"fileAddr":"group1/M00/00/01/CggUzl6OxiuAbNN7AALoFAkBesg082.STL","uid":null,"propertyInfo":{"material":"铝合金杆","thickness":"0","color":"哑光黑","partsType":"副杆","modelName":"FG160-160-2.5-信达","length":"2500","weight":"0","shape":"十二棱形","topDiameter":"160","bottomDiameter":"160","ratedBend":"8","ratedTorque":"50","componentName":"副杆_160铝型材3000"},"angle":0,"moduleposition":["0","15.55","0"],"modulerotation":["0","0","0"],"interfaces":[],"lampArms":[{"lampId":2347,"lampPartsCode":null,"componentId":30,"fileAddr":"group1/M00/00/01/CggUzl6Owv-ADcbVAAF9-NF7MtU893.stl","uid":null,"propertyInfo":{"material":"铝合金杆","thickness":"0","color":"哑光黑","partsType":"灯臂","modelName":"DB76-76-1.5-信达","length":"3000","weight":"0","shape":"十二棱形","topDiameter":"220","bottomDiameter":"260","ratedBend":"80","ratedTorque":"10","componentName":"灯臂_灯臂挑臂76管灯头LED"},"angle":270,"elevationAngle":10,"moduleposition":["13.612","3.75","0"],"modulerotation":["0","1.5707963267948966192313","0"],"interfaces":[],"xaxis":0.00,"yaxis":8630.00},{"lampId":2348,"lampPartsCode":null,"componentId":30,"fileAddr":"group1/M00/00/01/CggUzl6Owv-ADcbVAAF9-NF7MtU893.stl","uid":null,"propertyInfo":{"material":"铝合金杆","thickness":"0","color":"哑光黑","partsType":"灯臂","modelName":"DB76-76-1.5-信达","length":"3000","weight":"0","shape":"十二棱形","topDiameter":"220","bottomDiameter":"260","ratedBend":"80","ratedTorque":"10","componentName":"灯臂_灯臂挑臂76管灯头LED"},"angle":90,"elevationAngle":10,"moduleposition":["13.612","3.75","0"],"modulerotation":["0","1.5707963267948966192313","0"],"interfaces":[],"xaxis":0.00,"yaxis":8630.00}],"connectors":[],"xaxis":0.00,"yaxis":7030.00},"poleArms":[{"poleArmId":2349,"armPartsCode":null,"armAngle":0,"componentId":6,"fileAddr":"group1/M00/00/01/CggUzl6NL8qAWLAlAAGRHP7Hzkk402.STL","uid":null,"propertyInfo":{"material":null,"thickness":"5","color":"哑光黑","partsType":"横臂","modelName":"HB175-120-3.7-信达1","length":"5200","weight":"130","shape":"十二棱形","topDiameter":"220","bottomDiameter":"260","ratedBend":"13.5","ratedTorque":"10","componentName":"横臂_5.2M挑臂-锥杆"},"angle":270,"moduleposition":["0","26.1","-0.4"],"modulerotation":["4.696681017116741","0","0"],"interfaces":[{"interfaceUID":502,"interfacename":"搭载设备插槽","slotType":6,"interfaceposition":["0","29","0"],"interfacerotation":["1.5707963267948966","0","0"],"rules":null}],"carryEquips":[{"equipId":1533,"componentId":29,"fileAddr":"group1/M00/00/01/CggUzl6OcRCAJsHXAAX5Cpe_uYI572.STL","propertyInfo":{"shape":null,"length":"0","width":"0","height":"410","weight":"8","maxWindarea":"15000","diameter":null,"componentName":"球机-中（常用）","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["0","-3","0"],"modulerotation":["4.71238898038469","0","0"],"interfaces":[],"xaxis":1021.00,"yaxis":6650.00,"zaxis":0.00},{"equipId":1534,"componentId":28,"fileAddr":"group1/M00/00/01/CggUzl6OcKiAbVXHAAJV_DUMGl8545.STL","propertyInfo":{"shape":null,"length":"445","width":"140","height":"94","weight":"3","maxWindarea":"65000","diameter":null,"componentName":"固定枪机-中（常用）","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["0.4","1.2","0"],"modulerotation":["0","4.71238898038469","0"],"interfaces":[],"xaxis":1333.00,"yaxis":6650.00,"zaxis":0.00},{"equipId":1535,"componentId":54,"fileAddr":"group1/M00/00/02/CggUzl6mlLWAE5BdAAAFzK3F0qQ431.STL","propertyInfo":{"shape":null,"length":"322","width":"270","height":"118","weight":"6","maxWindarea":"87000","diameter":null,"componentName":"通用闪光灯","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["1","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[],"xaxis":2230.00,"yaxis":6650.00,"zaxis":0.00},{"equipId":1536,"componentId":40,"fileAddr":"group1/M00/00/02/CggUzl6mlBmAWffQAAACrJqyATY316.STL","propertyInfo":{"shape":null,"length":"2400","width":"1200","height":"0","weight":"100","maxWindarea":"0","diameter":null,"componentName":"长方形-2400*1200","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":1600,"equipLength":1800,"moduleposition":["1","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[],"xaxis":3870.00,"yaxis":6200.00,"zaxis":0.00}],"xaxis":0.00,"yaxis":6650.00},{"poleArmId":2350,"armPartsCode":null,"armAngle":0,"componentId":6,"fileAddr":"group1/M00/00/01/CggUzl6NL8qAWLAlAAGRHP7Hzkk402.STL","uid":null,"propertyInfo":{"material":null,"thickness":"5","color":"哑光黑","partsType":"横臂","modelName":"HB175-120-3.7-信达1","length":"5200","weight":"130","shape":"十二棱形","topDiameter":"220","bottomDiameter":"260","ratedBend":"13.5","ratedTorque":"10","componentName":"横臂_5.2M挑臂-锥杆"},"angle":270,"moduleposition":["0","26.1","-0.4"],"modulerotation":["4.696681017116741","0","0"],"interfaces":[{"interfaceUID":502,"interfacename":"搭载设备插槽","slotType":6,"interfaceposition":["0","29","0"],"interfacerotation":["1.5707963267948966","0","0"],"rules":null}],"carryEquips":[{"equipId":1537,"componentId":29,"fileAddr":"group1/M00/00/01/CggUzl6OcRCAJsHXAAX5Cpe_uYI572.STL","propertyInfo":{"shape":null,"length":"0","width":"0","height":"410","weight":"8","maxWindarea":"15000","diameter":null,"componentName":"球机-中（常用）","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["0","-3","0"],"modulerotation":["4.71238898038469","0","0"],"interfaces":[],"xaxis":2035.00,"yaxis":5750.00,"zaxis":0.00},{"equipId":1538,"componentId":28,"fileAddr":"group1/M00/00/01/CggUzl6OcKiAbVXHAAJV_DUMGl8545.STL","propertyInfo":{"shape":null,"length":"445","width":"140","height":"94","weight":"3","maxWindarea":"65000","diameter":null,"componentName":"固定枪机-中（常用）","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":270,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["0.4","1.2","0"],"modulerotation":["0","4.71238898038469","0"],"interfaces":[],"xaxis":1300.00,"yaxis":5750.00,"zaxis":0.00}],"xaxis":0.00,"yaxis":5750.00}],"connectors":[{"connectorId":2343,"connectPartsCode":null,"componentId":100,"fileAddr":"group1/M00/00/02/CggUzl6mlLWAE5BdAAAFzK3F0qQ431.STL","angle":90,"lookingDirectionAngle":90,"carryEquips":[{"equipId":1530,"componentId":37,"fileAddr":"group1/M00/00/02/CggUzl6mliGAJz7HAABcIOyeVAo115.STL","propertyInfo":{"shape":null,"length":"800","width":"800","height":"800","weight":"0","maxWindarea":"0","diameter":null,"componentName":"八角形-600","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":90,"lookingDirectionAngle":90,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["1","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[],"xaxis":100.00,"yaxis":3929.00,"zaxis":-100.00}],"moduleposition":["0","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[{"interfaceUID":539,"interfacename":"搭载设备插槽","slotType":6,"interfaceposition":["0","0","0"],"interfacerotation":["0","0","0"],"rules":null}],"xaxis":100.00,"yaxis":3929.00,"zaxis":-100.00},{"connectorId":2344,"connectPartsCode":null,"componentId":100,"fileAddr":"group1/M00/00/02/CggUzl6mlLWAE5BdAAAFzK3F0qQ431.STL","angle":0,"lookingDirectionAngle":0,"carryEquips":[{"equipId":1531,"componentId":39,"fileAddr":"group1/M00/00/02/CggUzl6mllSAOZSEAAAEPGIOP4Q723.STL","propertyInfo":{"shape":null,"length":"0","width":"0","height":"0","weight":"0","maxWindarea":"0","diameter":null,"componentName":"三角形-900","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":0,"lookingDirectionAngle":0,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["1","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[],"xaxis":100.00,"yaxis":1930.00,"zaxis":0.00}],"moduleposition":["0","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[{"interfaceUID":539,"interfacename":"搭载设备插槽","slotType":6,"interfaceposition":["0","0","0"],"interfacerotation":["0","0","0"],"rules":null}],"xaxis":100.00,"yaxis":1930.00,"zaxis":0.00},{"connectorId":2345,"connectPartsCode":null,"componentId":31,"fileAddr":"group1/M00/00/02/CggUzl6yZiCACBFyAADA6JT8d4I636.stl","angle":0,"lookingDirectionAngle":180,"carryEquips":[{"equipId":1532,"componentId":33,"fileAddr":"group1/M00/00/02/CggUzl6mla2AGO57AAToMItr2p0398.STL","propertyInfo":{"shape":null,"length":"600","width":"300","height":"0","weight":"9","maxWindarea":"180000","diameter":null,"componentName":"竖向两灯头行人信号灯","orgType":null},"cableInfo":{"cableCode":null,"cableTypeName":null,"cableModelName":null,"cableSpecName":null,"poleWarehouseCode":null},"angle":90,"lookingDirectionAngle":90,"uid":null,"equipWidth":null,"equipLength":null,"moduleposition":["0","0","0"],"modulerotation":["3.141592653589793","1.5707963267948966","0"],"interfaces":[],"xaxis":0.00,"yaxis":3030.00,"zaxis":1550.00}],"moduleposition":["7.5","0","0"],"modulerotation":["0","1.5707963267948966","0"],"interfaces":[{"interfaceUID":538,"interfacename":"搭载设备插槽","slotType":6,"interfaceposition":["15.5","0.3","0"],"interfacerotation":["0","0","0"],"rules":null}],"xaxis":0,"yaxis":3030,"zaxis":0}]}},"acrossMultiTransverseArm":{"1536":[2349,2350]}}')
// let ans = ROOT.create_Folder('模板')

// save();

// function save_Traverse(node, obj) {
// 	for (let i = 0; i < node.children.length; i++) {
// 		let child = node.children[i];
// 		if (child.type === 'folder') {
// 			let folder = obj.folder(child.name);
// 			save_Traverse(child, folder);
// 		}
// 		else if (child.type === 'file') {
// 			obj.file(child.name + '.' + child.filetype, child.data);
// 		}
// 	}
// }

// export function save_Project() {
// 	let zip = new JSZip();
// 	save_Traverse(ROOT, zip);
// 	zip.generateAsync({ type: "blob" })
// 		.then(function (blob) {
// 			saveAs(blob, "hello.zip");
// 		});
// }

// save a single file

function uint8arrayToBase64(u8Arr) {
	let CHUNK_SIZE = 0x8000; //arbitrary number
	let index = 0;
	let length = u8Arr.length;
	let result = '';
	let slice;
	while (index < length) {
		slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
		result += String.fromCharCode.apply(null, slice);
		index += CHUNK_SIZE;
	}
	return btoa(result);
}

function save_Traverse(node) {
	if (node.type === 'folder') {
		let ans = { type: 'folder', name: node.name, children: [] }
		for (let i = 0; i < node.children.length; i++) {
			let child = node.children[i];
			ans.children.push(save_Traverse(child));
		}
		return ans;
	}
	else if (node.type === 'file') {
		if (node.data instanceof ArrayBuffer) {
			let uint8_msg = new Uint8Array(node.data);
			let str = uint8arrayToBase64(uint8_msg)
			return { type: 'file', name: node.name, filetype: node.filetype, data: str, binary: true }
		}
		return { type: 'file', name: node.name, filetype: node.filetype, data: node.data }
	}
}

export function save_Project() {
	let project = JSON.stringify(save_Traverse(ROOT))
	let blob = new Blob([project], { type: "text/plain;charset=utf-8" });
	saveAs(blob, ROOT.name + ".poledesign");
}

function base64ToUint8Array(base64String) {
	let padding = '='.repeat((4 - base64String.length % 4) % 4);
	let base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	let rawData = window.atob(base64);
	let outputArray = new Uint8Array(rawData.length);

	for (var i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function load_Traverse(parent, data) {
	data.children.forEach((child) => {
		if (child.type === 'folder') {
			let folder = parent.create_Folder(child.name);
			load_Traverse(folder, child);
		}
		else if (child.type === 'file') {
			if (!child.binary)
				parent.create_File(child.name, child.filetype, child.data);
			else {
				let arraybuffer = (base64ToUint8Array(child.data)).buffer;
				parent.create_File(child.name, child.filetype, arraybuffer);
			}
		}
	})
}

export function load_Project(data) {
	// remove
	let removepath = ROOT.children.map((child) => {
		return child.get_AbsolutePath();
	});
	removepath.forEach((path) => {
		ROOT.delete(path);
	})
	ROOT.name = data.name;
	load_Traverse(ROOT, data);
	// //console.log(ROOT);
}

export async function open_Project() {
	try {
		let [fileHandle] = await window.showOpenFilePicker();
		const file = await fileHandle.getFile()
		return file.text()
	} catch (error) {

	}
	return null
}
