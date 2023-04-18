let VUE = null
var stl = require('stl')

export function set_Console(vue) {
	VUE = vue
}

export function customLog(that = VUE, type, ID, Title, Info = "No Info") {
	if (type === "error") {
		console.error("%c" + ID + "%c" + Title + "%c", "padding: 2px 8px ; background-color: rgb(233, 40, 50); border-radius: 6px 0px 0px 6px; font-weight:bold; color: white;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 6px 6px 0px; color: white;", "");
		if (that !== null)
			that.$EventBus.$emit('console_add_Output', "error", Title, Info)
	}
	else if (type === "info") {
		console.info("%c" + ID + "%c" + Title + "%c", "padding: 2px 8px ; background-color: rgb(240, 200, 97); border-radius: 6px 0px 0px 6px; font-weight:bold; color: white;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 6px 6px 0px; color: white;", "");
		if (that !== null)
			that.$EventBus.$emit('console_add_Output', "info", Title, Info)
	}
	else {
		//console.log("%c" + ID + "%c" + Title + "%c", "padding: 2px 8px ; background-color: rgb(186, 186, 186); border-radius: 6px 0px 0px 6px; font-weight:bold; color: black;", "padding: 2px 8px ; background-color: rgb(50,50,50); border-radius: 0px 6px 6px 0px; color: white;", "");
		if (that !== null)
			that.$EventBus.$emit('console_add_Output', "log", Title, Info)
	}
}

export const HTML = {
	create_KeyPair(title, info, color) {
		let fontcolor = 'white'
		switch (color) {
			case 'String':
				color = 'rgb(95, 50, 251)'
				break
			case 'Number':
				color = 'rgb(255, 215, 86)'
				fontcolor = 'rgb(50,50,50)'
				break
			case 'Float':
				color = 'rgb(81, 186, 255)'
				fontcolor = 'rgb(50,50,50)'
				break
			case 'Bool':
				color = 'rgb(230, 69, 69)'
				break
			case 'Module':
				color = 'rgb(60, 80, 240)'
				break
			case 'Slot':
				color = 'rgb(28, 145, 81)'
				break
			case 'Plugin':
				color = 'rgb(121, 85, 72)'
				break
			case 'File':
				color = 'rgb(0, 150, 136)'
				break
		}
		let str = "<span style=\"padding: 4px 8px ;  background-color:" + color + "; border-radius: var(--ObjectRadius) 0px 0px var(--ObjectRadius); color:" + fontcolor + ";font-weight:bold;\">" + title + "</span><span style=\"padding: 4px 8px ;  background-color: rgb(50,50,50); border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; color: white;\">" + info + "</span>"
		return str
	},

	create_UList(array) {
		let str = '<ul>'
		array.forEach((item) => {
			str += '<li>' + item + '</li>'
		});
		str += '</ul>'
		return str
	},

	create_List(array) {
		let str = '<ol>'
		array.forEach((item) => {
			str += '<li>' + item + '</li>'
		});
		str += '</ol>'
		return str
	},

	create_Or(array) {
		return array.join(' <span style="color: rgb(150,150,150,0.5);">/</span> ')
	},

	create_TabOr(array) {
		return array.join(' <a style="width: 20px; padding: 0px 10px;"></a> ')
	},

	create_Tab() {
		return '<a style="width: 20px; padding: 0px 10px;"></a>'
	},

	create_Warn() {
		return "<span style=\"padding: 4px 8px ;  background-color: rgb(240, 200, 97); border-radius: var(--ObjectRadius); color: black; font-weight:bold;\">警告</span>"
	},

	create_Error() {
		return "<span style=\"padding: 4px 8px ;  background-color: rgb(221, 59, 59); border-radius: var(--ObjectRadius); color: white; font-weight:bold;\">错误</span>"
	},

	create_Strong(str, color) {
		return "<span style=\"padding: 4px 8px ;  background-color: " + color + "; border-radius: var(--ObjectRadius); color: white; font-weight:bold;\">" + str + "</span>"
	},

	create_Mouse(type) {
		switch (type) {
			case 'left':
				return '<svg viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5163" xmlns:xlink="http://www.w3.org/1999/xlink"> <path d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z"></path></svg>'
		}
	},

	create_Button(type) {
		return '<a style="padding: 4px 4px 8px 4px; background-color: white; color: black; font-size: 10px; position: relative; bottom: 2px; margin: 0px 0px; border-radius: 3px; box-shadow: inset 0px -3px #757575;">' + type + '</a>'
	}
}

export function change_UITheme(theme) {
	let body_element = document.body
	switch (theme) {
		case 'dark':
			body_element.style.setProperty('--ThemeColor', 'rgb(75,150,240)')
			body_element.style.setProperty('--BGColor', 'rgb(42,42,42)')
			body_element.style.setProperty('--PanelColor', 'rgb(5,5,5)')
			body_element.style.setProperty('--ObjectColor', 'rgb(100,100,100)')
			body_element.style.setProperty('--ObjectBGColor', 'rgb(62,62,62)')
			body_element.style.setProperty('--BarColor', 'rgb(56,56,56)')
			body_element.style.setProperty('--BarColorTransparent', 'rgb(182,182,182,0.5)')
			body_element.style.setProperty('--ThemeColorTransparent', 'rgb(67, 133, 218,0.25)')
			body_element.style.setProperty('--ContainerColor', 'rgb(92,92,92)')
			body_element.style.setProperty('--FontColor', 'rgb(255,255,255)')
			body_element.style.setProperty('--FontColorReverse', 'rgb(255,255,255)')
			body_element.style.setProperty('--FontColorDark', 'rgb(0,0,0)')
			body_element.style.setProperty('--ScrollColor', 'rgb(72,72,72)')
			body_element.style.setProperty('--ContainerRadius', '8px')
			body_element.style.setProperty('--CanvasRadius', '8px')
			body_element.style.setProperty('--ObjectBGRadius', '6px')
			body_element.style.setProperty('--ObjectRadius', '4px')
			body_element.style.setProperty('--ElementColorRed', 'rgb(255,86,86)')
			body_element.style.setProperty('--ElementColorGreen', 'rgb(82, 179, 109)')
			body_element.style.setProperty('--ElementColorBlue', 'rgb(70, 143, 255)')
			window.localStorage.theme = 'dark'
			break;
		case 'light':
			body_element.style.setProperty('--ThemeColor', 'rgb(67, 133, 218)')
			body_element.style.setProperty('--PanelColor', 'rgb(253, 253, 253)')
			body_element.style.setProperty('--BGColor', 'rgb(253, 253, 253)')
			body_element.style.setProperty('--ObjectColor', 'rgb(220, 220, 220)')
			body_element.style.setProperty('--ObjectBGColor', 'rgb(186,186,186)')
			body_element.style.setProperty('--BarColor', 'rgb(195,195,195)')
			body_element.style.setProperty('--BarColorTransparent', 'rgb(100,100,100,0.5)')
			body_element.style.setProperty('--ThemeColorTransparent', 'rgb(67, 133, 218,0.25)')
			body_element.style.setProperty('--ContainerColor', 'rgb(230,230,230)')
			body_element.style.setProperty('--FontColor', 'rgb(0,0,0)')
			body_element.style.setProperty('--FontColorReverse', 'rgb(255,255,255)')
			body_element.style.setProperty('--FontColorDark', 'rgb(0,0,0)')
			body_element.style.setProperty('--ScrollColor', 'rgb(205,205,205)')
			body_element.style.setProperty('--ContainerRadius', '8px')
			body_element.style.setProperty('--CanvasRadius', '8px')
			body_element.style.setProperty('--ObjectBGRadius', '6px')
			body_element.style.setProperty('--ObjectRadius', '4px')
			body_element.style.setProperty('--ElementColorRed', 'rgb(255,86,86)')
			body_element.style.setProperty('--ElementColorGreen', 'rgb(82, 179, 109)')
			body_element.style.setProperty('--ElementColorBlue', 'rgb(70, 143, 255)')
			// body_element.style.setProperty('--ElementColorRed', 'rgb(249, 229, 229)')
			// body_element.style.setProperty('--ElementColorGreen', 'rgb(220, 243, 231)')
			// body_element.style.setProperty('--ElementColorBlue', 'rgb(204, 224, 255)')
			window.localStorage.theme = 'light'
			break;
		case 'highcontrast':
			body_element.style.setProperty('--ThemeColor', '#FFC107')
			body_element.style.setProperty('--BGColor', 'rgb(0, 0, 0)')
			body_element.style.setProperty('--ObjectColor', 'rgb(0, 0, 0)')
			body_element.style.setProperty('--ObjectBGColor', '#2b617a')
			body_element.style.setProperty('--BarColor', '#FFC107')
			body_element.style.setProperty('--BarColorTransparent', 'rgb(182,182,182,0.5)')
			body_element.style.setProperty('--ThemeColorTransparent', 'rgb(67, 133, 218,0.25)')
			body_element.style.setProperty('--ContainerColor', 'rgb(28,28,28)')
			body_element.style.setProperty('--FontColor', 'rgb(255,255,255)')
			body_element.style.setProperty('--FontColorReverse', 'rgb(0,0,0)')
			body_element.style.setProperty('--FontColorDark', 'rgb(0,0,0)')
			body_element.style.setProperty('--ScrollColor', 'rgb(72,72,72)')
			body_element.style.setProperty('--ContainerRadius', '8px')
			body_element.style.setProperty('--CanvasRadius', '8px')
			body_element.style.setProperty('--ObjectBGRadius', '6px')
			body_element.style.setProperty('--ObjectRadius', '4px')
			body_element.style.setProperty('--ElementColorRed', '#FFC107')
			body_element.style.setProperty('--ElementColorGreen', '#FFC107')
			body_element.style.setProperty('--ElementColorBlue', '#FFC107')
			// body_element.style.setProperty('--ElementColorRed', 'rgb(249, 229, 229)')
			// body_element.style.setProperty('--ElementColorGreen', 'rgb(220, 243, 231)')
			// body_element.style.setProperty('--ElementColorBlue', 'rgb(204, 224, 255)')
			window.localStorage.theme = 'light'
			break;
	}
}

export function change_UIThemeColor(r, g, b) {
	document.body.style.setProperty('--ThemeColor', 'rgb(' + r + ',' + g + ',' + b + ')')
}

export const ICONMAP = {
	'blank': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden"></svg>',
	'组件列表': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden"> <g> <path d="M30 19.5 15 28.6 48 48.6 63 39.5Z" /> <path d="M15 36.6 15 68.6 46 87.4 46 52.1 15 33.3Z" /> <path d="M81 28.6 48 8.6 33.8 17.2 66.8 37.2Z" /> <path d="M61 57.6 54 61.6 54 54.6 61 50.6 61 57.6ZM50 52.1 50 87.4 81 68.6 81 33.3 50 52.1Z" /> </g> </svg>',
	'大纲': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5163" xmlns:xlink="http://www.w3.org/1999/xlink"> <path d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z"></path></svg>',
	'检视器': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"> <g transform="translate(-591 -311)"> <path d="M622.38 382.62 599.76 360 621.88 337.88 626.12 342.12 608.24 360 626.62 378.38 622.38 382.62Z" /> <path d="M657.12 382.62 652.88 378.38 671.26 360 653.38 342.12 657.62 337.88 679.74 360 657.12 382.62Z" /> <path d="M645 360C645 362.761 642.761 365 640 365 637.239 365 635 362.761 635 360 635 357.239 637.239 355 640 355 642.761 355 645 357.239 645 360Z" /> <path d="M629 360C629 362.761 626.761 365 624 365 621.239 365 619 362.761 619 360 619 357.239 621.239 355 624 355 626.761 355 629 357.239 629 360Z" /> <path d="M661 360C661 362.761 658.761 365 656 365 653.239 365 651 362.761 651 360 651 357.239 653.239 355 656 355 658.761 355 661 357.239 661 360Z" /> </g> </svg>',
	'控制台': '<svg class="icon-dark small" style="margin: 0px;" viewBox="40 0 964 964" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5560" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M306.89 142.8H717.1c90.62 0.22 163.9 73.87 163.68 164.49-0.22 90.31-73.38 163.46-163.68 163.68H306.89c-90.62-0.22-163.9-73.87-163.68-164.49 0.22-90.3 73.38-163.45 163.68-163.68z m0 246.13c45.31 0 82.04-36.73 82.04-82.04s-36.73-82.04-82.04-82.04-82.04 36.73-82.04 82.04 36.73 82.04 82.04 82.04z" p-id="5561"></path><path d="M306.89 553.02H717.1c90.62 0.22 163.9 73.87 163.68 164.49-0.22 90.31-73.38 163.46-163.68 163.68H306.89c-90.62-0.22-163.9-73.87-163.68-164.49 0.22-90.3 73.38-163.45 163.68-163.68zM717.1 799.15c45.31 0 82.04-36.73 82.04-82.04 0-45.31-36.73-82.04-82.04-82.04s-82.04 36.73-82.04 82.04c0 45.31 36.73 82.04 82.04 82.04z" opacity=".3" p-id="5562"></path></svg>',
	'画布': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8892" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M478.1 327.9c-10-9.6-21.8-17.2-35.3-22.9-13.6-5.7-28-8.6-43.2-8.6-15.7 0-30.3 2.8-43.9 8.6-13.6 5.7-25.3 13.3-35.3 22.9-10 9.6-18 20.9-23.9 33.9-6 13-8.9 26.8-8.9 41.4 0 14.6 3 28.4 8.9 41.4 6 13 13.9 24.4 23.9 34.2 10 9.8 21.8 17.6 35.3 23.3 13.6 5.7 28.2 8.6 43.9 8.6 15.2 0 29.6-2.9 43.2-8.6 13.6-5.7 25.3-13.5 35.3-23.3 10-9.8 18-21.2 23.9-34.2 5.9-13 8.9-26.8 8.9-41.4 0-14.6-3-28.4-8.9-41.4-5.9-13.1-13.9-24.4-23.9-33.9z m391.3-203.3H152.5c-48.9 0-88.5 38-88.5 84.9V811c0 46.9 39.6 84.9 88.5 84.9h716.8c48.9 0 88.5-38 88.5-84.9V209.5c0.1-46.9-39.5-84.9-88.4-84.9z m-0.7 570.1c-9.5-21-20.6-42.4-33.2-64.3-12.6-21.9-26.4-41.7-41.4-59.5-15-17.8-31.3-32.3-48.9-43.5-17.6-11.2-35.9-16.8-55-16.8-22.4 0-41.4 4.2-57.1 12.6-15.7 8.5-29.3 19-40.7 31.8-11.4 12.8-21.7 26.5-30.7 41.1-9 14.6-18.1 28.3-27.1 41.1S515.7 660.6 505 669c-10.7 8.4-23.4 12.6-38.2 12.6-14.8 0-27.4-1-37.8-3.1-10.5-2.1-19.9-4.7-28.2-7.9s-16.1-6.7-23.2-10.6c-7.1-3.9-14.9-7.4-23.2-10.6-8.3-3.2-17.8-5.8-28.6-7.9-10.7-2.1-23.4-3.1-38.2-3.1-12.4 0-24.6 3.1-36.8 9.2-12.1 6.2-23.9 14-35.3 23.6-11.4 9.6-22.4 20.3-32.8 32.2-10.5 11.9-20 23.7-28.6 35.6V248c0-21 17.8-38 39.7-38H829c21.9 0 39.7 17 39.7 38v446.7z" p-id="8893"></path></svg>',
	'delete': '<svg class="icon-dark small" style="margin: 0px; fill: var(--ElementColorRed)"  viewBox="12 8 88 98" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"> <g transform="translate(-252 -261)"> <path d="M340.25 288.833 322.542 288.833 322.542 283.625C322.542 279.563 319.313 276.333 315.25 276.333L302.75 276.333C298.688 276.333 295.458 279.563 295.458 283.625L295.458 288.833 277.75 288.833C275.458 288.833 273.583 290.708 273.583 293L273.583 297.167 344.417 297.167 344.417 293C344.417 290.708 342.542 288.833 340.25 288.833ZM301.708 283.625C301.708 283 302.125 282.583 302.75 282.583L315.25 282.583C315.875 282.583 316.292 283 316.292 283.625L316.292 288.833 301.708 288.833 301.708 283.625Z" /> <path d="M279.833 355.5C279.833 357.792 281.708 359.667 284 359.667L334 359.667C336.292 359.667 338.167 357.792 338.167 355.5L338.167 301.333 279.833 301.333 279.833 355.5ZM322.542 307.583 328.792 307.583 328.792 353.417 322.542 353.417 322.542 307.583ZM305.875 307.583 312.125 307.583 312.125 353.417 305.875 353.417 305.875 307.583ZM289.208 307.583 295.458 307.583 295.458 353.417 289.208 353.417 289.208 307.583Z" /> </g> </svg>',
	'more': '<svg class="icon-dark small" style="margin: 0px;"  viewBox="-200 -80 1224 1244" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2168" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"><path d="M642.5 513.1L310 180.6c-15.7-15.7-15.7-41.2 0-56.9 15.7-15.7 41.2-15.7 56.9 0L726 482.8c8.3 8.3 12.3 19.4 11.7 30.3 0.5 10.9-3.4 22-11.7 30.3L367 902.5c-15.7 15.7-41.2 15.7-56.9 0-15.7-15.7-15.7-41.2 0-56.9l332.4-332.5z"></path></svg>',
	'cancel': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 115 116" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"><g transform="translate(-561 -534)"><path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8" fill-rule="evenodd" /><path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8" fill-rule="evenodd" /></g></svg>',
	'check': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 115 115" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"><g transform="translate(-534 -322)"><path d="M551 379.832 585.727 409 632 345" stroke-width="9" stroke-miterlimit="8" fill="none" fill-rule="evenodd" /></g></svg>',
	'slot': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4127" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128" style="pointer-events: none;"><path d="M895.5 314.2c11 11.3 16.6 24.7 16.6 40.4 0 15.6-5.6 29.1-16.6 40.4L716.4 573.6l67 67-71.4 71.5c-48.5 48.5-106.5 76.3-173.9 83.2-67.4 7-128.7-8-183.7-44.8L192.8 912H112v-80.8l161.6-161.6c-36.9-55-51.8-116.3-44.8-183.7s34.7-125.3 83.3-173.9l71.4-71.4 67 67 178.6-179c11.3-11 24.8-16.6 40.7-16.6 15.8 0 29.2 5.6 40.2 16.6 11 11 16.6 24.5 16.6 40.4 0 16-5.6 29.4-16.6 40.4L531.2 388.3l104.5 104.5 179.1-178.6c11.3-11 24.8-16.6 40.7-16.6 15.5 0.1 28.9 5.6 40 16.6z" p-id="4128"></path></svg>',
	'select': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-30 -30 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2886"><path d="M884.363636 46.545455c51.2 0 93.090909 41.890909 93.090909 93.090909v744.727272c0 51.2-41.890909 93.090909-93.090909 93.090909H139.636364c-51.2 0-93.090909-41.890909-93.090909-93.090909V139.636364c0-51.2 41.890909-93.090909 93.090909-93.090909h744.727272z m23.272728 837.818181V139.636364c0-12.613818-10.658909-23.272727-23.272728-23.272728H139.636364c-12.613818 0-23.272727 10.658909-23.272728 23.272728v744.727272c0 12.613818 10.658909 23.272727 23.272728 23.272728h744.727272c12.613818 0 23.272727-10.658909 23.272728-23.272728z"></path></svg>',
	'selected': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-30 -30 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3075"><path d="M771.607273 359.726545l-289.28 349.09091a34.839273 34.839273 0 0 1-50.594909 3.374545l-176.174546-162.909091a34.955636 34.955636 0 0 1-1.931636-49.361454 34.978909 34.978909 0 0 1 49.338182-1.931637l149.131636 137.890909 265.728-320.698182a34.932364 34.932364 0 0 1 53.783273 44.544M884.363636 46.545455H139.636364C88.436364 46.545455 46.545455 88.436364 46.545455 139.636364v744.727272c0 51.2 41.890909 93.090909 93.090909 93.090909h744.727272c51.2 0 93.090909-41.890909 93.090909-93.090909V139.636364c0-51.2-41.890909-93.090909-93.090909-93.090909"></path></svg>',
	'cover': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-40 -40 1104 1104" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M1024 256v124c0 2.2-1.8 4-4 4h-56c-2.2 0-4-1.8-4-4V256H848c-8.8 0-16 7.2-16 16v496c0 35.3-28.7 64-64 64H272c-8.8 0-16 7.2-16 16v112h124c2.2 0 4 1.8 4 4v56c0 2.2-1.8 4-4 4H256c-35.3 0-64-28.7-64-64V848c0-8.8-7.2-16-16-16H64c-35.3 0-64-28.7-64-64V64C0 28.6 28.7 0 64 0h704c35.3 0 64 28.6 64 64v112c0 8.8 7.2 16 16 16h112c35.3 0 64 28.6 64 64zM960 1024H836c-2.2 0-4-1.8-4-4v-56c0-2.2 1.8-4 4-4h108c8.8 0 16-7.2 16-16V836c0-2.2 1.8-4 4-4h56c2.2 0 4 1.8 4 4v124c0 35.3-28.7 64-64 64z"></path><path d="M732 1024H484c-2.2 0-4-1.8-4-4v-56c0-2.2 1.8-4 4-4h248c2.2 0 4 1.8 4 4v56c0 2.2-1.8 4-4 4zM1020 736h-56c-2.2 0-4-1.8-4-4V484c0-2.2 1.8-4 4-4h56c2.2 0 4 1.8 4 4v248c0 2.2-1.8 4-4 4z"></path></svg>',
	'资源管理器': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M928.426667 354.986667L213.333333 687.786667 102.4 450.56 781.653333 134.826667c20.48-10.24 44.373333 0 52.906667 18.773333l93.866667 201.386667z" opacity=".3"></path><path d="M459.093333 262.826667l-6.826666-51.2c-1.706667-15.36-13.653333-25.6-29.013334-25.6H114.346667c-15.36 0-29.013333 13.653333-29.013334 29.013333v658.773333c0 15.36 13.653333 29.013333 29.013334 29.013334h795.306666c15.36 0 29.013333-13.653333 29.013334-29.013334V317.44c0-15.36-13.653333-29.013333-29.013334-29.013333H488.106667c-15.36 0-27.306667-10.24-29.013334-25.6z"></path></svg>',
	'clone': '<svg class="icon-dark small" style="margin: 0px;" viewBox="100 100 824 824" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M675.91 265.87H388.93c-67.97 0-123.07 55.1-123.07 123.07v286.97c-53.25-2.63-82.04-33.84-82.04-89.32V273.33c0-58.01 31.49-89.5 89.5-89.5h313.26c55.48 0 86.7 28.79 89.33 82.04z" opacity=".3"></path><path d="M437.41 347.91h313.26c58.02 0 89.5 31.49 89.5 89.5v313.26c0 58.02-31.48 89.5-89.5 89.5H437.41c-58.02 0-89.5-31.48-89.5-89.5V437.41c0-58.01 31.49-89.5 89.5-89.5z"></path></svg>',
	'pole': '<svg class="icon-dark" style="margin: 0px;" viewBox="0 0 1447 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" ><path d="M598.200767 1011.094488L11.885832 672.584025c-17.568695-10.144043-15.368135-27.873754 4.91995-39.57429l764.166661-441.203241c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.510463c17.568695 10.144043 15.368135 27.873754-4.91995 39.592181l-764.166662 441.18535c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#8F95AB" p-id="7742"></path><path d="M598.200767 952.681261L11.885832 614.170798c-17.568695-10.144043-15.368135-27.873754 4.91995-39.592181l764.166661-441.18535C801.260529 121.65695 831.943127 120.404599 849.529713 130.602314l586.314935 338.45679c17.568695 10.144043 15.368135 27.873754-4.91995 39.57429L666.758036 949.836635c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#ADB8D0" p-id="7743"></path><path d="M598.200767 890.833015L11.885832 552.322552C-5.682863 542.089056-3.553866 524.448798 16.805782 512.730371L780.972443 71.562912c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.492572c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 887.988389c-20.288085 11.700536-50.988575 12.988668-68.557269 2.844626z" fill="#C7CEE2" p-id="7744"></path><path d="M598.200767 828.966878L11.885832 490.456415C-5.682863 480.312372-3.553866 462.600551 16.805782 450.846343L780.972443 9.696775c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626L1435.844648 345.291049c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 826.122252c-20.288085 11.718427-50.988575 12.952887-68.557269 2.844626z" fill="#F5F8FC" p-id="7745"></path><path d="M877.439248 416.156222L544.6896 224.027695l211.951453-122.372579 332.76754 192.128527-211.969345 122.372579z" fill="#D7DEED" p-id="7746"></path><path d="M1230.154949 421.541331l-118.526072-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l118.526073 68.432034a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0zM1166.338723 459.254985l-118.526073-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l118.526072 68.432035a14.813523 14.813523 0 0 1 0 25.655303 14.813523 14.813523 0 0 1-14.813522 0zM980.883437 569.300853l-491.995017-284.068978a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l491.995018 284.051087a14.831413 14.831413 0 0 1 0 25.673195 14.813523 14.813523 0 0 1-14.813523 0zM462.642722 355.631889l-47.839807-27.641174a14.795632 14.795632 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l47.839806 27.623284a14.831413 14.831413 0 0 1 0 25.673194 14.885086 14.885086 0 0 1-14.813522 0zM905.527691 610.073822L511.699098 382.611107a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813522 0l393.828594 227.409043a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0.071563zM832.730319 654.800641l-491.995017-284.068977a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l491.995017 284.068978a14.831413 14.831413 0 0 1 0 25.673194 14.831413 14.831413 0 0 1-14.813523 0zM658.653537 637.231947L268.92192 412.220262a14.831413 14.831413 0 0 1 0-25.673195 14.813523 14.813523 0 0 1 14.813523 0l389.731616 225.011685a14.831413 14.831413 0 0 1 0 25.673195 14.885086 14.885086 0 0 1-14.813522 0zM722.255074 673.94372l37.248496 21.468874a14.813523 14.813523 0 0 0 14.813523 0 14.813523 14.813523 0 0 0 0-25.655304l-37.266387-21.468874a14.813523 14.813523 0 0 0-14.813522 0 14.813523 14.813523 0 0 0 0.01789 25.655304zM679.87194 737.634712L192.564293 456.303015a14.831413 14.831413 0 0 1 0-25.673194 14.831413 14.831413 0 0 1 14.831414 0L694.685463 712.050971a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523-0.071563zM1043.500985 467.287922l-64.066697-36.980134a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l64.066696 36.998025a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813522 0z" fill="#C7CEE2" p-id="7747"></path></svg>',
	'txt': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-150 -150 1324 1324" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M981.333333 276.053333V981.333333a42.666667 42.666667 0 0 1-42.666666 42.666667H85.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V42.666667a42.666667 42.666667 0 0 1 42.666666-42.666667h619.946667z" fill="#4C98FC" p-id="11324"></path><path d="M705.28 233.386667V0L981.333333 276.053333H747.946667a42.666667 42.666667 0 0 1-42.666667-42.666666z" fill="#A5D1FD" p-id="11325"></path><path d="M167.04 489.386667m26.666667 0l160 0q26.666667 0 26.666666 26.666666l0 0q0 26.666667-26.666666 26.666667l-160 0q-26.666667 0-26.666667-26.666667l0 0q0-26.666667 26.666667-26.666666Z" fill="#FFFFFF" p-id="11326"></path><path d="M300.373333 542.72v229.333333a26.666667 26.666667 0 0 1-26.666666 26.666667 26.666667 26.666667 0 0 1-26.666667-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11327"></path><path d="M653.866667 489.386667m26.666666 0l160 0q26.666667 0 26.666667 26.666666l0 0q0 26.666667-26.666667 26.666667l-160 0q-26.666667 0-26.666666-26.666667l0 0q0-26.666667 26.666666-26.666666Z" fill="#FFFFFF" p-id="11328"></path><path d="M787.2 542.72v229.333333a26.666667 26.666667 0 0 1-26.666667 26.666667 26.666667 26.666667 0 0 1-26.666666-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11329"></path><path d="M430.43932 531.537782m18.856181 18.856181l173.476863 173.476863q18.856181 18.856181 0 37.712362l0 0q-18.856181 18.856181-37.712361 0l-173.476864-173.476864q-18.856181-18.856181 0-37.712361l0 0q18.856181-18.856181 37.712362 0Z" fill="#FFFFFF" p-id="11330"></path><path d="M392.650461 742.693177m18.856181-18.856181l173.476864-173.476863q18.856181-18.856181 37.712361 0l0 0q18.856181 18.856181 0 37.712361l-173.476863 173.476864q-18.856181 18.856181-37.712362 0l0 0q-18.856181-18.856181 0-37.712362Z" fill="#FFFFFF" p-id="11331"></path></svg>',
	'svg': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M661.15 72L860 261.81V952H164V72h497.15M666 0H152a60 60 0 0 0-60 60v904a60 60 0 0 0 60 60h720a60 60 0 0 0 60-60V256.67a60 60 0 0 0-18.57-43.4L707.39 16.6A60 60 0 0 0 666 0z" fill="#959CA7" p-id="3184"></path><path d="M530 284H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72zM896 295H684a36 36 0 0 1-36-36V47a36 36 0 0 1 72 0v176h176a36 36 0 1 1 0 72zM530 416H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72z" fill="#959CA7" p-id="3185"></path><path d="M92 555m20 0l582 0q20 0 20 20l0 276q0 20-20 20l-582 0q-20 0-20-20l0-276q0-20 20-20Z" fill="#3C87F7" p-id="3186"></path><path d="M152.27 753.42h38.55q0.83 11.53 10.74 19.35t26.93 7.83q16.33 0 25.25-6.82a21.78 21.78 0 0 0 8.93-18.22q0-9.57-6.93-15t-21.91-8.79l-28.43-6.52a87.11 87.11 0 0 1-19-6.18 61 61 0 0 1-15.32-10.21 42.44 42.44 0 0 1-10.68-15.55 54.84 54.84 0 0 1-3.81-21q0-18 9.65-31.29A58.26 58.26 0 0 1 192 621.19q16.1-6.58 36.37-6.58 31.53 0 51.09 15.74t19.84 41H262a26.18 26.18 0 0 0-9.55-18.43q-8.72-7.5-24.21-7.5-14.53 0-23 6.41t-8.44 17.4q0 16.57 25.68 21.86l28.69 6.44a98.26 98.26 0 0 1 19.77 6.23 67.87 67.87 0 0 1 16 10.08 40.34 40.34 0 0 1 11.34 15.82 58.1 58.1 0 0 1 3.94 22.2q0 27.65-20.26 43.6t-55.38 16a111.57 111.57 0 0 1-29-3.47q-12.88-3.46-21.14-9.15a55.91 55.91 0 0 1-13.8-13.38 52.27 52.27 0 0 1-7.9-15.6 60.32 60.32 0 0 1-2.47-16.44zM313.71 618.5h46.46l40.49 144.77h1.66l39.94-144.77h44.93l-62.27 189.28H376zM495.65 724.3v-23.57q0-39.38 21.78-62.61t60-23.23a92.77 92.77 0 0 1 32.74 5.48q14.63 5.48 23.75 14.63A67.21 67.21 0 0 1 648 655.59a64.73 64.73 0 0 1 5.43 24.06h-39.36q-1.81-14.76-11.88-23.12t-25.35-8.36q-18.76 0-29.87 13.27T535.86 701v23.21q0 24.88 10.07 39.4t31.32 14.52q17.23 0 27.64-9.37a29.89 29.89 0 0 0 10.42-23.15V735h-36.74v-29.83h75.16v37.44a74 74 0 0 1-2.44 18.86 64.82 64.82 0 0 1-8.29 18.44A66.36 66.36 0 0 1 628.52 796q-8.64 6.94-22 11.16a98.57 98.57 0 0 1-29.81 4.23q-20.61 0-36.31-6.52A63.45 63.45 0 0 1 515 786.5a80.64 80.64 0 0 1-14.51-27.5 117 117 0 0 1-4.84-34.7z" fill="#FFFFFF" p-id="3187"></path></svg>',
	'stl': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M156.01854658 328.14285752l-1.28571416 0.64285664v364.5l357.42857168 187.71428584V505.89285752L156.01854658 328.14285752z" fill="#ffffff" p-id="3982"></path><path d="M868.62568994 328.46428584l-356.78571416-187.71428584-342.3214292 180-13.82142832 7.39285752 356.14285752 177.75 4.1785708-1.92857168 353.5714292-174.85714336z m-353.57142832 175.5l-4.17857168 3.21428584z" fill="#f9f28b" p-id="3983"></path><path d="M939.98283242 294.07142832a61.71428584 61.71428584 0 0 0-25.39285664-26.6785708L539.16140411 68.75a58.82142832 58.82142832 0 0 0-54.64285753 0L109.4114041 266.10714248a53.03571416 53.03571416 0 0 0-15.42857168 13.8214292 59.46428584 59.46428584 0 0 0-9.64285664 12.53571416A55.28571416 55.28571416 0 0 0 77.26854658 319.14285752v385.71428496a59.14285752 59.14285752 0 0 0 32.14285753 52.0714292l374.78571415 197.35714248a64.28571416 64.28571416 0 0 0 26.67857168 7.71428584h4.5a61.71428584 61.71428584 0 0 0 22.82142832-6.10714248l374.78571416-198.32142919a59.78571416 59.78571416 0 0 0 32.14285752-52.71428585V319.14285752a57.21428584 57.21428584 0 0 0-5.14285752-25.0714292z m-70.39285664 35.03571416l-353.5714292 174.85714336-4.1785708 2.25v375.10714248L154.08997578 693.28571416V328.78571416l13.82142832-7.39285664 343.92857168-180.64285752 356.78571416 187.71428584z" fill="#e98f36" p-id="3984"></path></svg>',
	'mainpole': '<svg class="icon-dark small" style="margin: 0px;" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2574" width="200" height="200"><path d="M841.67168 399.587556c-52.906667-195.128889-241.208889-321.080889-440.888889-294.855112a126.520889 126.520889 0 0 1-70.712889 136.362667 125.44 125.44 0 0 1-149.504-33.109333 404.138667 404.138667 0 0 0-130.275555 297.699555c0 111.274667 44.828444 212.081778 117.191111 285.240889a125.383111 125.383111 0 0 1 143.416889-17.578666c46.705778 25.031111 72.817778 76.8 65.308444 129.422222 197.233778 38.456889 392.476444-74.865778 457.728-265.671111a126.407111 126.407111 0 0 1-79.075555-121.457778 126.293333 126.293333 0 0 1 86.812444-116.053333z m50.517333-5.688889a126.179556 126.179556 0 0 1 114.346667 129.991111 126.122667 126.122667 0 0 1-122.538667 122.197333c-71.623111 221.525333-298.097778 352.995556-524.970666 304.753778a125.724444 125.724444 0 0 1-222.151111 11.548444 126.862222 126.862222 0 0 1 0.455111-130.389333A454.542222 454.542222 0 0 1 0.000569 505.685333 454.769778 454.769778 0 0 1 156.046791 162.133333 126.577778 126.577778 0 0 1 223.517013 11.889778a125.496889 125.496889 0 0 1 157.980445 44.544c231.537778-37.148444 453.063111 109.226667 510.748444 337.464889h-0.056889z m-439.182222 314.026666a201.159111 201.159111 0 0 1-174.364444-101.091555 202.922667 202.922667 0 0 1 0-202.24 201.159111 201.159111 0 0 1 174.364444-101.091556 201.784889 201.784889 0 0 1 201.329778 202.183111 201.784889 201.784889 0 0 1-201.386667 202.24z"></path></svg>',
	'component': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z"/></svg>',
	'rotate': '<svg class="icon-dark small" style="margin: 0px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M634.88 512a87.04 87.04 0 1 1-174.08 0 87.04 87.04 0 0 1 174.08 0z m-87.04 394.24a393.728 393.728 0 0 1-325.44-171.776l62.368-32.576A324.64 324.64 0 0 0 550.4 839.68c179.552 0 325.12-145.568 325.12-325.12S729.952 189.44 550.4 189.44c-159.424 0-291.968 114.784-319.68 266.208h76.448L191.936 645.12l-115.232-189.472h80.96C185.024 264.608 349.248 117.76 547.84 117.76c217.728 0 394.24 176.512 394.24 394.24s-176.512 394.24-394.24 394.24z"></path></svg>'
}

export function degree_to_radius(angle) {
	return angle / 180 * Math.PI
}

export function radius_to_degree(angle) {
	return angle / Math.PI * 180
}

export function to_PoleAngle(angle, round = true) {
	angle %= 360
	if (angle < 0) return round ? Math.round(-angle) : (-angle)
	else if (angle === 0) return 0
	else return round ? Math.round(360 - angle) : (360 - angle)
}

export function get_NearPoleAngle(angle) {
	if (angle < 45) return 0
	else if (angle < 90 + 45) return 90
	else if (angle < 180 + 45) return 180
	else if (angle < 270 + 45) return 270
	return 0
}

export function get_AngleBetween(from, to) {
	let c = to - from
	c += (c > 180) ? -360 : (c < -180) ? 360 : 0
	return c
}

export function to_BinarySTL(ascii) {
	let data = stl.toObject(ascii);
	return stl.fromObject(data, true);
}
