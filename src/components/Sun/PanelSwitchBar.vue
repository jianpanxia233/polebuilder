<template>
	<div ref="Tabs" class="form-container left" style="flex: unset;" @contextmenu="show_ResizePanel">
		<template v-for="tab, index in Tabs">
			<div :class="{'tab': true, 'selected':currentTab===tab.name}" @click="click_Tab(tab.name, tab.panelid)"
				draggable="true" @dragstart="on_DragStart(tab.panelid)" @dblclick="dblclick_Tab(tab.name, tab.panelid)">
				<!-- <svg class="tab-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden">
					<g>
						<path d="M30 19.5 15 28.6 48 48.6 63 39.5Z" />
						<path d="M81 28.6 48 8.6 33.8 17.2 66.8 37.2Z" />
						<path d="M15 36.6 15 68.6 46 87.4 46 52.1 15 33.3Z" />
						<path d="M61 57.6 54 61.6 54 54.6 61 50.6 61 57.6ZM50 52.1 50 87.4 81 68.6 81 33.3 50 52.1Z" />
					</g>
				</svg> -->
				<div v-if="IconMap[tab.name]!==undefined" v-html="IconMap[tab.name]" style="height: 23px; width: 23px;">
				</div>
				<a class="tab-text">{{tab.name}}</a>
			</div>
			<div v-if="index < Tabs.length - 1" class="space6px" />
		</template>

		<div v-if="show" class="Background" :style="{'z-index': Zindex}" @click.self.stop="show = false"
			@contextmenu.prevent.stop>
		</div>

		<div ref="ResizeContainer" id="ResizeContainer" class="listview-dark"
			:style="{'z-index': Zindex, 'visibility': show? 'visible': 'hidden'}">
			<a class="title-dark center"
				style="position: absolute; top: 10px; left: 0px; width: 100%; margin: 0px; text-align: center;">{{currentTab++}}</a>
			<div id="BoxTemplate">
				<input class="lineedit-dark" type="number" min="100" max="999" step="10" id="TextH"
					v-model.number="width">
				<input class="lineedit-dark" type="number" min="100" max="999" step="10" id="TextV"
					v-model.number="height">
			</div>
			<input id="SliderH" class="slider-dark" type="range" min="100" max="999" step="10" v-model.number="width" />
			<input id="SliderV" class="slider-dark" type="range" min="100" max="999" step="10"
				v-model.number="height" />
			<!-- <div id="BoxButton" class="button-dark" @click="show = false">
				<a class="button-text">完成</a>
			</div> -->
			<!-- <div id="BoxButton" class="form-container">
				<div class="title-dark">123</div>
				<input type="checkbox" class="checkbox-dark">
			</div> -->
		</div>
	</div>
</template>
<script>
	export default {
		name: 'PanelSwitchBar',
		props: {
			Tabs: {
				type: Array,
				default: () => {
					return []
				}
			},
			currentTab: {
				type: String,
				default: 'build'
			},
			Width: {
				type: Number,
				default: 100
			},
			Height: {
				type: Number,
				default: 100
			},
			Zindex: {
				type: Number,
				default: 1
			}
		},
		data() {
			return {
				IconMap: {
					'组件列表': '<svg class="tab-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden"> <g> <path d="M30 19.5 15 28.6 48 48.6 63 39.5Z" /> <path d="M15 36.6 15 68.6 46 87.4 46 52.1 15 33.3Z" /> <path d="M81 28.6 48 8.6 33.8 17.2 66.8 37.2Z" /> <path d="M61 57.6 54 61.6 54 54.6 61 50.6 61 57.6ZM50 52.1 50 87.4 81 68.6 81 33.3 50 52.1Z" /> </g> </svg>',
					'自定义组件库': '<svg class="tab-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden"> <g> <path d="M30 19.5 15 28.6 48 48.6 63 39.5Z" /> <path d="M15 36.6 15 68.6 46 87.4 46 52.1 15 33.3Z" /> <path d="M81 28.6 48 8.6 33.8 17.2 66.8 37.2Z" /> <path d="M61 57.6 54 61.6 54 54.6 61 50.6 61 57.6ZM50 52.1 50 87.4 81 68.6 81 33.3 50 52.1Z" /> </g> </svg>',
					'大纲': '<svg class="tab-icon-svg" viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5163" xmlns:xlink="http://www.w3.org/1999/xlink"> <path d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z"></path></svg>',
					'检视器': '<svg class="tab-icon-svg" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"> <g transform="translate(-591 -311)"> <path d="M622.38 382.62 599.76 360 621.88 337.88 626.12 342.12 608.24 360 626.62 378.38 622.38 382.62Z" /> <path d="M657.12 382.62 652.88 378.38 671.26 360 653.38 342.12 657.62 337.88 679.74 360 657.12 382.62Z" /> <path d="M645 360C645 362.761 642.761 365 640 365 637.239 365 635 362.761 635 360 635 357.239 637.239 355 640 355 642.761 355 645 357.239 645 360Z" /> <path d="M629 360C629 362.761 626.761 365 624 365 621.239 365 619 362.761 619 360 619 357.239 621.239 355 624 355 626.761 355 629 357.239 629 360Z" /> <path d="M661 360C661 362.761 658.761 365 656 365 653.239 365 651 362.761 651 360 651 357.239 653.239 355 656 355 658.761 355 661 357.239 661 360Z" /> </g> </svg>',
					'控制台': '<svg class="tab-icon-svg" viewBox="40 0 964 964" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5560" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M306.89 142.8H717.1c90.62 0.22 163.9 73.87 163.68 164.49-0.22 90.31-73.38 163.46-163.68 163.68H306.89c-90.62-0.22-163.9-73.87-163.68-164.49 0.22-90.3 73.38-163.45 163.68-163.68z m0 246.13c45.31 0 82.04-36.73 82.04-82.04s-36.73-82.04-82.04-82.04-82.04 36.73-82.04 82.04 36.73 82.04 82.04 82.04z" p-id="5561"></path><path d="M306.89 553.02H717.1c90.62 0.22 163.9 73.87 163.68 164.49-0.22 90.31-73.38 163.46-163.68 163.68H306.89c-90.62-0.22-163.9-73.87-163.68-164.49 0.22-90.3 73.38-163.45 163.68-163.68zM717.1 799.15c45.31 0 82.04-36.73 82.04-82.04 0-45.31-36.73-82.04-82.04-82.04s-82.04 36.73-82.04 82.04c0 45.31 36.73 82.04 82.04 82.04z" opacity=".3" p-id="5562"></path></svg>',
					'画布': '<svg class="tab-icon-svg" viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8892" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M478.1 327.9c-10-9.6-21.8-17.2-35.3-22.9-13.6-5.7-28-8.6-43.2-8.6-15.7 0-30.3 2.8-43.9 8.6-13.6 5.7-25.3 13.3-35.3 22.9-10 9.6-18 20.9-23.9 33.9-6 13-8.9 26.8-8.9 41.4 0 14.6 3 28.4 8.9 41.4 6 13 13.9 24.4 23.9 34.2 10 9.8 21.8 17.6 35.3 23.3 13.6 5.7 28.2 8.6 43.9 8.6 15.2 0 29.6-2.9 43.2-8.6 13.6-5.7 25.3-13.5 35.3-23.3 10-9.8 18-21.2 23.9-34.2 5.9-13 8.9-26.8 8.9-41.4 0-14.6-3-28.4-8.9-41.4-5.9-13.1-13.9-24.4-23.9-33.9z m391.3-203.3H152.5c-48.9 0-88.5 38-88.5 84.9V811c0 46.9 39.6 84.9 88.5 84.9h716.8c48.9 0 88.5-38 88.5-84.9V209.5c0.1-46.9-39.5-84.9-88.4-84.9z m-0.7 570.1c-9.5-21-20.6-42.4-33.2-64.3-12.6-21.9-26.4-41.7-41.4-59.5-15-17.8-31.3-32.3-48.9-43.5-17.6-11.2-35.9-16.8-55-16.8-22.4 0-41.4 4.2-57.1 12.6-15.7 8.5-29.3 19-40.7 31.8-11.4 12.8-21.7 26.5-30.7 41.1-9 14.6-18.1 28.3-27.1 41.1S515.7 660.6 505 669c-10.7 8.4-23.4 12.6-38.2 12.6-14.8 0-27.4-1-37.8-3.1-10.5-2.1-19.9-4.7-28.2-7.9s-16.1-6.7-23.2-10.6c-7.1-3.9-14.9-7.4-23.2-10.6-8.3-3.2-17.8-5.8-28.6-7.9-10.7-2.1-23.4-3.1-38.2-3.1-12.4 0-24.6 3.1-36.8 9.2-12.1 6.2-23.9 14-35.3 23.6-11.4 9.6-22.4 20.3-32.8 32.2-10.5 11.9-20 23.7-28.6 35.6V248c0-21 17.8-38 39.7-38H829c21.9 0 39.7 17 39.7 38v446.7z" p-id="8893"></path></svg>',
					'PoleViewer': '<svg class="tab-icon-svg" viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8892" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M478.1 327.9c-10-9.6-21.8-17.2-35.3-22.9-13.6-5.7-28-8.6-43.2-8.6-15.7 0-30.3 2.8-43.9 8.6-13.6 5.7-25.3 13.3-35.3 22.9-10 9.6-18 20.9-23.9 33.9-6 13-8.9 26.8-8.9 41.4 0 14.6 3 28.4 8.9 41.4 6 13 13.9 24.4 23.9 34.2 10 9.8 21.8 17.6 35.3 23.3 13.6 5.7 28.2 8.6 43.9 8.6 15.2 0 29.6-2.9 43.2-8.6 13.6-5.7 25.3-13.5 35.3-23.3 10-9.8 18-21.2 23.9-34.2 5.9-13 8.9-26.8 8.9-41.4 0-14.6-3-28.4-8.9-41.4-5.9-13.1-13.9-24.4-23.9-33.9z m391.3-203.3H152.5c-48.9 0-88.5 38-88.5 84.9V811c0 46.9 39.6 84.9 88.5 84.9h716.8c48.9 0 88.5-38 88.5-84.9V209.5c0.1-46.9-39.5-84.9-88.4-84.9z m-0.7 570.1c-9.5-21-20.6-42.4-33.2-64.3-12.6-21.9-26.4-41.7-41.4-59.5-15-17.8-31.3-32.3-48.9-43.5-17.6-11.2-35.9-16.8-55-16.8-22.4 0-41.4 4.2-57.1 12.6-15.7 8.5-29.3 19-40.7 31.8-11.4 12.8-21.7 26.5-30.7 41.1-9 14.6-18.1 28.3-27.1 41.1S515.7 660.6 505 669c-10.7 8.4-23.4 12.6-38.2 12.6-14.8 0-27.4-1-37.8-3.1-10.5-2.1-19.9-4.7-28.2-7.9s-16.1-6.7-23.2-10.6c-7.1-3.9-14.9-7.4-23.2-10.6-8.3-3.2-17.8-5.8-28.6-7.9-10.7-2.1-23.4-3.1-38.2-3.1-12.4 0-24.6 3.1-36.8 9.2-12.1 6.2-23.9 14-35.3 23.6-11.4 9.6-22.4 20.3-32.8 32.2-10.5 11.9-20 23.7-28.6 35.6V248c0-21 17.8-38 39.7-38H829c21.9 0 39.7 17 39.7 38v446.7z" p-id="8893"></path></svg>',
					'资源管理器': '<svg class="tab-icon-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M928.426667 354.986667L213.333333 687.786667 102.4 450.56 781.653333 134.826667c20.48-10.24 44.373333 0 52.906667 18.773333l93.866667 201.386667z" opacity=".3"></path><path d="M459.093333 262.826667l-6.826666-51.2c-1.706667-15.36-13.653333-25.6-29.013334-25.6H114.346667c-15.36 0-29.013333 13.653333-29.013334 29.013333v658.773333c0 15.36 13.653333 29.013333 29.013334 29.013334h795.306666c15.36 0 29.013333-13.653333 29.013334-29.013334V317.44c0-15.36-13.653333-29.013333-29.013334-29.013333H488.106667c-15.36 0-27.306667-10.24-29.013334-25.6z"></path></svg>',
					'PoleViewer': '<svg class="tab-icon-svg" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2377" width="200" height="200"><path d="M136.63247 0h195.798637c18.470765 4.820315 34.126124 14.716891 47.904547 27.599503 8.787477 8.104954 17.489639 16.337882 26.02117 24.74144a43105.560617 43105.560617 0 0 1 140.343686 140.514316c5.289549 5.289549 10.536441 7.209144 17.830899 5.758784 12.072116-2.346171 24.314863-3.284639 36.685584-3.28464 43.553466 0.127973 87.192247 1.365045 130.703056-0.341261 35.619142-1.407703 64.029141 11.048333 88.557292 35.6618 56.308105 56.564051 112.957471 112.829498 169.222918 169.478864 15.612702 15.698017 28.665944 33.272971 34.083467 55.369637v431.52484c-0.511892 2.260856-1.109099 4.521711-1.535676 6.825225-15.271441 77.039725-78.788689 129.551299-157.36409 129.679272-91.884589 0.170631-183.769179 0.55455-275.653768-0.170631-56.905312-0.426577-100.757382-26.277116-132.025443-73.456482-21.115539-31.865268-25.978512-67.825672-25.168017-105.065805 0.426577-17.27635 0.042658-17.319008-16.807116-17.319008-84.888734 0-169.820125 0.341261-254.708859-0.127973-91.287382-0.469234-160.392784-70.04387-160.392784-161.203279-0.170631-169.777468-0.170631-339.554936 0-509.332404 0-48.075177 19.11063-87.746797 54.985718-119.441434 23.333737-20.646305 51.189186-31.822611 81.476121-37.410764zM81.348149 405.930247v129.807245c-0.085315 43.29752-0.511892 86.59504-0.341262 129.849903 0.170631 47.691259 32.505133 80.622968 80.23905 80.836256 89.581076 0.426577 179.162152 0.298604 268.743228 0a93.377607 93.377607 0 0 0 71.067653-31.054773 38.263917 38.263917 0 0 0 10.579099-27.130268c-0.127973-134.499587 0-268.999174-0.127973-403.498761-0.042658-36.685584-10.323153-46.710132-46.966078-47.136709-23.333737-0.298604-46.667475 0.426577-69.915897-0.938469-26.703692-1.578333-40.610088-17.574954-40.780719-44.449277-0.127973-21.627431 0.085315-43.29752-0.042657-64.924951-0.213288-31.140088-15.356756-46.411529-46.667475-47.179366a201.770709 201.770709 0 0 0-5.033604-0.042658c-46.283556 0-92.567112 0-138.850667 0.085315-7.976982 0-15.911305 0.213288-23.760314 2.132883-33.144998 7.976982-54.345853 34.254097-54.303195 67.996302 0 85.229995-3.071351 170.417333-3.839189 255.647328z m862.281842 272.795705v-114.834407c-0.042658-32.291845 0.085315-64.58369-0.426576-96.875535-0.255946-17.27635-8.787477-26.874323-25.423963-31.268062a69.531978 69.531978 0 0 0-17.830899-1.706306c-23.632341-0.042658-47.264682 0.213288-70.939681-0.127973-21.670089-0.341261-38.306574-13.863738-41.29261-33.400944a170.204044 170.204044 0 0 1-1.450361-22.907161c-0.341261-21.328828-0.255946-42.614998-0.72518-63.901167a34.765989 34.765989 0 0 0-13.949053-27.556846c-9.597972-7.507747-20.902251-9.811261-32.846395-9.81126h-131.89747c-14.077026 0-14.418287 0.298604-14.418287 14.674233l0.042658 327.610792c0 3.839189-1.876937 9.043423 1.834279 11.133648 4.095135 2.303513 6.953198-2.687432 9.896576-4.948288 43.980043-33.486259 87.832112-67.143149 131.726839-100.672066 2.559459-1.919594 5.033603-5.673468 8.531531-3.881847 3.412612 1.748964 2.00491 5.972072 2.00491 9.171396 0.085315 28.964548 0.383919 57.929096-0.085315 86.850986-0.170631 9.768603 3.369955 12.669324 12.797296 12.541351 30.969458-0.426577 61.938915 0.127973 92.908373-0.341261 9.725945-0.127973 12.797297 3.412612 12.541351 12.797296-0.511892 16.977747-0.127973 33.955494-0.127973 50.933241 0 17.319008-0.042658 17.319008-16.935089 17.361665h-85.86986c-15.058152 0-15.143468 0.085315-15.143468 15.015495-0.042658 28.282025 0 56.564051-0.085315 84.888734 0 2.815405 0.938468 6.526621-2.602117 7.849008-2.815405 1.023784-4.90563-1.578333-6.995855-3.114008-7.422432-5.588153-14.844864-11.261621-22.224639-16.93509L597.207173 707.434554c-4.137793-3.156666-8.232927-7.166486-10.664413 1.791622-10.451126 38.946439-32.974367 69.31869-66.204681 91.927247a12.37072 12.37072 0 0 0-6.057387 10.664414c-0.341261 16.636486-1.578333 33.315629-1.151757 49.909456 1.194414 47.947204 32.334503 80.537653 78.319455 80.793599 91.585986 0.511892 183.129314 0.127973 274.7153 0.170631 24.186891 0 44.534592-9.384684 62.365492-25.168017a42.231079 42.231079 0 0 0 15.314098-34.083466c-0.55455-68.252248-0.255946-136.504497-0.255946-204.714088zM226.213546 487.918261c-15.143468 0-30.329593-0.255946-45.515718 0.085315-7.379774 0.213288-10.109864-2.900721-10.024549-10.579099 0.298604-19.665179 0.426577-39.373016 0-59.038194-0.213288-8.958108 3.412612-11.602882 11.304278-11.560225 28.452656 0.213288 56.905312 0.085315 85.315311 0.042658 15.527387 0 15.527387 0 15.527386-16.849774 0-27.044953-0.042658-54.047249 0.085316-81.049545 0-3.45527-1.578333-8.104954 2.303513-9.981891 3.241982-1.578333 5.673468 2.132883 8.104954 4.052477 56.990627 45.984952 113.895939 92.097878 170.971883 137.997514 6.014729 4.862973 7.038513 7.976982 0.341261 13.351847-57.630492 46.240898-115.047696 92.7804-172.592873 139.149271-2.132883 1.706306-4.351081 4.948288-7.337117 3.114009-2.858063-1.706306-1.791622-5.417522-1.791621-8.275585-0.085315-29.348467-0.383919-58.739591 0.085315-88.088058 0.170631-9.768603-3.199324-12.882612-12.20009-12.498693-14.844864 0.597207-29.689728 0.170631-44.577249 0.17063v-0.042657z"></path></svg>'
				},
				width: 100,
				height: 100,
				show: false,
				TabsDOM: null
			}
		},
		watch: {
			Width(newval) {
				this.width = parseFloat(newval)
			},
			Height(newval) {
				this.height = parseFloat(newval)
			},
			width(newval) {
				this.on_Resize(this.currentTab, this.get_CurrentTabId(this.currentTab), this.width, null)
			},
			height(newval) {
				this.on_Resize(this.currentTab, this.get_CurrentTabId(this.currentTab), null, this.height)
			},
			// Tabs() {
			// 	this.show = false
			// },
			// currentTab() {
			// 	this.show = false
			// },
			show(newval) {
				if (!newval) {
					this.$EventBus.$emit("app_save_Layout")
				}
			}
		},
		methods: {
			// change_Page(page) {
			// 	this.page = page
			// 	this.$EventBus.$emit('app_change_Page', page)
			// },
			click_Tab(name, id) {
				this.$EventBus.$emit('panel_switch_Tab', name, id)
			},

			on_DragStart(panelid) {
				if (!event.ctrlKey) {
					event.preventDefault()
					return
				}
				event.dataTransfer.setData("PanelDragData", panelid);
				// //console.log(event, panelid)
			},

			show_ResizePanel() {
				function getElementToPageTop(el) {
					if (el.offsetParent) {
						return getElementToPageTop(el.offsetParent) + el.offsetTop
					}
					return el.offsetTop
				}
				function getElementToPageLeft(el) {
					if (el.offsetParent) {
						return getElementToPageLeft(el.offsetParent) + el.offsetLeft
					}
					return el.offsetLeft
				}
				let x = getElementToPageLeft(this.$refs.Tabs)
				let tab_width = this.$refs.Tabs.offsetWidth
				let tab_height = this.$refs.Tabs.offsetHeight
				let y = getElementToPageTop(this.$refs.Tabs)
				let width = window.innerWidth
				let height = window.innerHeight
				// //console.log(this.$refs.ResizeContainer)
				let button_width = this.$refs.ResizeContainer.offsetWidth
				let button_height = this.$refs.ResizeContainer.offsetHeight
				let margin = 8
				// //console.log((x + button_width / 2 + margin), width)
				this.$refs.ResizeContainer.style.left = ((x + button_width / 2 + tab_width / 2 + margin) > width ? width - (button_width + margin) : ((x - button_width / 2 - tab_width / 2) < 0 ? margin : x - button_width / 2 + tab_width / 2)) + 'px'
				this.$refs.ResizeContainer.style.top = ((y + tab_height + 6 + button_height + margin) > height ? y - 6 - button_height : y + tab_height + 6) + 'px'
				this.show = true
			},

			dblclick_Tab(name, id) {
				this.$EventBus.$emit('panel_Fold', name, id)
			},

			on_Resize(name, id, width, height) {
				this.$EventBus.$emit('panel_set_Size', name, id, width, height)
			},

			get_CurrentTabId(name) {
				for (let i = 0; i < this.Tabs.length; i++) {
					if (this.Tabs[i].name === name) {
						return this.Tabs[i].panelid
					}
				}
			},
		},
		mounted() {
			this.width = this.Width
			this.height = this.Height
			// document.addEventListener('click', this.click_Handler)
		},
		destroyed() {
			// document.removeEventListener('click', this.click_Handler)
		}
	}
</script>
<style scoped>
	.Background {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: transparent;
		pointer-events: all;
	}

	#ResizeContainer {
		position: fixed;
		left: 0px;
		top: 0px;
		background-color: var(--PanelColor);
		/* padding: 6px; */
		z-index: 1;
		width: 170px;
		margin: 0px;
		/* height: 230px; */
		height: 190px;
		padding: 0px;
		box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.15);
	}

	#SliderH {
		position: absolute;
		margin: 0px;
		top: 165px;
		left: 15px;
		width: 120px;
	}

	#SliderV {
		position: absolute;
		margin: 0px;
		top: 91px;
		left: 90px;
		transform: rotate(270deg);
		width: 120px;
	}

	#BoxTemplate {
		position: absolute;
		width: 105px;
		height: 105px;
		border-radius: var(--ContainerRadius);
		/* background-color: brown; */
		top: 40px;
		left: 18px;
		border: var(--BarColor) dashed 2px;
	}

	#TextH {
		position: absolute;
		margin: 0px;
		/* width: 100%; */
		width: 60px;
		left: 10px;
		bottom: 10px;
	}

	#TextV {
		position: absolute;
		margin: 0px;
		width: 60px;
		/* height: 100%; */
		/* display: flex;
		align-items: center; */
		right: 10px;
		top: 10px;
	}

	#BoxButton {
		position: absolute;
		box-sizing: border-box;
		padding: 10px;
		margin: 0px;
		width: 150px;
		height: 30px;
		left: 10px;
		bottom: 10px;
	}
</style>