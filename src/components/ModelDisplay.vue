<template>
	<div class="container canvas-container" @contextmenu="mouseRightClick($event)" @mousedown.stop.left="mouseClick()"
		@dblclick="mouseDoubleClick($event)" @mousemove="mouseMove()" @mouseout="mouseOut()"
		@mousedown.stop.right="onContextMenu($event)" @mouseout.stop @dragover.prevent @drop="drop_File">
		<div id="Canvas-Show"
			style="border-radius: var(--ContainerRadius); overflow: hidden; position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;">
			<canvas v-show="needRender" id="Canvas-Show-Canvas"></canvas>
		</div>
		<div class="v-box"
			style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px; pointer-events: none;">

			<div class="topbar" style="justify-content: center; pointer-events: all;" @click.stop @dblclick.stop
				@mousemove.stop @mousedown.stop @contextmenu.stop.prevent>

				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'画布'" :Width="PanelWidth" :Height="PanelHeight"
					:Zindex="2" />

				<!-- files don't change -->
				<div class="bargroup" style="gap: 6px; flex-wrap: nowrap; overflow: auto;">
					<template v-for="item, idx in scenes">
						<div :class="{'tab': true, 'selected': idx === currentsceneidx}" style="padding: 0px 6px;"
							@click="switch_Scene(idx)">
							<div style="display: flex; pointer-events: none;" v-html="iconMap[item.filetype]"></div>
							<a class="tab-text">{{item.name}}</a>
							<svg v-show="idx === currentsceneidx" class="icon-button" viewBox="0 0 115 116"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								overflow="hidden" @click.stop="close_Scene(idx)" style="margin-right: 1px;">
								<g transform="translate(-561 -534)">
									<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
									<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
										fill-rule="evenodd" />
								</g>
							</svg>
						</div>
					</template>
					<!-- <div class="tab" style="margin: 0px 6px;" @click="new_Scene()">
						<svg class="tab-icon-svg" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-561 -534)">
								<path d="M619.188 549.025 619.188 635.145" stroke-width="9" stroke-miterlimit="8"
									fill-rule="evenodd" />
								<path d="M662.423 591.911 576.303 591.91" stroke-width="9" stroke-miterlimit="8"
									fill-rule="evenodd" />
							</g>
						</svg>
					</div> -->
				</div>

				<div class="filler" style="min-width: 0px;"></div>

				<!-- put topbar custom items here -->

				<template v-if="editortype==='pole'">
					<div v-if="reactive.selectedMode===1" class="button" @click="emit('checkLoad', [])">
						<a class="button-text">荷载检查</a>
					</div>
					<button-panel class="button" :TopAdditional="6" :Zindex="2" :Width="300">
						<template slot="button">
							<a class="button-text">三视图</a>
						</template>
						<template slot="panel">
							<div class="form-vcontainer gap">
								<div class="title-dark left noleftmargin">视图切换</div>
								<div class="listview-dark flex">
									<div class="form-container gap">
										<div class="form-container smallgap center">
											<div class="button-dark left" @click="emit('set_CADView', ['MainView'])">主视图
											</div>
											<div class="button-dark hcenter" @click="emit('set_CADView', ['LeftView'])">
												左视图</div>
											<div class="button-dark right" @click="emit('set_CADView', ['TopView'])">俯视图
											</div>
										</div>
										<div class="button-dark" @click="emit('clear_CADView', [])">清除标注线</div>
									</div>
								</div>
								<div class="listview-dark flex">
									<div class="form-container smallgap center">
										<div class="button-dark left" @click="emit('export_PDF', [])">导出PDF</div>
										<div class="button-dark right" @click="emit('export_DXF', [])">导出DXF</div>
									</div>
								</div>
								<div class="title-dark left noleftmargin">标识</div>
								<div class="form-vcontainer gap">
									<div class="form-container gap">
										<div class="listview-dark flex">
											<div class="form-container gap">
												<div class="form-container">
													<div class="title-dark"
														style="text-align: left; word-break: break-all;">
														地面网格</div>
												</div>
												<div class="form-container leftpadding right">
													<input class="checkbox1-dark" v-model="reactive.showGround"
														type="checkbox"
														@change="emit('switch_Ground', [reactive.showGround])" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</template>
					</button-panel>
					<button-panel ref="pole_实验性" class="button" :TopAdditional="6" :Zindex="2" :Width="300">
						<template slot="button">
							<a class="button-text">实验性</a>
						</template>
						<template slot="panel">
							<div class="form-vcontainer gap">
								<div class="title-dark left noleftmargin">STL 导出</div>
								<div class="listview-dark flex">
									<div class="form-container gap">
										<div class="form-container smallgap center">
											<div class="button-dark left" @click="emit('export_STL', [false])">ASCII
											</div>
											<div class="button-dark right" @click="emit('export_STL', [true])">BINARY
											</div>
										</div>
									</div>
								</div>
								<template v-if="reactive.selectedMode===1">
									<div class="title-dark left noleftmargin">爆炸图</div>
									<div class="listview-dark flex">
										<div class="form-container gap">
											<input type="range" min="0" max="30" step="0.01" class="slider-dark"
												style="flex: 1; margin: 8px 4px;"
												v-model.number="reactive.additionaldistance"
												@input="emit('update_Additional')">
										</div>
									</div>
								</template>
								<div class="title-dark left noleftmargin">async Popup Test</div>
								<div class="listview-dark flex">
									<div class="form-container gap">
										<div class="form-container smallgap center">
											<div class="button-dark left" @click="emit('diff')">比较
											</div>
											<div class="button-dark right" @click="emit('reset_diff')">Reset
											</div>
										</div>
									</div>
								</div>
							</div>
						</template>
					</button-panel>

				</template>


				<div class="button" @click="showstats = !showstats;">
					<svg class="button-icon-svg" viewBox="0 0 87 88" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
						<g transform="translate(-368 -387)">
							<path
								d="M411.001 393C390.014 392.999 373.001 410.012 373 430.999 372.999 451.986 390.012 468.999 410.999 469 431.986 469.001 448.999 451.988 449 431.001 449 431 449 430.998 449 430.997 449.008 410.02 432.01 393.008 411.033 393 411.022 393 411.012 393 411.001 393ZM414.933 451.507C414.51 452.496 413.721 453.285 412.732 453.708 412.223 453.924 411.675 454.035 411.122 454.032 410.018 454.034 408.958 453.598 408.175 452.818 407.798 452.44 407.496 451.994 407.286 451.503 407.068 450.993 406.958 450.445 406.961 449.891 406.958 448.786 407.395 447.726 408.175 446.943 409.793 445.321 412.42 445.318 414.042 446.936 414.044 446.938 414.047 446.941 414.05 446.943L414.05 446.943C414.429 447.324 414.731 447.775 414.939 448.271 415.156 448.784 415.266 449.335 415.264 449.891 415.266 450.446 415.153 450.995 414.933 451.505ZM418.466 433.938C415.733 435.586 414.045 438.528 414.003 441.72L407.999 441.72C408.035 436.463 410.785 431.598 415.269 428.856 419.029 426.499 420.166 421.541 417.809 417.781 415.453 414.022 410.494 412.885 406.735 415.241 404.39 416.711 402.966 419.285 402.968 422.052L396.965 422.052C396.962 414.3 403.244 408.013 410.997 408.01 418.749 408.007 425.037 414.289 425.039 422.042 425.041 426.873 422.558 431.366 418.466 433.936Z" />
						</g>
					</svg>
				</div>

				<div id="Stats-output-show"
					style="margin: 0px 0px 6px 0px;display: flex; flex-direction: column; justify-content: center;"
					v-show="showstats">
				</div>

				<div class="button" @click="$EventBus.$emit('app_openhide_Canvas2', true)" title="切换PoleViewer">
					<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
						xmlns="http://www.w3.org/2000/svg" style="margin: 0px;">
						<path
							d="M332.16 883.84a40.96 40.96 0 0 0 58.24 0l338.56-343.04a40.96 40.96 0 0 0 0-58.24L390.4 140.16a40.96 40.96 0 0 0-58.24 58.24L640 512l-307.84 314.24a40.96 40.96 0 0 0 0 57.6z">
						</path>
					</svg>
					<svg class="button-icon-svg" viewBox="-50 -50 1124 1124" version="1.1"
						xmlns="http://www.w3.org/2000/svg" p-id="2377">
						<path
							d="M136.63247 0h195.798637c18.470765 4.820315 34.126124 14.716891 47.904547 27.599503 8.787477 8.104954 17.489639 16.337882 26.02117 24.74144a43105.560617 43105.560617 0 0 1 140.343686 140.514316c5.289549 5.289549 10.536441 7.209144 17.830899 5.758784 12.072116-2.346171 24.314863-3.284639 36.685584-3.28464 43.553466 0.127973 87.192247 1.365045 130.703056-0.341261 35.619142-1.407703 64.029141 11.048333 88.557292 35.6618 56.308105 56.564051 112.957471 112.829498 169.222918 169.478864 15.612702 15.698017 28.665944 33.272971 34.083467 55.369637v431.52484c-0.511892 2.260856-1.109099 4.521711-1.535676 6.825225-15.271441 77.039725-78.788689 129.551299-157.36409 129.679272-91.884589 0.170631-183.769179 0.55455-275.653768-0.170631-56.905312-0.426577-100.757382-26.277116-132.025443-73.456482-21.115539-31.865268-25.978512-67.825672-25.168017-105.065805 0.426577-17.27635 0.042658-17.319008-16.807116-17.319008-84.888734 0-169.820125 0.341261-254.708859-0.127973-91.287382-0.469234-160.392784-70.04387-160.392784-161.203279-0.170631-169.777468-0.170631-339.554936 0-509.332404 0-48.075177 19.11063-87.746797 54.985718-119.441434 23.333737-20.646305 51.189186-31.822611 81.476121-37.410764zM81.348149 405.930247v129.807245c-0.085315 43.29752-0.511892 86.59504-0.341262 129.849903 0.170631 47.691259 32.505133 80.622968 80.23905 80.836256 89.581076 0.426577 179.162152 0.298604 268.743228 0a93.377607 93.377607 0 0 0 71.067653-31.054773 38.263917 38.263917 0 0 0 10.579099-27.130268c-0.127973-134.499587 0-268.999174-0.127973-403.498761-0.042658-36.685584-10.323153-46.710132-46.966078-47.136709-23.333737-0.298604-46.667475 0.426577-69.915897-0.938469-26.703692-1.578333-40.610088-17.574954-40.780719-44.449277-0.127973-21.627431 0.085315-43.29752-0.042657-64.924951-0.213288-31.140088-15.356756-46.411529-46.667475-47.179366a201.770709 201.770709 0 0 0-5.033604-0.042658c-46.283556 0-92.567112 0-138.850667 0.085315-7.976982 0-15.911305 0.213288-23.760314 2.132883-33.144998 7.976982-54.345853 34.254097-54.303195 67.996302 0 85.229995-3.071351 170.417333-3.839189 255.647328z m862.281842 272.795705v-114.834407c-0.042658-32.291845 0.085315-64.58369-0.426576-96.875535-0.255946-17.27635-8.787477-26.874323-25.423963-31.268062a69.531978 69.531978 0 0 0-17.830899-1.706306c-23.632341-0.042658-47.264682 0.213288-70.939681-0.127973-21.670089-0.341261-38.306574-13.863738-41.29261-33.400944a170.204044 170.204044 0 0 1-1.450361-22.907161c-0.341261-21.328828-0.255946-42.614998-0.72518-63.901167a34.765989 34.765989 0 0 0-13.949053-27.556846c-9.597972-7.507747-20.902251-9.811261-32.846395-9.81126h-131.89747c-14.077026 0-14.418287 0.298604-14.418287 14.674233l0.042658 327.610792c0 3.839189-1.876937 9.043423 1.834279 11.133648 4.095135 2.303513 6.953198-2.687432 9.896576-4.948288 43.980043-33.486259 87.832112-67.143149 131.726839-100.672066 2.559459-1.919594 5.033603-5.673468 8.531531-3.881847 3.412612 1.748964 2.00491 5.972072 2.00491 9.171396 0.085315 28.964548 0.383919 57.929096-0.085315 86.850986-0.170631 9.768603 3.369955 12.669324 12.797296 12.541351 30.969458-0.426577 61.938915 0.127973 92.908373-0.341261 9.725945-0.127973 12.797297 3.412612 12.541351 12.797296-0.511892 16.977747-0.127973 33.955494-0.127973 50.933241 0 17.319008-0.042658 17.319008-16.935089 17.361665h-85.86986c-15.058152 0-15.143468 0.085315-15.143468 15.015495-0.042658 28.282025 0 56.564051-0.085315 84.888734 0 2.815405 0.938468 6.526621-2.602117 7.849008-2.815405 1.023784-4.90563-1.578333-6.995855-3.114008-7.422432-5.588153-14.844864-11.261621-22.224639-16.93509L597.207173 707.434554c-4.137793-3.156666-8.232927-7.166486-10.664413 1.791622-10.451126 38.946439-32.974367 69.31869-66.204681 91.927247a12.37072 12.37072 0 0 0-6.057387 10.664414c-0.341261 16.636486-1.578333 33.315629-1.151757 49.909456 1.194414 47.947204 32.334503 80.537653 78.319455 80.793599 91.585986 0.511892 183.129314 0.127973 274.7153 0.170631 24.186891 0 44.534592-9.384684 62.365492-25.168017a42.231079 42.231079 0 0 0 15.314098-34.083466c-0.55455-68.252248-0.255946-136.504497-0.255946-204.714088zM226.213546 487.918261c-15.143468 0-30.329593-0.255946-45.515718 0.085315-7.379774 0.213288-10.109864-2.900721-10.024549-10.579099 0.298604-19.665179 0.426577-39.373016 0-59.038194-0.213288-8.958108 3.412612-11.602882 11.304278-11.560225 28.452656 0.213288 56.905312 0.085315 85.315311 0.042658 15.527387 0 15.527387 0 15.527386-16.849774 0-27.044953-0.042658-54.047249 0.085316-81.049545 0-3.45527-1.578333-8.104954 2.303513-9.981891 3.241982-1.578333 5.673468 2.132883 8.104954 4.052477 56.990627 45.984952 113.895939 92.097878 170.971883 137.997514 6.014729 4.862973 7.038513 7.976982 0.341261 13.351847-57.630492 46.240898-115.047696 92.7804-172.592873 139.149271-2.132883 1.706306-4.351081 4.948288-7.337117 3.114009-2.858063-1.706306-1.791622-5.417522-1.791621-8.275585-0.085315-29.348467-0.383919-58.739591 0.085315-88.088058 0.170631-9.768603-3.199324-12.882612-12.20009-12.498693-14.844864 0.597207-29.689728 0.170631-44.577249 0.17063v-0.042657z">
						</path>
					</svg>
				</div>
			</div>

			<!-- welcome page -->
			<div v-if="editortype==='none'"
				style="overflow: auto; padding: 12px; background-color: transparent; display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; pointer-events: all;">
				<div class="form-vcontainer center" style="margin: auto; flex: unset; gap: 40px;">
					<svg style="fill: var(--ObjectBGColor);" viewBox="0 0 1028 1024" version="1.1"
						xmlns="http://www.w3.org/2000/svg" p-id="3873" width="160" height="160">
						<path
							d="M1018.319924 112.117535q4.093748 9.210934 6.652341 21.492179t2.558593 25.585928-5.117186 26.609365-16.374994 25.585928q-12.281245 12.281245-22.003898 21.492179t-16.886712 16.374994q-8.187497 8.187497-15.351557 14.32812l-191.382739-191.382739q12.281245-11.257808 29.167958-27.121083t28.144521-25.074209q14.32812-11.257808 29.679676-15.863275t30.191395-4.093748 28.656239 4.605467 24.050772 9.210934q21.492179 11.257808 47.589826 39.402329t40.425766 58.847634zM221.062416 611.554845q6.140623-6.140623 28.656239-29.167958t56.289041-56.80076l74.710909-74.710909 82.898406-82.898406 220.038979-220.038979 191.382739 192.406177-220.038979 220.038979-81.874969 82.898406q-40.937484 39.914047-73.687472 73.175753t-54.242167 54.753885-25.585928 24.562491q-10.234371 9.210934-23.539054 19.445305t-27.632802 16.374994q-14.32812 7.16406-41.960921 17.398431t-57.824197 19.957024-57.312478 16.886712-40.425766 9.210934q-27.632802 3.070311-36.843736-8.187497t-5.117186-37.867173q2.046874-14.32812 9.722653-41.449203t16.374994-56.289041 16.886712-53.730448 13.304682-33.773425q6.140623-14.32812 13.816401-26.097646t22.003898-26.097646z">
						</path>
					</svg>
					<!-- <div class="title1-dark" style="color: var(--ThemeColor); font-size: 30pxx;">
						欢迎使用
					</div> -->
					<div class="form-container" style="gap: 40px;">
						<div class="form-vcontainer" style="gap: 12px; align-self: flex-start;">
							<!-- <div class="form-vcontainer gap">
								<div class="title1-dark left noleftmargin">项目</div>
								<div class="button-dark dark flex" @click="emit('load_Project', [])">
									<a class="button-text">
										导入项目
									</a>
								</div>
							</div> -->
							<div class="form-vcontainer gap">
								<div class="title1-dark left noleftmargin">文件</div>
								<div class="form-vcontainer gap">
									<!--									<div class="button-dark dark flex" @click="new_File('pole')">-->
									<!--										<a class="button-text">-->
									<!--											新建 主杆设计页面-->
									<!--										</a>-->
									<!--									</div>-->
									<div class="button-dark dark flex" @click="new_File('component')">
										<a class="button-text">
											新建 组件导入页面
										</a>
									</div>
									<div class="button-dark dark flex" @click="new_File('mainpole')">
										<a class="button-text">
											新建 复合组件设计页面
										</a>
									</div>
									<div class="button-dark dark flex" @click="new_File('box')">
										<a class="button-text">
											新建 控制箱设计页面
										</a>
									</div>
									<div class="button-dark dark flex" @click="new_File('roadsvg')">
										<a class="button-text">
											新建 路牌 svg
										</a>
									</div>
									<div class="button-dark dark flex" @click="emit('load_Remote', [])">
										<a class="button-text">
											远程加载
										</a>
									</div>
									<!-- <div class="button-dark dark flex" @click="new_File('txt')">
										<a class="button-text">
											新建 .txt 文件
										</a>
									</div> -->
								</div>
							</div>
						</div>
						<div class="form-vcontainer" style="gap: 12px; align-self: flex-start;">
							<div class="form-vcontainer gap flex">
								<div class="title1-dark left noleftmargin">自定义</div>
								<div class="form-vcontainer gap">
									<div class="button-dark dark flex" style="padding: 6px;"
										@click="emit('open_Setting', ['主题'])">
										<div class="form-vcontainer left">
											<a class="button-text">
												颜色主题
											</a>
											<a class="button-text" style="font-size: 10px; word-break: keep-all;">
												使编辑器和代码呈现你喜欢的外观
											</a>
										</div>
									</div>
									<div class="button-dark dark flex" style="padding: 6px;"
										@click="emit('open_Setting', ['界面'])">
										<div class="form-vcontainer left">
											<a class="button-text">
												重置界面
											</a>
											<a class="button-text" style="font-size: 10px; word-break: keep-all;">
												使编辑器的界面布局恢复初始状态
											</a>
										</div>
									</div>
								</div>
							</div>
							<div class="form-vcontainer gap flex">
								<div class="title1-dark left noleftmargin">帮助</div>
								<div class="form-vcontainer gap">
									<div class="button-dark dark flex" style="padding: 6px;"
										@click="emit('open_UpdateInfo', [])">
										<div class="form-vcontainer left">
											<a class="button-text">
												更新说明
											</a>
											<a class="button-text" style="font-size: 10px; word-break: keep-all;">
												打开本版本编辑器的更新说明
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- <div v-show="editortype==='txt'"
				style="overflow: auto; background-color: transparent; display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; pointer-events: all;">
				<textarea class="textarea-dark" v-model="reactive.text" style="width: 100%; height: 100%; resize: none;"
					:style="{'font-size': reactive.fontsize+'px'}"></textarea>
			</div> -->

			<div v-show="editortype==='svg'"
				style="overflow: auto; background-color: var(--ScrollColor); display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; pointer-events: all;">
				<!-- <div style="background-color: brown; width: 100%; height: 100%;">{{reactive.url}}</div> -->
				<div class="button-dark" style="z-index: 1; align-self: flex-start; pointer-events: all; margin: 10px;"
					@click="emit('upload', [])">
					<svg class="button-icon-svg" viewBox="-10 -10 1044 1044" version="1.1"
						xmlns="http://www.w3.org/2000/svg" p-id="2967">
						<path
							d="M938.855808 638.776382l0 270.299169c0 27.41028-22.210861 49.634444-49.621141 49.634444l-754.442728 0c-27.41028 0-49.647747-22.224164-49.647747-49.634444L85.144192 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444s49.634444 22.224164 49.634444 49.634444l0 220.664725 655.17384 0L839.58692 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444S938.855808 611.366102 938.855808 638.776382zM349.445764 351.817788l112.918769-115.288746 0 429.77837c0 27.411303 22.224164 49.634444 49.634444 49.634444 27.41028 0 49.634444-22.223141 49.634444-49.634444L561.633421 236.534158 674.547073 351.812671c9.722432 9.927093 22.591531 14.904455 35.470863 14.904455 12.524245 0 25.071002-4.716418 34.725896-14.172791 19.583011-19.184945 19.913539-50.608631 0.733711-70.190619L547.478026 80.195483c-9.335622-9.535167-22.116717-14.905478-35.46063-14.905478-13.338796 0-26.120914 5.370311-35.456536 14.900362L278.542924 282.3486c-19.184945 19.588127-18.86465 51.010791 0.722454 70.190619C298.847365 371.724163 330.271052 371.394658 349.445764 351.817788z">
						</path>
					</svg>
					<a class="button-text">上传</a>
				</div>
				<div style="flex: 1;flex: 1 1 0%; display: flex; flex-direction: column; justify-content: center; background-repeat: no-repeat; background-position: center; margin: 10px; align-self: stretch;"
					:style="{ 'background-image': `url(${reactive.url})`}">
					<!-- <img :src="reactive.url"> -->
				</div>
			</div>

			<div v-show="editortype==='roadsvg'"
				style="overflow: auto; background-color: var(--ScrollColor); display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; pointer-events: all;">
				<!-- <div style="background-color: brown; width: 100%; height: 100%;">{{reactive.url}}</div> -->
				<div class="button-dark" style="z-index: 1; align-self: flex-start; pointer-events: all; margin: 10px;"
					@click="emit('upload', [])">
					<svg class="button-icon-svg" viewBox="-10 -10 1044 1044" version="1.1"
						xmlns="http://www.w3.org/2000/svg" p-id="2967">
						<path
							d="M938.855808 638.776382l0 270.299169c0 27.41028-22.210861 49.634444-49.621141 49.634444l-754.442728 0c-27.41028 0-49.647747-22.224164-49.647747-49.634444L85.144192 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444s49.634444 22.224164 49.634444 49.634444l0 220.664725 655.17384 0L839.58692 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444S938.855808 611.366102 938.855808 638.776382zM349.445764 351.817788l112.918769-115.288746 0 429.77837c0 27.411303 22.224164 49.634444 49.634444 49.634444 27.41028 0 49.634444-22.223141 49.634444-49.634444L561.633421 236.534158 674.547073 351.812671c9.722432 9.927093 22.591531 14.904455 35.470863 14.904455 12.524245 0 25.071002-4.716418 34.725896-14.172791 19.583011-19.184945 19.913539-50.608631 0.733711-70.190619L547.478026 80.195483c-9.335622-9.535167-22.116717-14.905478-35.46063-14.905478-13.338796 0-26.120914 5.370311-35.456536 14.900362L278.542924 282.3486c-19.184945 19.588127-18.86465 51.010791 0.722454 70.190619C298.847365 371.724163 330.271052 371.394658 349.445764 351.817788z">
						</path>
					</svg>
					<a class="button-text">上传</a>
				</div>
				<div class="form-vcontainer flex vcenter" style="overflow: hidden; width: 100%; padding: 10px 20px;">
					<svg version="1.1" id="图层_1" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 4252 1276"
						style="enable-background:new 0 0 4252 1276;" xml:space="preserve">
						<path
							d="M71,0h4110c39.2,0,71,31.8,71,71v1134c0,39.2-31.8,71-71,71H71c-39.2,0-71-31.8-71-71V71C0,31.8,31.8,0,71,0z"
							style="fill:#FFFFFF;" />
						<path d="M0,855V71C0,31.8,31.8,0,71,0h4110c39.2,0,71,31.8,71,71v784" style="fill:#03529D;" />
						<polygon v-if="reactive.left==='三角形'" points="150.3,541 347.8,655 347.8,427 "
							style="fill:#FFFFFF;" />
						<polygon v-if="reactive.right==='三角形'" points="4110.5,540.8 3913.1,426.8 3913.1,654.8 "
							style="fill:#FFFFFF;" />
						<circle v-if="reactive.right==='圆形'" cx="3982.5" cy="541" r="128" style="fill:#FFFFFF;" />
						<circle v-if="reactive.left==='圆形'" cx="278.3" cy="541" r="128" style="fill:#FFFFFF;" />
					</svg>
				</div>
			</div>

			<div v-show="editortype!=='none'" class="h-box">

				<template v-if="editortype === 'component' || editortype === 'mainpole'">
					<div class="form-vcontainer gap left" style="flex: unset; padding: 10px;">
						<div class="form-container left gap" style="flex: unset;">
							<div class="button-dark" style="z-index: 1; align-self: flex-start; pointer-events: all;"
								@click="emit('upload', [])">
								<svg class="button-icon-svg" viewBox="-10 -10 1044 1044" version="1.1"
									xmlns="http://www.w3.org/2000/svg" p-id="2967">
									<path
										d="M938.855808 638.776382l0 270.299169c0 27.41028-22.210861 49.634444-49.621141 49.634444l-754.442728 0c-27.41028 0-49.647747-22.224164-49.647747-49.634444L85.144192 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444s49.634444 22.224164 49.634444 49.634444l0 220.664725 655.17384 0L839.58692 638.776382c0-27.41028 22.224164-49.634444 49.634444-49.634444S938.855808 611.366102 938.855808 638.776382zM349.445764 351.817788l112.918769-115.288746 0 429.77837c0 27.411303 22.224164 49.634444 49.634444 49.634444 27.41028 0 49.634444-22.223141 49.634444-49.634444L561.633421 236.534158 674.547073 351.812671c9.722432 9.927093 22.591531 14.904455 35.470863 14.904455 12.524245 0 25.071002-4.716418 34.725896-14.172791 19.583011-19.184945 19.913539-50.608631 0.733711-70.190619L547.478026 80.195483c-9.335622-9.535167-22.116717-14.905478-35.46063-14.905478-13.338796 0-26.120914 5.370311-35.456536 14.900362L278.542924 282.3486c-19.184945 19.588127-18.86465 51.010791 0.722454 70.190619C298.847365 371.724163 330.271052 371.394658 349.445764 351.817788z">
									</path>
								</svg>
								<a class="button-text">上传</a>
							</div>
							<div class="button-dark" style="z-index: 1; align-self: flex-start; pointer-events: all;"
								@click="reactive.showInfo = !reactive.showInfo">
								<template v-if="reactive.showInfo">
									<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
										xmlns="http://www.w3.org/2000/svg" style="margin: 0px;"
										@click="expand_List(true)">
										<path
											d="M140.16 332.16a40.96 40.96 0 0 0 0 58.24l343.04 338.56a40.96 40.96 0 0 0 58.24 0l342.4-338.56a40.96 40.96 0 1 0-58.24-58.24L512 640 197.76 332.16a40.96 40.96 0 0 0-57.6 0z">
										</path>
									</svg>
								</template>
								<template v-else>
									<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
										xmlns="http://www.w3.org/2000/svg" style="margin: 0px;">
										<path
											d="M332.16 883.84a40.96 40.96 0 0 0 58.24 0l338.56-343.04a40.96 40.96 0 0 0 0-58.24L390.4 140.16a40.96 40.96 0 0 0-58.24 58.24L640 512l-307.84 314.24a40.96 40.96 0 0 0 0 57.6z">
										</path>
									</svg>
								</template>
							</div>
						</div>
						<div class="form-vcontainer left hoverhide gap">
							<div v-if="reactive.showInfo && reactive.error !== ''" class="listview-dark"
								style="border-radius: var(--ObjectRadius); background-color: rgb(221, 59, 59); color: white; text-align: left; z-index: 1; height: fit-content; pointer-events: all;"
								v-html="reactive.error">
							</div>
							<div v-if="reactive.showInfo&& reactive.info !== ''" class="listview-dark"
								style="border-radius: var(--ObjectRadius); background-color: rgb(240, 200, 97); text-align: left; color: black; z-index: 1; height: fit-content; pointer-events: all;"
								v-html="reactive.info">
							</div>
						</div>
					</div>
					<div class="filler"></div>
				</template>

				<template v-if="editortype === 'pole'">
					<div class="form-vcontainer smallgap"
						style="margin: 10px; z-index: 1; flex: unset; height: fit-content;  pointer-events: all;"
						@click.stop @dblclick.stop @mousemove.stop @mousedown.stop @contextmenu.stop.prevent>
						<div :class="{'button-dark': true, 'selected': 0===reactive.selectedMode, 'top': true}"
							style="margin: 0px; height: unset; padding: 3px 6px;" @click="emit('set_ToolMode', [0])">
							<svg class="button-icon-svg medium" viewBox="0 0 122 123" xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
								<g transform="translate(-633 -158)">
									<path
										d="M734 246.286 705.124 217.443 730.569 208.286C731.876 207.837 732.571 206.415 732.122 205.109 731.871 204.38 731.299 203.808 730.569 203.557L657.249 179.129C656.986 179.042 656.711 178.999 656.434 179L656.434 179C655.061 179.029 653.971 180.166 654.001 181.538 654.006 181.793 654.05 182.045 654.133 182.286L678.52 255.629C678.981 256.93 680.41 257.613 681.713 257.153 682.425 256.901 682.986 256.341 683.238 255.629L692.415 230.172 721.263 259Z"
										fill-rule="evenodd" />
								</g>
							</svg>
						</div>
						<div :class="{'button-dark': true, 'selected': 1===reactive.selectedMode, 'bottom': true}"
							style="margin-left: 0px; height: unset; padding: 3px 6px;"
							@click="emit('set_ToolMode', [1])">
							<svg class="button-icon-svg medium" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
								xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Cube" overflow="hidden">
								<g id="Icons">
									<path
										d="M40.733 86.185 86 75.259 86 25.539 53.054 9.85 10 19.244 10 69.637ZM52.327 16.15 73.865 26.406 56.429 30.314 41.581 33.642 21.562 22.862ZM16 66.053 16 26.682 38.145 38.607 38.145 77.978ZM80 70.535 44.145 79.19 44.145 39.217 59.729 35.723 80 31.18Z" />
									<rect x="51.69" y="18.186" width="2" height="4" />
									<rect x="51.69" y="39.186" width="2" height="4" />
									<rect x="51.69" y="46.186" width="2" height="4" />
									<rect x="51.69" y="25.186" width="2" height="4" />
									<rect x="51.69" y="53.186" width="2" height="4" />
									<rect x="67.517" y="64.345" width="2" height="4"
										transform="matrix(0.412214 -0.911087 0.911087 0.412214 -20.173 101.421)" />
									<rect x="47.144" y="58.959" width="4" height="2"
										transform="matrix(0.977075 -0.212894 0.212894 0.977075 -11.638 11.837)" />
									<rect x="19.788" y="64.928" width="4" height="2"
										transform="matrix(0.977075 -0.212894 0.212894 0.977075 -13.536 6.15)" />
									<rect x="61.139" y="61.46" width="2" height="3.999"
										transform="matrix(0.412103 -0.911137 0.911137 0.412103 -21.29 93.925)" />
									<rect x="73.895" y="67.23" width="2" height="4"
										transform="matrix(0.412214 -0.911087 0.911087 0.412214 -19.053 108.928)" />
									<rect x="54.762" y="58.575" width="2" height="4"
										transform="matrix(0.412103 -0.911137 0.911137 0.412103 -22.41 86.418)" />
									<rect x="26.627" y="63.436" width="4" height="2"
										transform="matrix(0.977075 -0.212894 0.212894 0.977075 -13.062 7.572)" />
									<rect x="33.466" y="61.944" width="4" height="2"
										transform="matrix(0.977075 -0.212894 0.212894 0.977075 -12.587 8.994)" />
								</g>
							</svg>
						</div>
					</div>
					<div class="filler"></div>
					<div class="form-container smallgap"
						style="margin: 10px 6px 10px 10px; z-index: 1; flex: unset; height: fit-content;  pointer-events: all;"
						@click.stop @dblclick.stop @mousemove.stop @mousedown.stop @contextmenu.stop.prevent>
						<div :class="{'button-dark': true, 'selected': 0===reactive.transformMode, 'left': true}"
							style="margin: 0px; height: unset; padding: 3px 6px;"
							@click="emit('set_TransformMode', [0])">
							<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M537.856 47.286857a36.571429 36.571429 0 0 0-51.712 0l-164.571429 164.571429a36.571429 36.571429 0 1 0 51.712 51.712L475.428571 161.426286V475.428571H161.426286l102.144-102.144a36.571429 36.571429 0 0 0-51.712-51.712l-164.571429 164.571429a36.571429 36.571429 0 0 0 0 51.712l164.571429 164.571429a36.571429 36.571429 0 0 0 51.712-51.712L161.426286 548.571429H475.428571v314.002285l-102.144-102.144a36.571429 36.571429 0 0 0-51.730285 51.712l164.571428 164.571429a36.571429 36.571429 0 0 0 51.748572 0l164.553143-164.571429a36.571429 36.571429 0 1 0-51.712-51.712L548.571429 862.573714V548.571429h314.002285l-102.144 102.144a36.571429 36.571429 0 1 0 51.712 51.712l164.571429-164.571429a36.571429 36.571429 0 0 0 0-51.712l-164.571429-164.571429a36.571429 36.571429 0 0 0-51.712 51.712L862.573714 475.428571H548.571429V161.426286l102.144 102.144a36.571429 36.571429 0 0 0 51.712-51.712l-164.571429-164.571429z">
								</path>
							</svg>
						</div>
						<div :class="{'button-dark': true, 'selected': 1===reactive.transformMode, 'right': true}"
							style="margin-left: 0px; height: unset;" @click="emit('set_TransformMode', [1])">
							<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M634.88 512a87.04 87.04 0 1 1-174.08 0 87.04 87.04 0 0 1 174.08 0z m-87.04 394.24a393.728 393.728 0 0 1-325.44-171.776l62.368-32.576A324.64 324.64 0 0 0 550.4 839.68c179.552 0 325.12-145.568 325.12-325.12S729.952 189.44 550.4 189.44c-159.424 0-291.968 114.784-319.68 266.208h76.448L191.936 645.12l-115.232-189.472h80.96C185.024 264.608 349.248 117.76 547.84 117.76c217.728 0 394.24 176.512 394.24 394.24s-176.512 394.24-394.24 394.24z">
								</path>
							</svg>
						</div>
					</div>

					<div class="form-container smallgap"
						style="margin: 10px 10px 10px 0px; z-index: 1; flex: unset; height: fit-content;  pointer-events: all;"
						@click.stop @dblclick.stop @mousemove.stop @mousedown.stop @contextmenu.stop.prevent>
						<div :class="{'button-dark': true, 'selected': reactive.transformSnap}"
							style="margin: 0px; height: unset; padding: 3px 6px;"
							@click="emit('set_TransformSnap', [!reactive.transformSnap])">
							<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M795.733333 386.56h-20.48a42.666667 42.666667 0 0 0-29.866666 12.373333l-256 256a89.173333 89.173333 0 0 1-113.066667 12.8 58.88 58.88 0 0 1-11.093333-9.386666 85.333333 85.333333 0 0 1 0-120.746667l260.266666-256a42.666667 42.666667 0 0 0 12.8-30.293333v-23.466667a42.666667 42.666667 0 0 0-12.373333-29.866667l-101.546667-100.266666a42.666667 42.666667 0 0 0-29.866666-12.373334h-21.76a42.666667 42.666667 0 0 0-29.866667 12.373334l-251.733333 250.026666a349.013333 349.013333 0 0 0-23.893334 474.453334l15.36 16.64a341.333333 341.333333 0 0 0 482.986667 0l260.266667-258.56a42.666667 42.666667 0 0 0 12.8-30.293334v-20.48a42.666667 42.666667 0 0 0-12.373334-29.866666l-100.693333-100.693334a42.666667 42.666667 0 0 0-29.866667-12.373333z m-190.72 391.68a256 256 0 0 1-361.813333 0 163.413333 163.413333 0 0 1-11.946667-10.24 263.253333 263.253333 0 0 1 20.053334-357.973333l119.466666-116.48 60.16 58.026666-128 125.013334a170.666667 170.666667 0 0 0 0 241.493333 153.6 153.6 0 0 0 22.186667 18.346667 174.933333 174.933333 0 0 0 222.72-22.186667l124.16-121.173333 60.16 60.16z">
								</path>
							</svg>
						</div>
						<!-- <input type="number" class="lineedit-dark"
							style="width: 60px; border-radius: 0px var(--ObjectRadius) var(--ObjectRadius) 0px; text-align: center;"> -->
					</div>

				</template>

				<div v-show="needRender" id="axis-container" class="axis-container" style="pointer-events: all;"
					@click.stop @dblclick.stop @mousemove.stop @mousedown.stop>
				</div>
			</div>

			<div v-show="needRender" class="filler" />

			<!-- put bottombar custom items here -->
			<div v-show="editortype!=='none' && (reactive.bottombar === undefined || reactive.bottombar)"
				class="bottombar" style="justify-content: flex-end; pointer-events: all;" @click.stop @dblclick.stop
				@mousemove.stop @mousedown.stop>

				<div class="filler"></div>

				<div v-if="editortype==='txt'" class="bargroup smallgap">
					<div class="button left" :class="{'inactive': reactive.fontsize < 16}"
						@click="emit('change_FontSize',[false])">
						<a class="button-text">A-</a>
					</div>
					<div class="button center">
						<a class="button-text">{{reactive.fontsize}}px</a>
					</div>
					<div class="button right" :class="{'inactive': reactive.fontsize >100}"
						@click="emit('change_FontSize',[true])">
						<a class="button-text">A+</a>
					</div>
				</div>

				<div v-if="needRender" class="bargroup smallgap">
					<div class="button left" @click="switch_View('Front')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-935 -125)">
								<path
									d="M1106.01 206.25 1053.86 231.463 1053.86 300.727 1106.01 274.524ZM1046 152 1118 188.05 1118 283.95 1046 320 974 283.95 974 188.05Z"
									fill-rule="evenodd" />
							</g>
						</svg>
						<a class="button-text">前视图</a>
					</div>
					<div class="button center" @click="switch_View('Top')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-684 -125)">
								<path
									d="M794.678 166.018 745.591 191.068 794.738 215.202 843.595 190.981ZM795 152 867 188.05 867 283.95 795 320 723 283.95 723 188.05Z"
									fill-rule="evenodd" />
							</g>
						</svg>
					</div>
					<div class="button right" @click="switch_View('Left')">
						<svg class="button-icon-svg" viewBox="0 0 222 222" xmlns="http://www.w3.org/2000/svg"
							xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
							<g transform="translate(-271 -177)">
								<path
									d="M321.992 257.927 321.992 325.794 374.144 351.841 374.144 282.99ZM382 204 454 239.835 454 335.165 382 371 310 335.165 310 239.835Z"
									fill-rule="evenodd" />
							</g>
						</svg>
					</div>
				</div>
				<div v-if="needRender" class="button" @click="on_SwitchCamera()">
					<a class="button-text">{{currentCamera}}</a>
				</div>
				<div v-if="needRender" class="button" @click="center_View()">
					<a class="button-text">居中视图</a>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import * as THREE from "three";
	import OrbitControls from 'three-orbitcontrols'
	import Utils from "./show-utils.js";
	import { saveAs } from 'file-saver';
	import { Slot, Module, SlotModifier, SM_Free, create_Module_from_Json, create_Tree_from_PoleJson, Unit, get_UniqueID, ModulePlugin, MP_Model/*, MP_Scale, MP_CustomScript, MP_MouseSensor*/ } from './Sun/ModuleSlot.js';
	// import * as TOOL from './Sun/ToolManager.js'
	// import { get_Tools, get_FlowGraph } from './Tools.js'
	import { customLog, set_Console, HTML, radius_to_degree, degree_to_radius, to_PoleAngle, get_NearPoleAngle, get_AngleBetween } from './Utils.js'
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import { getAesKey, encrypt, encryptedData } from '../assets/encryption/encryption.js'
	import ColorPicker from './Sun/ColorPicker'
	import ButtonPanel from './Sun/ButtonPanel'
	import CryptoJS from 'crypto-js'
	import staticData from './Sun/StaticData.js'
	import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
	import * as FileSystem from './Sun/FileSystem.js'
	import * as Editor_Pole from './Editor/Editor_Pole.js'
	import * as Editor_Box from './Editor/Editor_Box.js'
	import * as Editor_Component from './Editor/Editor_Component.js'
	import * as Editor_None from './Editor/Editor_None.js'
	// import * as Editor_Text from './Editor/Editor_Text.js'
	import * as Editor_Svg from './Editor/Editor_Svg.js'
	import * as Editor_MainPole from './Editor/Editor_MainPole.js'
	import * as Editor_RoadSvg from './Editor/Editor_RoadSvg.js'
	import { getBundlePole, searchSchemeLogsByUnitEngineeringId } from '@/api/ThreeDimExhibition'
	import {
		getUser
	} from '@/utils/auth'
	// import { codemirror } from 'vue-codemirror'
	// import 'codemirror/theme/ayu-dark.css'
	// import 'codemirror/mode/javascript/javascript'
	// import 'codemirror/addon/hint/show-hint.css'
	// import 'codemirror/addon/hint/show-hint.js'
	// import 'codemirror/addon/hint/javascript-hint.js';

	export default {
		mixins: [staticData],
		name: "ModelDisplay",
		components: {
			'panel-switch-bar': PanelSwitchBar,
			'color-picker': ColorPicker,
			'button-panel': ButtonPanel,
			// codemirror
		},
		props: {
			// Mode: {
			// 	type: String,
			// 	default: () => { }
			// },
			CanvasSize: {
				type: Object,
				default: () => { return { x: 0, y: 0, width: 0, height: 0 } }
			},
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '画布', panelid: 'CanvasPanel' }]
				}
			},
			PanelWidth: {
				type: Number,
				default: 100
			},
			PanelHeight: {
				type: Number,
				default: 100
			},
		},
		static() {
			// let ToolManager = new TOOL.ToolManager((type, title, info) => {
			// 	this.$EventBus.$emit('console_add_Output', type, '工具流程', info)
			// }, (info) => {
			// 	// let str = HTML.create_TabOr([HTML.create_Button('左键') + ' 旋转', HTML.create_Button('滚轮') + ' 缩放', HTML.create_Or([HTML.create_Button('Ctrl+左键'), HTML.create_Button('Shift+左键')]) + ' 平移'])
			// 	// this.$EventBus.$emit('console_add_Output', 'log', '视图操作', str)
			// 	customLog(null, 'info', 'ToolManager', '结束', '')
			// })
			// ToolManager.equip_Tools(get_Tools(this))

			return {
				// ToolManager: ToolManager,
				MouseRawPosition: new THREE.Vector2(0, 0),
				Scenes: [],
				Scene: null,
				Raycaster: new THREE.Raycaster(),
				OrbitControl: null,
				Clock: new THREE.Clock(false),
				SelectedModule: null,
				Editor: 'none',
				ModuleList: [],
				CanvasSize: { width: 0, height: 0 },
				Renderer: null,
				EditorMap: {
					pole: Editor_Pole,
					none: Editor_None,
					component: Editor_Component,
					// txt: Editor_Text,
					svg: Editor_Svg,
					mainpole: Editor_MainPole,
					roadsvg: Editor_RoadSvg,
					box: Editor_Box
				}
			}
		},
		data() {
			return {
				editortype: 'none',
				// ToolManager
				// 0-编辑 1-测量
				SelectedMode: 0,
				// 编辑中： 0-等待 1-拼装
				WorkingTool: 0,

				scenes: [],
				currentsceneidx: -1,
				reactive: {},
				needRender: false,

				// SceneTree
				// 组件树的包围盒
				boundingbox: new THREE.Box3(),
				// 选中的Module

				// 页面
				showGizmo: false,
				currentCamera: '透视',
				gridHelper: true,
				moduletree: null,  //static

				// Mouse
				checkLoadResult: [],

				additionaldistance: 0,

				stats: null,
				showstats: false,
				run: false,
				needResize: false,

				axisrenderer: null,
				axisscene: null,
				axiscamera: null,
				iconMap: {
					pole: '<svg class="icon-dark" viewBox="0 0 1447 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" ><path d="M598.200767 1011.094488L11.885832 672.584025c-17.568695-10.144043-15.368135-27.873754 4.91995-39.57429l764.166661-441.203241c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.510463c17.568695 10.144043 15.368135 27.873754-4.91995 39.592181l-764.166662 441.18535c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#8F95AB" p-id="7742"></path><path d="M598.200767 952.681261L11.885832 614.170798c-17.568695-10.144043-15.368135-27.873754 4.91995-39.592181l764.166661-441.18535C801.260529 121.65695 831.943127 120.404599 849.529713 130.602314l586.314935 338.45679c17.568695 10.144043 15.368135 27.873754-4.91995 39.57429L666.758036 949.836635c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#ADB8D0" p-id="7743"></path><path d="M598.200767 890.833015L11.885832 552.322552C-5.682863 542.089056-3.553866 524.448798 16.805782 512.730371L780.972443 71.562912c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.492572c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 887.988389c-20.288085 11.700536-50.988575 12.988668-68.557269 2.844626z" fill="#C7CEE2" p-id="7744"></path><path d="M598.200767 828.966878L11.885832 490.456415C-5.682863 480.312372-3.553866 462.600551 16.805782 450.846343L780.972443 9.696775c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626L1435.844648 345.291049c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 826.122252c-20.288085 11.718427-50.988575 12.952887-68.557269 2.844626z" fill="#F5F8FC" p-id="7745"></path><path d="M877.439248 416.156222L544.6896 224.027695l211.951453-122.372579 332.76754 192.128527-211.969345 122.372579z" fill="#D7DEED" p-id="7746"></path><path d="M1230.154949 421.541331l-118.526072-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l118.526073 68.432034a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0zM1166.338723 459.254985l-118.526073-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l118.526072 68.432035a14.813523 14.813523 0 0 1 0 25.655303 14.813523 14.813523 0 0 1-14.813522 0zM980.883437 569.300853l-491.995017-284.068978a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l491.995018 284.051087a14.831413 14.831413 0 0 1 0 25.673195 14.813523 14.813523 0 0 1-14.813523 0zM462.642722 355.631889l-47.839807-27.641174a14.795632 14.795632 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l47.839806 27.623284a14.831413 14.831413 0 0 1 0 25.673194 14.885086 14.885086 0 0 1-14.813522 0zM905.527691 610.073822L511.699098 382.611107a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813522 0l393.828594 227.409043a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0.071563zM832.730319 654.800641l-491.995017-284.068977a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l491.995017 284.068978a14.831413 14.831413 0 0 1 0 25.673194 14.831413 14.831413 0 0 1-14.813523 0zM658.653537 637.231947L268.92192 412.220262a14.831413 14.831413 0 0 1 0-25.673195 14.813523 14.813523 0 0 1 14.813523 0l389.731616 225.011685a14.831413 14.831413 0 0 1 0 25.673195 14.885086 14.885086 0 0 1-14.813522 0zM722.255074 673.94372l37.248496 21.468874a14.813523 14.813523 0 0 0 14.813523 0 14.813523 14.813523 0 0 0 0-25.655304l-37.266387-21.468874a14.813523 14.813523 0 0 0-14.813522 0 14.813523 14.813523 0 0 0 0.01789 25.655304zM679.87194 737.634712L192.564293 456.303015a14.831413 14.831413 0 0 1 0-25.673194 14.831413 14.831413 0 0 1 14.831414 0L694.685463 712.050971a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523-0.071563zM1043.500985 467.287922l-64.066697-36.980134a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l64.066696 36.998025a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813522 0z" fill="#C7CEE2" p-id="7747"></path></svg>',
					txt: '<svg class="icon-dark" viewBox="-150 -150 1324 1324" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M981.333333 276.053333V981.333333a42.666667 42.666667 0 0 1-42.666666 42.666667H85.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V42.666667a42.666667 42.666667 0 0 1 42.666666-42.666667h619.946667z" fill="#4C98FC" p-id="11324"></path><path d="M705.28 233.386667V0L981.333333 276.053333H747.946667a42.666667 42.666667 0 0 1-42.666667-42.666666z" fill="#A5D1FD" p-id="11325"></path><path d="M167.04 489.386667m26.666667 0l160 0q26.666667 0 26.666666 26.666666l0 0q0 26.666667-26.666666 26.666667l-160 0q-26.666667 0-26.666667-26.666667l0 0q0-26.666667 26.666667-26.666666Z" fill="#FFFFFF" p-id="11326"></path><path d="M300.373333 542.72v229.333333a26.666667 26.666667 0 0 1-26.666666 26.666667 26.666667 26.666667 0 0 1-26.666667-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11327"></path><path d="M653.866667 489.386667m26.666666 0l160 0q26.666667 0 26.666667 26.666666l0 0q0 26.666667-26.666667 26.666667l-160 0q-26.666667 0-26.666666-26.666667l0 0q0-26.666667 26.666666-26.666666Z" fill="#FFFFFF" p-id="11328"></path><path d="M787.2 542.72v229.333333a26.666667 26.666667 0 0 1-26.666667 26.666667 26.666667 26.666667 0 0 1-26.666666-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11329"></path><path d="M430.43932 531.537782m18.856181 18.856181l173.476863 173.476863q18.856181 18.856181 0 37.712362l0 0q-18.856181 18.856181-37.712361 0l-173.476864-173.476864q-18.856181-18.856181 0-37.712361l0 0q18.856181-18.856181 37.712362 0Z" fill="#FFFFFF" p-id="11330"></path><path d="M392.650461 742.693177m18.856181-18.856181l173.476864-173.476863q18.856181-18.856181 37.712361 0l0 0q18.856181 18.856181 0 37.712361l-173.476863 173.476864q-18.856181 18.856181-37.712362 0l0 0q-18.856181-18.856181 0-37.712362Z" fill="#FFFFFF" p-id="11331"></path></svg>',
					svg: '<svg class="icon-dark" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M661.15 72L860 261.81V952H164V72h497.15M666 0H152a60 60 0 0 0-60 60v904a60 60 0 0 0 60 60h720a60 60 0 0 0 60-60V256.67a60 60 0 0 0-18.57-43.4L707.39 16.6A60 60 0 0 0 666 0z" fill="#959CA7" p-id="3184"></path><path d="M530 284H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72zM896 295H684a36 36 0 0 1-36-36V47a36 36 0 0 1 72 0v176h176a36 36 0 1 1 0 72zM530 416H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72z" fill="#959CA7" p-id="3185"></path><path d="M92 555m20 0l582 0q20 0 20 20l0 276q0 20-20 20l-582 0q-20 0-20-20l0-276q0-20 20-20Z" fill="#3C87F7" p-id="3186"></path><path d="M152.27 753.42h38.55q0.83 11.53 10.74 19.35t26.93 7.83q16.33 0 25.25-6.82a21.78 21.78 0 0 0 8.93-18.22q0-9.57-6.93-15t-21.91-8.79l-28.43-6.52a87.11 87.11 0 0 1-19-6.18 61 61 0 0 1-15.32-10.21 42.44 42.44 0 0 1-10.68-15.55 54.84 54.84 0 0 1-3.81-21q0-18 9.65-31.29A58.26 58.26 0 0 1 192 621.19q16.1-6.58 36.37-6.58 31.53 0 51.09 15.74t19.84 41H262a26.18 26.18 0 0 0-9.55-18.43q-8.72-7.5-24.21-7.5-14.53 0-23 6.41t-8.44 17.4q0 16.57 25.68 21.86l28.69 6.44a98.26 98.26 0 0 1 19.77 6.23 67.87 67.87 0 0 1 16 10.08 40.34 40.34 0 0 1 11.34 15.82 58.1 58.1 0 0 1 3.94 22.2q0 27.65-20.26 43.6t-55.38 16a111.57 111.57 0 0 1-29-3.47q-12.88-3.46-21.14-9.15a55.91 55.91 0 0 1-13.8-13.38 52.27 52.27 0 0 1-7.9-15.6 60.32 60.32 0 0 1-2.47-16.44zM313.71 618.5h46.46l40.49 144.77h1.66l39.94-144.77h44.93l-62.27 189.28H376zM495.65 724.3v-23.57q0-39.38 21.78-62.61t60-23.23a92.77 92.77 0 0 1 32.74 5.48q14.63 5.48 23.75 14.63A67.21 67.21 0 0 1 648 655.59a64.73 64.73 0 0 1 5.43 24.06h-39.36q-1.81-14.76-11.88-23.12t-25.35-8.36q-18.76 0-29.87 13.27T535.86 701v23.21q0 24.88 10.07 39.4t31.32 14.52q17.23 0 27.64-9.37a29.89 29.89 0 0 0 10.42-23.15V735h-36.74v-29.83h75.16v37.44a74 74 0 0 1-2.44 18.86 64.82 64.82 0 0 1-8.29 18.44A66.36 66.36 0 0 1 628.52 796q-8.64 6.94-22 11.16a98.57 98.57 0 0 1-29.81 4.23q-20.61 0-36.31-6.52A63.45 63.45 0 0 1 515 786.5a80.64 80.64 0 0 1-14.51-27.5 117 117 0 0 1-4.84-34.7z" fill="#FFFFFF" p-id="3187"></path></svg>',
					stl: '<svg class="icon-dark" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M156.01854658 328.14285752l-1.28571416 0.64285664v364.5l357.42857168 187.71428584V505.89285752L156.01854658 328.14285752z" fill="#ffffff" p-id="3982"></path><path d="M868.62568994 328.46428584l-356.78571416-187.71428584-342.3214292 180-13.82142832 7.39285752 356.14285752 177.75 4.1785708-1.92857168 353.5714292-174.85714336z m-353.57142832 175.5l-4.17857168 3.21428584z" fill="#f9f28b" p-id="3983"></path><path d="M939.98283242 294.07142832a61.71428584 61.71428584 0 0 0-25.39285664-26.6785708L539.16140411 68.75a58.82142832 58.82142832 0 0 0-54.64285753 0L109.4114041 266.10714248a53.03571416 53.03571416 0 0 0-15.42857168 13.8214292 59.46428584 59.46428584 0 0 0-9.64285664 12.53571416A55.28571416 55.28571416 0 0 0 77.26854658 319.14285752v385.71428496a59.14285752 59.14285752 0 0 0 32.14285753 52.0714292l374.78571415 197.35714248a64.28571416 64.28571416 0 0 0 26.67857168 7.71428584h4.5a61.71428584 61.71428584 0 0 0 22.82142832-6.10714248l374.78571416-198.32142919a59.78571416 59.78571416 0 0 0 32.14285752-52.71428585V319.14285752a57.21428584 57.21428584 0 0 0-5.14285752-25.0714292z m-70.39285664 35.03571416l-353.5714292 174.85714336-4.1785708 2.25v375.10714248L154.08997578 693.28571416V328.78571416l13.82142832-7.39285664 343.92857168-180.64285752 356.78571416 187.71428584z" fill="#e98f36" p-id="3984"></path></svg>',
					mainpole: '<svg class="icon-dark" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2574" width="200" height="200"><path d="M841.67168 399.587556c-52.906667-195.128889-241.208889-321.080889-440.888889-294.855112a126.520889 126.520889 0 0 1-70.712889 136.362667 125.44 125.44 0 0 1-149.504-33.109333 404.138667 404.138667 0 0 0-130.275555 297.699555c0 111.274667 44.828444 212.081778 117.191111 285.240889a125.383111 125.383111 0 0 1 143.416889-17.578666c46.705778 25.031111 72.817778 76.8 65.308444 129.422222 197.233778 38.456889 392.476444-74.865778 457.728-265.671111a126.407111 126.407111 0 0 1-79.075555-121.457778 126.293333 126.293333 0 0 1 86.812444-116.053333z m50.517333-5.688889a126.179556 126.179556 0 0 1 114.346667 129.991111 126.122667 126.122667 0 0 1-122.538667 122.197333c-71.623111 221.525333-298.097778 352.995556-524.970666 304.753778a125.724444 125.724444 0 0 1-222.151111 11.548444 126.862222 126.862222 0 0 1 0.455111-130.389333A454.542222 454.542222 0 0 1 0.000569 505.685333 454.769778 454.769778 0 0 1 156.046791 162.133333 126.577778 126.577778 0 0 1 223.517013 11.889778a125.496889 125.496889 0 0 1 157.980445 44.544c231.537778-37.148444 453.063111 109.226667 510.748444 337.464889h-0.056889z m-439.182222 314.026666a201.159111 201.159111 0 0 1-174.364444-101.091555 202.922667 202.922667 0 0 1 0-202.24 201.159111 201.159111 0 0 1 174.364444-101.091556 201.784889 201.784889 0 0 1 201.329778 202.183111 201.784889 201.784889 0 0 1-201.386667 202.24z"></path></svg>',
					component: '<svg class="icon-dark" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z"/></svg>'
				},
				listQuery: {
					poleId: 0,
					presetPoleCode: 0,
					visualPlanningCompositePoleCode: 0,
					sourceType: 0,
					unitEngineeringId: 0,
					regionName: '',
					pageNum: 1,
					pageSize: 500,
					orgCompanyId: ''
				},
				selectedPath: '',
				saveFileName: '',
				savetype: ''
			};
		},
		watch: {
			CanvasSize(newval, oldval) {
				let width = Math.round(this.CanvasSize.width - 4)
				let height = Math.round(this.CanvasSize.height - 4)
				// //console.log(">>>", width, height)
				if (this.$static.CanvasSize.width !== width || this.$static.CanvasSize.height !== height) {
					this.$static.CanvasSize.width = width
					this.$static.CanvasSize.height = height
					this.needResize = true
				}
			},
			// Mode(newval, oldval) {
			// 	if (newval === 'build') {
			// 		this.refresh_build_selectedModule_inspector(this.$static.SelectedModule)
			// 	}
			// },
			additionaldistance(newval, oldval) {
				this.refresh_Tree(newval)
			},
			// Scene Elements Control
			gridHelper(newval) {
				let grid = this.$static.Scene.scene.getObjectByName('GroundGrid')
				if (grid !== null)
					grid.visible = newval
			},
			run(newval) {
				if (newval) {
					this.$static.Clock.start()
				}
				else {
					this.$static.Clock.stop()
				}
			}
		},
		computed: {
		},
		methods: {
			register_Scene(scene) {
				if (!this.$static.Scenes.includes(scene)) {
					this.$static.Scenes.push(scene)
					this.scenes = this.$static.Scenes.map((scene) => { return { name: scene.name, filetype: scene.filetype } })
					this.switch_Scene(this.$static.Scenes.length - 1)
				}
			},

			switch_Scene(idx) {
				let scene = null
				if (this.$static.Scene) {
					if (!this.$static.EditorMap[this.$static.Editor].can_Switch.call(this, this.$static.Scene)) return
					this.$static.Scene.cameratarget = (new THREE.Vector3(0, 0, 0)).copy(this.$static.OrbitControl.target)
				}
				if (this.$static.Scenes[idx] !== undefined) {
					this.currentsceneidx = idx
					scene = this.$static.Scenes[idx]
					this.reactive = scene.reactive || {}
					this.$static.Editor = scene.filetype
					this.editortype = this.$static.Editor
					this.$static.Scene = scene
					if (this.$static.Scenes[idx].render) {
						this.needRender = true
						this.$static.OrbitControl.object = scene.currentcamera
						this.$static.OrbitControl.target.copy(scene.cameratarget)
						this.$static.OrbitControl.update()
						let width = this.CanvasSize.width - 4
						let height = this.CanvasSize.height - 4
						this.$static.Renderer.setSize(width, height)
						this.$static.Scene.camera.persp.aspect = (width / height)
						this.$static.Scene.camera.persp.updateProjectionMatrix()
						this.$static.Scene.camera.orth.left = width / -2
						this.$static.Scene.camera.orth.right = width / 2
						this.$static.Scene.camera.orth.top = height / 2
						this.$static.Scene.camera.orth.bottom = height / -2
						this.$static.Scene.camera.orth.updateProjectionMatrix()
						this.currentCamera = scene.currentcameraname
						// this.animate()
					}
					else {
						this.needRender = false
						this.$static.OrbitControl.object = null
						this.currentCamera = ''
					}
				}
				else {
					this.currentsceneidx = idx
					this.reactive = {}
					this.$static.Scene = null
					this.needRender = false
					this.$static.OrbitControl.object = null
					this.currentCamera = ''
					this.$static.Editor = 'none'
					this.editortype = this.$static.Editor
					this.$static.EditorMap.none.switch_Scene.call(this, null)
				}
				// editor event
				this.$static.Scenes.forEach((s) => {
					if (scene !== null && s === scene) this.$static.EditorMap[s.filetype].switch_Scene.call(this, s)
					else this.$static.EditorMap[s.filetype].deselect_Scene.call(this, s)
				})
			},

			has_Scene(path) {
				for (let i = 0; i < this.$static.Scenes.length; i++) {
					if (this.$static.Scenes[i].path === path) {
						return i
					}
				}
				return undefined
			},

			get_SceneIdx(uid) {
				for (let i = 0; i < this.$static.Scenes.length; i++) {
					if (this.$static.Scenes[i].uid === uid) return i
				}
				return undefined
			},

			close_Scene(idx) {
				// remove Tree
				// if (this.$static.Scenes[idx].uid === undefined)
				// 	this.$EventBus.$emit('app_open_Popup', 'pw-file-system-dialogue', 'display', '保存 ' + this.$static.Scenes[idx].name, 1000, 800, true, true, true, { path: FileSystem.ROOT.name, savetype: this.$static.Editor, idx: idx, savename: this.$static.Scenes[idx].name, action: 'display_saveclose_File' }, false)
				// else
				if (this.$static.EditorMap[this.$static.Editor].close_Scene.call(this, this.$static.Scenes[idx])) {
					// 	this.release_Scene(idx)
					// }
					// else {
					this.$EventBus.$emit('app_open_Popup', 'pw-confirm', 'display', '确认', 600, 200, true, false, true, { title: '关闭 ' + this.$static.Scenes[idx].name, description: '未保存的进度将会丢失', action: 'display_close_File', additional: [/*{ title: '保存并关闭', action: 'display_saveclose_File' }*/], data: { idx: idx } }, false)
				}
			},

			release_Scene(idx) {
				let scene = this.$static.Scenes.splice(idx, 1)[0]
				this.$static.EditorMap[this.$static.Editor].release_Scene.call(this, scene)
				this.switch_Scene(Math.max(0, idx - 1))
				this.scenes = this.$static.Scenes.map((scene) => { return { name: scene.name, filetype: scene.filetype } })
				FileSystem.ROOT.print()
			},

			drop_File() {
				let data = event.dataTransfer.getData("FileDragData")
				if (data !== '') {
					let itemfrom = JSON.parse(data)
					if (itemfrom && itemfrom.type === 'file') {
						this.$EventBus.$emit('display_open_File', itemfrom)
					}
				}
			},

			init() {
				let axiscontainer = document.getElementById("axis-container")
				Utils.initRenderer.apply(this)
				Utils.initStats.apply(this)
				Utils.initCamera.apply(this)

				let OrbitControl = new OrbitControls(new THREE.Object3D(), document.getElementById('Canvas-Show-Canvas'))
				OrbitControl.screenSpacePanning = true
				OrbitControl.mouseButtons = {
					LEFT: THREE.MOUSE.LEFT,
					MIDDLE: -1,
					RIGHT: -1,
				}
				this.$static.OrbitControl = OrbitControl

				// this.$static.EditorMap[this.$static.Editor].new_Scene.call(this, null)

				// container.appendChild(this.$static.Renderer.domElement)
				axiscontainer.appendChild(this.axisrenderer.domElement)
				this.$static.OrbitControl.target = new THREE.Vector3(0, 0, 0)
				this.$static.OrbitControl.update()
			},

			new_File(filetype) {
				// //console.log(filetype)
				if (this.$static.Scene === null || this.$static.EditorMap[this.editortype].can_Switch.call(this, this.$static.Scene))
					this.$static.EditorMap[filetype].new_Scene.call(this, null)
			},

			//========================================
			//                 Camera
			//========================================
			// 切换三视图
			switch_View(dir) {
				// alert("fin!!!")
				this.switch_Camera('正交')
				switch (dir) {
					case 'Front':
						this.$static.Scene.currentcamera.position.set(1000, this.$static.OrbitControl.target.y, this.$static.OrbitControl.target.z)
						this.$static.OrbitControl.update()
						break
					case 'Top':
						this.$static.Scene.currentcamera.position.set(this.$static.OrbitControl.target.x, 1000, this.$static.OrbitControl.target.z)
						this.$static.OrbitControl.update()
						break
					case 'Left':
						this.$static.Scene.currentcamera.position.set(this.$static.OrbitControl.target.x, this.$static.OrbitControl.target.y, 1000)
						this.$static.OrbitControl.update()
						break
				}
			},

			center_View() {
				this.boundingbox.setFromObject(this.$static.Scene.objectorigin)
				// //console.log(this.$static.OrbitControl.object.uuid)
				this.boundingbox.getCenter(this.$static.OrbitControl.target)
				// this.$static.OrbitControl.target.y = 0
				this.$static.OrbitControl.target.x = 0
				this.$static.OrbitControl.target.z = 0
				this.$static.OrbitControl.update()
			},

			on_SwitchCamera() {
				switch (this.$static.Scene.currentcameraname) {
					case '正交':
						this.switch_Camera('透视')
						break
					case '透视':
						this.switch_Camera('正交')
						break
				}
			},

			switch_Camera(val) {
				let width = this.CanvasSize.width - 4
				let height = this.CanvasSize.height - 4
				if (this.$static.Scene.currentcameraname !== val) {
					switch (val) {
						case '正交':
							this.$static.Scene.currentcamera = this.$static.Scene.camera.orth
							this.$static.Scene.currentcamera.position.copy(this.$static.Scene.camera.persp.position)
							this.$static.Scene.currentcamera.rotation.copy(this.$static.Scene.camera.persp.rotation)

							let vecP = new THREE.Vector3(0, 0, 0)
							let tarP = new THREE.Vector3(0, 0, 0)
							vecP.copy(this.$static.Scene.camera.persp.position)
							tarP.copy(this.$static.OrbitControl.target).negate()
							vecP.add(tarP)
							let dP0 = (height / 2) / (Math.tan(this.$static.Scene.camera.persp.fov / 2 / 180 * Math.PI))
							let dP = vecP.length()
							this.$static.Scene.camera.orth.zoom = (dP0 / dP)
							this.$static.OrbitControl.object = this.$static.Scene.currentcamera
							this.$static.Scene.camera.orth.updateProjectionMatrix()
							this.$static.OrbitControl.update()
							this.$static.Scene.currentcameraname = '正交'
							this.currentCamera = '正交'
							break
						case '透视':
							this.$static.Scene.currentcamera = this.$static.Scene.camera.persp
							this.$static.Scene.currentcamera.position.copy(this.$static.Scene.camera.orth.position)
							this.$static.Scene.currentcamera.rotation.copy(this.$static.Scene.camera.persp.rotation)
							// //console.log(this.OrthographicCamera.zoom)
							let vecO = new THREE.Vector3(0, 0, 0)
							let tarO = new THREE.Vector3(0, 0, 0)
							vecO.copy(this.$static.Scene.camera.persp.position)
							tarO.copy(this.$static.OrbitControl.target).negate()
							vecO.add(tarO).normalize()

							let dO = (height / 2) / (Math.tan(this.$static.Scene.camera.persp.fov / 2 / 180 * Math.PI))
							vecO.multiplyScalar(dO / this.$static.Scene.camera.orth.zoom)
							tarO.negate().add(vecO)

							this.$static.Scene.camera.persp.position.copy(tarO)
							this.$static.OrbitControl.object = this.$static.Scene.currentcamera
							this.$static.OrbitControl.update()
							this.$static.Scene.currentcameraname = '透视'
							this.currentCamera = '透视'
							break
					}
					if (this.$static.Scene.transformcontrol !== undefined) {
						//console.log(">>>>>>>>>>>>>>>>>>>")
						this.$static.Scene.transformcontrol.camera = this.$static.Scene.currentcamera
					}
				}
			},

			//========================================
			//             Mouse Control
			//========================================
			mouseMove() {
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				// this.$static.ToolManager.call('mousemove', { mouse_pos: this.get_Mouse2DPosition() })
				// //console.log(this.get_Mouse3DPosition())
			},

			set_MouseFromGlobal(x, y) {
				this.$static.MouseRawPosition.set(x - this.CanvasSize['x'] - 2, y - this.CanvasSize['y'] - 2)
			},

			get_Mouse2DPosition() {
				return new THREE.Vector2((this.$static.MouseRawPosition.x) / (this.CanvasSize['width'] - 4) * 2 - 1, - (this.$static.MouseRawPosition.y) / (this.CanvasSize['height'] - 4) * 2 + 1)
			},

			get_Mouse3DPosition() {
				let mouse = this.get_Mouse2DPosition()
				this.$static.Raycaster.setFromCamera(mouse, this.$static.Scene.currentcamera)
				let intersect = this.$static.Raycaster.intersectObject(this.$static.Scene.raycastplane)
				if (intersect.length > 0) {
					return intersect[0].point
				}
				else {
					return new THREE.Vector3(0, 0, 0)
				}
			},

			is_Mouse_Inside() {
				let mouse = this.get_Mouse2DPosition()
				// //console.log(mouse)
				if (mouse.x < -1 || mouse.x > 1 || mouse.y < -1 || mouse.y > 1) {
					return false
				}
				return true
			},

			//========================================
			//             Events
			//========================================
			get_RayCastObject(objarray, mouseposition) {

				this.$static.Raycaster.setFromCamera(mouseposition, this.$static.Scene.currentcamera)

				let intersects = this.$static.Raycaster.intersectObjects(objarray)

				let indexarray = new Array()

				intersects.forEach((item) => {
					let obj = item.object
					for (let i = 0; i < objarray.length; i++) {
						if (obj === objarray[i]) {
							indexarray.push(i)
							break
						}
					}
				})

				if (intersects.length > 0) {
					return { interfaces: intersects, index: indexarray }
				}
				else {
					return null
				}
			},

			mouseOut() {
				// //console.log("Mouse Out")
				// let infobox = document.getElementById("Info-Box")
				// infobox.style.display = 'none'
			},

			mouseClick() {
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				this.$static.EditorMap[this.$static.Editor].mouseClick.call(this)
			},

			mouseDoubleClick(event) {
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				this.$static.EditorMap[this.$static.Editor].mouseDoubleClick.call(this)
			},

			mouseRightClick(event) {
				this.$static.MouseRawPosition.set(event.offsetX, event.offsetY)
				// this.$static.ToolManager.call('rightclick', { mouse_pos: this.get_Mouse2DPosition() })
			},

			onContextMenu(event) {
				// //console.log(">>>>>>>>>>>>>")
				this.$static.EditorMap[this.$static.Editor].onContextMenu.call(this)
			},

			inspectorUpdate(action, val) {
				this.$static.EditorMap[this.$static.Editor].inspectorUpdate.call(this, action, val)
			},

			emit(func, args) {
				if (this.$static.EditorMap[this.$static.Editor][func]) {
					this.$static.EditorMap[this.$static.Editor][func].apply(this, args)
				}
			},

			//========================================
			//            Render & Loop
			//========================================
			actionLoop(scale) {
				this.$static.EditorMap[this.$static.Editor].actionLoop.call(this, scale)
			},

			restart() {
				this.$static.Clock.stop()
				this.run = false
				let refresh = false
				this.$static.Scene.baseslot.Traverse((module) => {
					let ans = module.init_Plugins(this)
					refresh = refresh || ans
				})
				if (refresh) {
					this.refresh_Tree()
					this.refresh_build_selectedModule_inspector(this.$static.SelectedModule)
				}
			},

			animate() {
				if (this.$static.Scene !== null && this.$static.Scene.scene && this.$static.Scene.render) {
					this.update_Axis()
					let scale = this.update_Mouse3DPlane()
					this.actionLoop(scale)
					if (this.$static.Renderer !== null) {
						if (this.needResize) {
							// //console.log('resize', this.$static.CanvasSize)
							let width = this.$static.CanvasSize.width
							let height = this.$static.CanvasSize.height
							this.$static.Renderer.setSize(width, height, true)
							if (this.needRender) {
								this.$static.Scene.camera.persp.aspect = (width / height)
								this.$static.Scene.camera.persp.updateProjectionMatrix()
								this.$static.Scene.camera.orth.left = width / -2
								this.$static.Scene.camera.orth.right = width / 2
								this.$static.Scene.camera.orth.top = height / 2
								this.$static.Scene.camera.orth.bottom = height / -2
								this.$static.Scene.camera.orth.updateProjectionMatrix()
							}
							this.needResize = false
						}
						this.$static.Renderer.render(this.$static.Scene.scene, this.$static.Scene.currentcamera);
						this.axisrenderer.render(this.axisscene, this.axiscamera)
						let pos = new THREE.Vector3().copy(this.$static.Scene.currentcamera.position)
						let rot = new THREE.Euler().copy(this.$static.Scene.currentcamera.rotation)
						this.$EventBus.$emit("display_camera_PosRot", pos, rot)
					}
				}
				// if (this.$static.Scene !== null && this.$static.Scene.render)
				requestAnimationFrame(this.animate);
			},

			update_Axis() {
				if (this.showstats)
					this.stats.update()
				let vec = new THREE.Vector3(0, 0, 0)
				let tar = new THREE.Vector3(0, 0, 0)
				vec.copy(this.$static.Scene.currentcamera.position)
				tar.copy(this.$static.OrbitControl.target).negate()
				vec.add(tar)
				vec.normalize()
				vec.multiplyScalar(40)
				this.axiscamera.position.copy(vec)
				this.axiscamera.rotation.copy(this.$static.Scene.currentcamera.rotation)

				this.$static.Scene.raycastplane.rotation.copy(this.$static.Scene.currentcamera.rotation)
				this.$static.Scene.raycastplane.position.copy(this.$static.OrbitControl.target)
			},

			update_Mouse3DPlane() {
				let width = this.CanvasSize.width - 4
				let height = this.CanvasSize.height - 4
				let scale = 0
				if (this.$static.Scene.currentcamera === this.$static.Scene.camera.persp) {
					let vecP = new THREE.Vector3(0, 0, 0)
					let tarP = new THREE.Vector3(0, 0, 0)
					vecP.copy(this.$static.Scene.camera.persp.position)
					tarP.copy(this.$static.OrbitControl.target).negate()
					vecP.add(tarP)
					let dP0 = (height / 2) / (Math.tan(this.$static.Scene.camera.persp.fov / 2 / 180 * Math.PI))
					let dP = vecP.length()
					scale = 1 / (dP0 / dP)
					this.$static.Scene.raycastplane.scale.x = scale * width
					this.$static.Scene.raycastplane.scale.y = scale * height
				}
				else {
					scale = 1 / this.$static.Scene.camera.orth.zoom
					this.$static.Scene.raycastplane.scale.x = scale * width
					this.$static.Scene.raycastplane.scale.y = scale * height
				}
				return scale
			},
			getBundlePole() {
				let that = this
				searchSchemeLogsByUnitEngineeringId(that.listQuery).then(response => {
					if (typeof response != 'undefined' && response.respCode === 0) {
						if (response.returns) {

							let poleList = response.returns;
							if (poleList != null && poleList.length > 0) {
								poleList.forEach((pole) => {
									that.selectedPath = that.listQuery.regionName;
									that.saveFileName = '合杆' + pole.facilityCode;
									that.savetype = 'pole';

									that.$EventBus.$emit('filesystem_save_File_Pole', JSON.parse(pole.cmptChgAction), that.selectedPath + '/' + that.saveFileName + '.' + that.savetype,
										pole.presetPoleCode, that.listQuery.sourceType, that.listQuery.unitEngineeringId, that.saveFileName, pole.facilityId)
								})
								that.$nextTick(() => {
									// 从指定杆子处跳转过来高亮该杆，确保在灯杆已读取完毕后调用
									if (that.listQuery.poleId != null && that.listQuery.poleId.toString().length > 0) {
										that.$EventBus.$emit('set_selectedPath', that.selectedPath + '/合杆' + that.listQuery.visualPlanningCompositePoleCode + '.pole')
									}
								})
							}
						}
					}
				})
			},
			deal_url(str, param) {
				return str.indexOf(param) === -1 ? null :
					(str.split(param)[1].split('&') == null
						? str.split(param)[1] : str.split(param)[1].split('&')[0]);
			}

		},
		mounted() {
			//console.log(window.location.search.toString());
			let paramsFromPlatform = decodeURI(window.location.search.toString());
			if (paramsFromPlatform != null && paramsFromPlatform.length > 0) {

				this.listQuery.unitEngineeringId = this.deal_url(paramsFromPlatform, 'regionId=')
				this.listQuery.regionName = this.deal_url(paramsFromPlatform, 'regionName=')

				this.listQuery.facilityId = this.deal_url(paramsFromPlatform, 'poleId=')
				this.listQuery.presetPoleCode = this.deal_url(paramsFromPlatform, 'presetPoleCode=')
				this.listQuery.visualPlanningCompositePoleCode = this.deal_url(paramsFromPlatform, 'visualPlanningCompositePoleCode=')
				this.listQuery.sourceType = this.deal_url(paramsFromPlatform, 'sourceType=')
				this.listQuery.orgCompanyId = this.deal_url(paramsFromPlatform, 'orgCompanyId=')

			} else {
				// 外网临时代码
				this.listQuery.regionId = 1
				this.listQuery.regionName = ''
			}
			this.getBundlePole()

			// Init
			this.init()
			set_Console(this)
			this.$static.EditorMap[this.$static.Editor].switch_Scene.call(this, this.$static.Scene)

			for (let i in this.$static.EditorMap) {
				this.$static.EditorMap[i].init_Editor.call(this)
			}

			// let TESTGRAPH = new TOOL.FlowGraph('LOG-ALL-TEST-SubGraph:1|SubGraph:1-ALL-LOG1-LOG:2', 'LOG', {
			// 	TEST(global, param) {
			// 		global.data = param.data
			// 		return {
			// 			subgraph: new TOOL.FlowGraph('LOG-ALL-TEST-SubGraph:1|SubGraph:1-ALL-LOG2-LOG:1', 'LOG', {
			// 				TEST(global, param) {
			// 					global.data = param.data
			// 					let newgraph = new TOOL.FlowGraph('LOG', 'LOG')
			// 					// //console.log(newgraph)
			// 					return {
			// 						subgraph: newgraph, param: { data: global.data + ">3" }
			// 					}
			// 				},
			// 				LOG2(global, param) {
			// 					return { data: global.data }
			// 				}
			// 			}), param: { data: global.data + ">2" }
			// 		}
			// 	},
			// 	LOG1(global, param) {
			// 		return { data: global.data }
			// 	}
			// })

			// this.$static.ToolManager.run(TESTGRAPH, { data: "1" })

			// //console.log(this.$static.ToolManager)

			// Signals
			this.$EventBus.$on('leftmenu_dragend_Module', (modulename, componentid, createJson, event) => {
				// //console.log(modulename, componentid, createJson)
				// //console.log(JSON.stringify(createJson))
				// return
				this.set_MouseFromGlobal(event.clientX, event.clientY)
				if (this.is_Mouse_Inside()) {
					console.log('11', this.$static.Editor);
					if (this.$static.EditorMap[this.$static.Editor].leftmenu_dragend_Module) {
						console.log('createJson', createJson);
						this.$static.EditorMap[this.$static.Editor].leftmenu_dragend_Module.call(this, modulename, componentid, createJson, event)
					}
				}
			})
			this.$EventBus.$on('display_inspectorUpdate', (action, val) => {
				this.inspectorUpdate(action, val)
			})
			this.$EventBus.$on('display_select_Module', (moduleuid, args) => {
				if (this.$static.EditorMap[this.$static.Editor].select_Module)
					this.$static.EditorMap[this.$static.Editor].select_Module.call(this, moduleuid)
				// if (args === 'deselect') {
				// 	this.$static.ToolManager.run(get_FlowGraph('SelectModule_and_Highlight', this), { module: null })
				// }
				// else {
				// 	let module = this.get_Module_by_UID(moduleuid)
				// 	if (module !== null) {
				// 		this.$static.ToolManager.run(get_FlowGraph('SelectModule_and_Highlight', this), { module: module })
				// 	}
				// }
			})
			this.$EventBus.$on('display_select_Slot', (slotuid, args) => {
				if (this.$static.EditorMap[this.$static.Editor].select_Slot)
					this.$static.EditorMap[this.$static.Editor].select_Slot.call(this, slotuid)
			})
			this.$EventBus.$on('display_switch_View', (data, args) => {
				switch (args) {
					case 'front':
						this.switch_View('Front')
						return
					case 'left':
						this.switch_View('Left')
						return
					case 'top':
						this.switch_View('Top')
						return
					case 'center':
						this.center_View()
						return
					case 'mode':
						this.on_SwitchCamera()
						return
				}
			})
			this.$EventBus.$on('display_ToolManager_ContextMenu', (data, args) => {
				if (this.$static.EditorMap[this.$static.Editor].ToolManager)
					this.$static.EditorMap[this.$static.Editor].ToolManager.call('contextmenu_click', { data: data, args: args })
			})
			this.$EventBus.$on('display_ContextMenu', (action, data, args) => {
				if (this.$static.EditorMap[this.$static.Editor][action]) {
					this.$static.EditorMap[this.$static.Editor][action].call(this, data, args)
				}
			})
			this.$EventBus.$on('display_PopupWindow', (action, data, args) => {
				if (this.$static.EditorMap[this.$static.Editor][action]) {
					//console.log(this.$static.Editor,action)
					this.$static.EditorMap[this.$static.Editor][action].call(this, data, args)
				}
			})
			this.$EventBus.$on('display_open_File', (item) => {
				if (!['pole', 'component', 'svg', 'box', 'tube', 'stl'].includes(item.filetype)) {
					this.$EventBus.$emit('console_add_Output', "error", "打开文件 错误", "无法打开 " + HTML.create_KeyPair('文件', item.name, 'File')
						+ ' 类型为 ' + HTML.create_KeyPair('扩展名', item.filetype, 'String'))
					return
				}

				let path = item.path
				let idx = this.has_Scene(path)
				if (idx !== undefined) {
					if (idx !== this.currentsceneidx)
						this.switch_Scene(idx)
					return
				}
				if (FileSystem.ROOT.file_exist(path)) {
					this.$static.Editor = item.filetype
					// 如果直接拖入零件 无需再拖拽至检视器中
					if (item.filetype === 'stl') {
						this.$static.Editor = 'component'
					}
					this.$static.EditorMap[this.$static.Editor].new_Scene.call(this, item)
				}
			})

			this.$EventBus.$on('display_new_File', (item, filetype) => {
				// //console.log(filetype, item)
				this.new_File(filetype)
			})
			this.$EventBus.$on('display_close_File', (state, data, item) => {
				// //console.log(state, data, item)
				if (state)
					this.release_Scene(data.idx)
			})
			this.$EventBus.$on('display_saveclose_File', (state, data, item) => {
				// //console.log(state, data, item)
				if (state !== false)
					this.$static.EditorMap[this.$static.Editor].save_Scene.call(this, this.$static.Scene, item)
				this.release_Scene(data.idx)
			})

			this.animate();
		},
		beforeDestroy() {
			this.$EventBus.$off('leftmenu_dragend_Module')
			this.$EventBus.$off('display_inspectorUpdate')
			this.$EventBus.$off('display_select_Module')
			this.$EventBus.$off('display_select_Slot')
			this.$EventBus.$off('display_switch_View')
			this.$EventBus.$off('display_ContextMenu')
			this.$EventBus.$off('display_ToolManager_ContextMenu')
			this.$EventBus.$off('display_PopupWindow')
			this.$EventBus.$off('display_close_File')
			this.$EventBus.$off('display_open_File')
			this.$EventBus.$off('display_new_File')
			this.$EventBus.$off('display_saveclose_File')
		}
	};
</script>
<style>
	#Canvas-Show-Canvas {
		position: absolute;
		top: 0px;
		left: 0px;
		right: 0px;
		bottom: 0px;
		border: none;
		outline: none;
		border-radius: var(--CanvasRadius);
	}

	#Stats-output-show>div {
		overflow: hidden;
		border-radius: var(--ObjectRadius);
	}

	.CodeMirror {
		height: 100%;
		font-family: consolas;
	}
</style>