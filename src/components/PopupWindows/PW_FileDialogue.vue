<template>
	<div id="PW_UpdateInfo" style="width: 100%; height: 100%; position: relative;">
		<div class="container full">
			<div class="v-box">
				<div style="display: flex; flex-direction: column; flex: 1; padding: 6px; gap: 6px;">

					<div class="listview-dark">
						<div class="form-container left gap">
							<div class="button-dark" :class="{'selected': showTree}" @click="showTree = !showTree">
								<svg class="button-icon-svg" viewBox="-20 -40 1084 1084" version="1.1"
									xmlns="http://www.w3.org/2000/svg" p-id="5163"
									xmlns:xlink="http://www.w3.org/1999/xlink">
									<path
										d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z">
									</path>
								</svg>
							</div>
							<div class="form-container hbuttonlist">
								<div class="button-dark" :class="{'inactive': !can_GoBack}" @click="go_Back()">
									<svg class="button-icon-svg" viewBox="-100 -100 1224 1224" version="1.1"
										xmlns="http://www.w3.org/2000/svg">
										<path
											d="M398.3 312.8V85.3L0 483.5l398.3 398.3V648.5c284.4 0 483.6 91 625.7 290.2-56.8-284.5-227.5-568.9-625.7-625.9">
										</path>
									</svg>
								</div>
								<!-- <div class="button-dark" @click="confirm()">
									<svg class="button-icon-svg" viewBox="0 0 118 118"
										xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
										overflow="hidden">
										<g transform="translate(-561 -534)">
											<path d="M619.188 549.025 619.188 635.145" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
											<path d="M662.423 591.911 576.303 591.91" stroke-width="9"
												stroke-miterlimit="8" fill-rule="evenodd" />
										</g>
									</svg>
								</div> -->
							</div>
							<div class="form-container hbuttonlist left" style="flex: 1;">
								<div v-for="path, idx in get_PathList" class="button-dark"
									:class="{'selected': idx === get_PathList.length-1}" @click="selectedPath = path">
									<a class="button-text">{{path.split('/').slice(-1)[0]}}</a>
								</div>
							</div>
							<!-- <div class="filler" /> -->
							<div class="button-dark" @click="new_Folder()">
								<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M928.426667 354.986667L213.333333 687.786667 102.4 450.56 781.653333 134.826667c20.48-10.24 44.373333 0 52.906667 18.773333l93.866667 201.386667z"
										opacity=".3"></path>
									<path
										d="M459.093333 262.826667l-6.826666-51.2c-1.706667-15.36-13.653333-25.6-29.013334-25.6H114.346667c-15.36 0-29.013333 13.653333-29.013334 29.013333v658.773333c0 15.36 13.653333 29.013333 29.013334 29.013334h795.306666c15.36 0 29.013333-13.653333 29.013334-29.013334V317.44c0-15.36-13.653333-29.013333-29.013334-29.013333H488.106667c-15.36 0-27.306667-10.24-29.013334-25.6z">
									</path>
								</svg>
								<a class="button-text">新建文件夹</a>
							</div>
						</div>
					</div>

					<div style="display: flex; flex-direction: row; flex: 1; gap: 6px; height: 100px;">
						<div v-show="showTree"
							style="width: 32%; height: 100%; display: flex; flex-direction: column; gap: 6px;">
							<div class="treeview-dark flex">
								<filetree-group :Selected="selectedPath" :List="file" :OnlyFolder="true"
									:Drag="renamePath === ''" :Items="file" @click="click" @move="move">
								</filetree-group>
							</div>
						</div>
						<div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap:6px">
							<div class="itemview-dark flex" @dblclick="renamePath = ''"
								@mousedown.stop.right="rightclick_Background()">
								<div v-if="can_GoBack" class="item" style="min-width: 110px;"
									@dblclick="renamePath === '' && go_Back()" @mousedown.stop.right @dragover.prevent
									@drop="drop_on_Parent()">
									<div class="form-vcontainer center">
										<div class="icon-container">
											<svg class="icon-dark"
												style="margin: 0px; min-width: 100px; min-height: 100px; fill: var(--FontColor);"
												viewBox="-200 -200 1424 1424" version="1.1"
												xmlns="http://www.w3.org/2000/svg">
												<path
													d="M398.3 312.8V85.3L0 483.5l398.3 398.3V648.5c284.4 0 483.6 91 625.7 290.2-56.8-284.5-227.5-568.9-625.7-625.9">
												</path>
											</svg>
										</div>
										<div class="title-dark noleftmargin"
											style="min-height: 19px; text-align: center;">返回上一级</div>
									</div>
								</div>
								<template v-for="item, idx in fileList">
									<!-- <div class="select-dark">
										{{item}}
									</div> -->
									<div v-if="item.type === 'folder'" class="item" style="min-width: 110px;"
										@dblclick="renamePath !==''? (renamePath = ''): (selectedPath = item.path)"
										@mousedown.stop.right="rightclick_Item(item)" :draggable="renamePath === ''"
										@dragstart="drag(item)" @dragover.prevent @drop="drop(item)">
										<div class="form-vcontainer center">
											<div class="icon-container">
												<svg class="icon-dark"
													style="margin: 0px; min-width: 100px; min-height: 100px; fill: var(--ThemeColor);"
													viewBox="0 0 1024 1024" version="1.1"
													xmlns="http://www.w3.org/2000/svg">
													<path
														d="M928.426667 354.986667L213.333333 687.786667 102.4 450.56 781.653333 134.826667c20.48-10.24 44.373333 0 52.906667 18.773333l93.866667 201.386667z"
														opacity=".3"></path>
													<path
														d="M459.093333 262.826667l-6.826666-51.2c-1.706667-15.36-13.653333-25.6-29.013334-25.6H114.346667c-15.36 0-29.013333 13.653333-29.013334 29.013333v658.773333c0 15.36 13.653333 29.013333 29.013334 29.013334h795.306666c15.36 0 29.013333-13.653333 29.013334-29.013334V317.44c0-15.36-13.653333-29.013333-29.013334-29.013333H488.106667c-15.36 0-27.306667-10.24-29.013334-25.6z">
													</path>
												</svg>
											</div>

											<input v-if="renamePath === item.path" class="lineedit-dark"
												style="width: 120px; text-align: center;" v-model="name"
												@change="rename(item)" v-focus>
											<div v-else class="title-dark noleftmargin"
												style="min-height: 19px; text-align: center;">
												{{item.name}}
											</div>
										</div>
									</div>
									<div v-else-if="item.type === 'file'" class="item" style="min-width: 110px;"
										@dblclick="renamePath = ''" @mousedown.stop.right="rightclick_Item(item)"
										:draggable="renamePath === ''" @dragstart="drag(item)" @dragover.prevent
										@drop="drop(item)">
										<div class="form-vcontainer center">
											<div class="icon-container" v-html="iconMap[item.filetype]">
											</div>
											<input v-if="renamePath === item.path" class="lineedit-dark"
												style="width: 120px; text-align: center;" v-model="name"
												@change="rename(item)" v-focus>
											<div v-else class="title-dark noleftmargin"
												style="min-height: 19px; text-align: center;">
												{{item.name}}.{{item.filetype}}
											</div>
										</div>
									</div>
								</template>
							</div>
						</div>
					</div>
					<div class="listview-dark">
						<div class="form-container right gap">
							<template>
								<input class="lineedit-dark" style="flex: 1;" placeholder="输入文件名" v-model="saveFileName"
									:style="{'background-color': can_Save? 'var(--ObjectColor)': 'var(--ElementColorRed)'}" />
								<div class="button-dark" style="background-color: var(--ObjectBGColor);">
									<a class="button-text">.{{Input.savetype}}</a>
								</div>
							</template>
							<div class="button-dark" @click="cancel()">
								<a class="button-text">取消</a>
							</div>
							<div class="button-dark" :class="{'inactive': !can_Save}" @click="can_Save && confirm()">
								<svg class="button-icon-svg" viewBox="0 0 115 115" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
									<g transform="translate(-534 -322)">
										<path d="M551 379.832 585.727 409 632 345" stroke-width="9"
											stroke-miterlimit="8" fill="none" fill-rule="evenodd" />
									</g>
								</svg>
								<a class="button-text">确认</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import FileTreeGroup from '../Sun/FileTreeGroup'
	import * as FileSystem from '../Sun/FileSystem'

	export default {
		name: 'PW_FileDialogue',
		components: {
			'filetree-group': FileTreeGroup
		},
		props: {
			PopupSize: {
				type: Object,
				default: () => { return { width: 0, height: 0 } }
			},
			PopupShowHide: {
				type: Boolean,
				default: () => { return false }
			},
			Parent: {
				type: String,
				default: ''
			},
			Input: {
				type: Object,
				default: () => {
					return {
						path: FileSystem.ROOT.name,
						savetype: 'pole',
						savename: '',
						action: 'unknown',
						data: '{}'
					}
				}
			}
		},
		data() {
			return {
				selectedPath: FileSystem.ROOT.name,
				selectedFilePath: '',
				fileList: [],
				showTree: false,
				file: undefined,
				saveFileName: '',
				renamePath: '',
				name: '',
				iconMap: {
					pole: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="0 0 1447 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" ><path d="M598.200767 1011.094488L11.885832 672.584025c-17.568695-10.144043-15.368135-27.873754 4.91995-39.57429l764.166661-441.203241c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.510463c17.568695 10.144043 15.368135 27.873754-4.91995 39.592181l-764.166662 441.18535c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#8F95AB" p-id="7742"></path><path d="M598.200767 952.681261L11.885832 614.170798c-17.568695-10.144043-15.368135-27.873754 4.91995-39.592181l764.166661-441.18535C801.260529 121.65695 831.943127 120.404599 849.529713 130.602314l586.314935 338.45679c17.568695 10.144043 15.368135 27.873754-4.91995 39.57429L666.758036 949.836635c-20.288085 11.718427-50.988575 12.988668-68.557269 2.844626z" fill="#ADB8D0" p-id="7743"></path><path d="M598.200767 890.833015L11.885832 552.322552C-5.682863 542.089056-3.553866 524.448798 16.805782 512.730371L780.972443 71.562912c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626l586.314935 338.492572c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 887.988389c-20.288085 11.700536-50.988575 12.988668-68.557269 2.844626z" fill="#C7CEE2" p-id="7744"></path><path d="M598.200767 828.966878L11.885832 490.456415C-5.682863 480.312372-3.553866 462.600551 16.805782 450.846343L780.972443 9.696775c20.288085-11.718427 50.988575-12.988668 68.55727-2.844626L1435.844648 345.291049c17.568695 10.144043 15.368135 27.855863-4.91995 39.57429L666.758036 826.122252c-20.288085 11.718427-50.988575 12.952887-68.557269 2.844626z" fill="#F5F8FC" p-id="7745"></path><path d="M877.439248 416.156222L544.6896 224.027695l211.951453-122.372579 332.76754 192.128527-211.969345 122.372579z" fill="#D7DEED" p-id="7746"></path><path d="M1230.154949 421.541331l-118.526072-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l118.526073 68.432034a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0zM1166.338723 459.254985l-118.526073-68.432034a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l118.526072 68.432035a14.813523 14.813523 0 0 1 0 25.655303 14.813523 14.813523 0 0 1-14.813522 0zM980.883437 569.300853l-491.995017-284.068978a14.813523 14.813523 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813522 0l491.995018 284.051087a14.831413 14.831413 0 0 1 0 25.673195 14.813523 14.813523 0 0 1-14.813523 0zM462.642722 355.631889l-47.839807-27.641174a14.795632 14.795632 0 0 1 0-25.655304 14.813523 14.813523 0 0 1 14.813523 0l47.839806 27.623284a14.831413 14.831413 0 0 1 0 25.673194 14.885086 14.885086 0 0 1-14.813522 0zM905.527691 610.073822L511.699098 382.611107a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813522 0l393.828594 227.409043a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523 0.071563zM832.730319 654.800641l-491.995017-284.068977a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l491.995017 284.068978a14.831413 14.831413 0 0 1 0 25.673194 14.831413 14.831413 0 0 1-14.813523 0zM658.653537 637.231947L268.92192 412.220262a14.831413 14.831413 0 0 1 0-25.673195 14.813523 14.813523 0 0 1 14.813523 0l389.731616 225.011685a14.831413 14.831413 0 0 1 0 25.673195 14.885086 14.885086 0 0 1-14.813522 0zM722.255074 673.94372l37.248496 21.468874a14.813523 14.813523 0 0 0 14.813523 0 14.813523 14.813523 0 0 0 0-25.655304l-37.266387-21.468874a14.813523 14.813523 0 0 0-14.813522 0 14.813523 14.813523 0 0 0 0.01789 25.655304zM679.87194 737.634712L192.564293 456.303015a14.831413 14.831413 0 0 1 0-25.673194 14.831413 14.831413 0 0 1 14.831414 0L694.685463 712.050971a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813523-0.071563zM1043.500985 467.287922l-64.066697-36.980134a14.831413 14.831413 0 0 1 0-25.673195 14.885086 14.885086 0 0 1 14.813523 0l64.066696 36.998025a14.813523 14.813523 0 0 1 0 25.655304 14.813523 14.813523 0 0 1-14.813522 0z" fill="#C7CEE2" p-id="7747"></path></svg>',
					mainpole: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2574" width="200" height="200"><path d="M841.67168 399.587556c-52.906667-195.128889-241.208889-321.080889-440.888889-294.855112a126.520889 126.520889 0 0 1-70.712889 136.362667 125.44 125.44 0 0 1-149.504-33.109333 404.138667 404.138667 0 0 0-130.275555 297.699555c0 111.274667 44.828444 212.081778 117.191111 285.240889a125.383111 125.383111 0 0 1 143.416889-17.578666c46.705778 25.031111 72.817778 76.8 65.308444 129.422222 197.233778 38.456889 392.476444-74.865778 457.728-265.671111a126.407111 126.407111 0 0 1-79.075555-121.457778 126.293333 126.293333 0 0 1 86.812444-116.053333z m50.517333-5.688889a126.179556 126.179556 0 0 1 114.346667 129.991111 126.122667 126.122667 0 0 1-122.538667 122.197333c-71.623111 221.525333-298.097778 352.995556-524.970666 304.753778a125.724444 125.724444 0 0 1-222.151111 11.548444 126.862222 126.862222 0 0 1 0.455111-130.389333A454.542222 454.542222 0 0 1 0.000569 505.685333 454.769778 454.769778 0 0 1 156.046791 162.133333 126.577778 126.577778 0 0 1 223.517013 11.889778a125.496889 125.496889 0 0 1 157.980445 44.544c231.537778-37.148444 453.063111 109.226667 510.748444 337.464889h-0.056889z m-439.182222 314.026666a201.159111 201.159111 0 0 1-174.364444-101.091555 202.922667 202.922667 0 0 1 0-202.24 201.159111 201.159111 0 0 1 174.364444-101.091556 201.784889 201.784889 0 0 1 201.329778 202.183111 201.784889 201.784889 0 0 1-201.386667 202.24z"></path></svg>',
					component: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z"/></svg>',
					txt: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="-150 -150 1324 1324" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M981.333333 276.053333V981.333333a42.666667 42.666667 0 0 1-42.666666 42.666667H85.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V42.666667a42.666667 42.666667 0 0 1 42.666666-42.666667h619.946667z" fill="#4C98FC" p-id="11324"></path><path d="M705.28 233.386667V0L981.333333 276.053333H747.946667a42.666667 42.666667 0 0 1-42.666667-42.666666z" fill="#A5D1FD" p-id="11325"></path><path d="M167.04 489.386667m26.666667 0l160 0q26.666667 0 26.666666 26.666666l0 0q0 26.666667-26.666666 26.666667l-160 0q-26.666667 0-26.666667-26.666667l0 0q0-26.666667 26.666667-26.666666Z" fill="#FFFFFF" p-id="11326"></path><path d="M300.373333 542.72v229.333333a26.666667 26.666667 0 0 1-26.666666 26.666667 26.666667 26.666667 0 0 1-26.666667-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11327"></path><path d="M653.866667 489.386667m26.666666 0l160 0q26.666667 0 26.666667 26.666666l0 0q0 26.666667-26.666667 26.666667l-160 0q-26.666667 0-26.666666-26.666667l0 0q0-26.666667 26.666666-26.666666Z" fill="#FFFFFF" p-id="11328"></path><path d="M787.2 542.72v229.333333a26.666667 26.666667 0 0 1-26.666667 26.666667 26.666667 26.666667 0 0 1-26.666666-26.666667V542.72h53.333333z" fill="#FFFFFF" p-id="11329"></path><path d="M430.43932 531.537782m18.856181 18.856181l173.476863 173.476863q18.856181 18.856181 0 37.712362l0 0q-18.856181 18.856181-37.712361 0l-173.476864-173.476864q-18.856181-18.856181 0-37.712361l0 0q18.856181-18.856181 37.712362 0Z" fill="#FFFFFF" p-id="11330"></path><path d="M392.650461 742.693177m18.856181-18.856181l173.476864-173.476863q18.856181-18.856181 37.712361 0l0 0q18.856181 18.856181 0 37.712361l-173.476863 173.476864q-18.856181 18.856181-37.712362 0l0 0q-18.856181-18.856181 0-37.712362Z" fill="#FFFFFF" p-id="11331"></path></svg>',
					svg: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="-150 -150 1324 1324" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M661.15 72L860 261.81V952H164V72h497.15M666 0H152a60 60 0 0 0-60 60v904a60 60 0 0 0 60 60h720a60 60 0 0 0 60-60V256.67a60 60 0 0 0-18.57-43.4L707.39 16.6A60 60 0 0 0 666 0z" fill="#959CA7" p-id="3184"></path><path d="M530 284H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72zM896 295H684a36 36 0 0 1-36-36V47a36 36 0 0 1 72 0v176h176a36 36 0 1 1 0 72zM530 416H288a36 36 0 1 1 0-72h242a36 36 0 0 1 0 72z" fill="#959CA7" p-id="3185"></path><path d="M92 555m20 0l582 0q20 0 20 20l0 276q0 20-20 20l-582 0q-20 0-20-20l0-276q0-20 20-20Z" fill="#3C87F7" p-id="3186"></path><path d="M152.27 753.42h38.55q0.83 11.53 10.74 19.35t26.93 7.83q16.33 0 25.25-6.82a21.78 21.78 0 0 0 8.93-18.22q0-9.57-6.93-15t-21.91-8.79l-28.43-6.52a87.11 87.11 0 0 1-19-6.18 61 61 0 0 1-15.32-10.21 42.44 42.44 0 0 1-10.68-15.55 54.84 54.84 0 0 1-3.81-21q0-18 9.65-31.29A58.26 58.26 0 0 1 192 621.19q16.1-6.58 36.37-6.58 31.53 0 51.09 15.74t19.84 41H262a26.18 26.18 0 0 0-9.55-18.43q-8.72-7.5-24.21-7.5-14.53 0-23 6.41t-8.44 17.4q0 16.57 25.68 21.86l28.69 6.44a98.26 98.26 0 0 1 19.77 6.23 67.87 67.87 0 0 1 16 10.08 40.34 40.34 0 0 1 11.34 15.82 58.1 58.1 0 0 1 3.94 22.2q0 27.65-20.26 43.6t-55.38 16a111.57 111.57 0 0 1-29-3.47q-12.88-3.46-21.14-9.15a55.91 55.91 0 0 1-13.8-13.38 52.27 52.27 0 0 1-7.9-15.6 60.32 60.32 0 0 1-2.47-16.44zM313.71 618.5h46.46l40.49 144.77h1.66l39.94-144.77h44.93l-62.27 189.28H376zM495.65 724.3v-23.57q0-39.38 21.78-62.61t60-23.23a92.77 92.77 0 0 1 32.74 5.48q14.63 5.48 23.75 14.63A67.21 67.21 0 0 1 648 655.59a64.73 64.73 0 0 1 5.43 24.06h-39.36q-1.81-14.76-11.88-23.12t-25.35-8.36q-18.76 0-29.87 13.27T535.86 701v23.21q0 24.88 10.07 39.4t31.32 14.52q17.23 0 27.64-9.37a29.89 29.89 0 0 0 10.42-23.15V735h-36.74v-29.83h75.16v37.44a74 74 0 0 1-2.44 18.86 64.82 64.82 0 0 1-8.29 18.44A66.36 66.36 0 0 1 628.52 796q-8.64 6.94-22 11.16a98.57 98.57 0 0 1-29.81 4.23q-20.61 0-36.31-6.52A63.45 63.45 0 0 1 515 786.5a80.64 80.64 0 0 1-14.51-27.5 117 117 0 0 1-4.84-34.7z" fill="#FFFFFF" p-id="3187"></path></svg>',
					stl: '<svg class="icon-dark" style="margin: 0px; min-width: 100px; min-height: 100px;" viewBox="-50 -50 1124 1124" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M156.01854658 328.14285752l-1.28571416 0.64285664v364.5l357.42857168 187.71428584V505.89285752L156.01854658 328.14285752z" fill="#ffffff" p-id="3982"></path><path d="M868.62568994 328.46428584l-356.78571416-187.71428584-342.3214292 180-13.82142832 7.39285752 356.14285752 177.75 4.1785708-1.92857168 353.5714292-174.85714336z m-353.57142832 175.5l-4.17857168 3.21428584z" fill="#f9f28b" p-id="3983"></path><path d="M939.98283242 294.07142832a61.71428584 61.71428584 0 0 0-25.39285664-26.6785708L539.16140411 68.75a58.82142832 58.82142832 0 0 0-54.64285753 0L109.4114041 266.10714248a53.03571416 53.03571416 0 0 0-15.42857168 13.8214292 59.46428584 59.46428584 0 0 0-9.64285664 12.53571416A55.28571416 55.28571416 0 0 0 77.26854658 319.14285752v385.71428496a59.14285752 59.14285752 0 0 0 32.14285753 52.0714292l374.78571415 197.35714248a64.28571416 64.28571416 0 0 0 26.67857168 7.71428584h4.5a61.71428584 61.71428584 0 0 0 22.82142832-6.10714248l374.78571416-198.32142919a59.78571416 59.78571416 0 0 0 32.14285752-52.71428585V319.14285752a57.21428584 57.21428584 0 0 0-5.14285752-25.0714292z m-70.39285664 35.03571416l-353.5714292 174.85714336-4.1785708 2.25v375.10714248L154.08997578 693.28571416V328.78571416l13.82142832-7.39285664 343.92857168-180.64285752 356.78571416 187.71428584z" fill="#e98f36" p-id="3984"></path></svg>'
				}
			}
		},
		computed: {
			get_PathList: function () {
				let paths = this.selectedPath.split('/')
				let ans = paths.map((path, idx, array) => {
					return array.slice(0, idx + 1).join('/')
				})
				return ans
			},
			can_GoBack: function () {
				return FileSystem.ROOT.get(this.selectedPath).parent !== null
			},
			can_Save: function () {
				this.name
				this.file
				if (this.saveFileName === '') return false
				if (this.saveFileName.includes('/')) return false
				return !FileSystem.ROOT.get(this.selectedPath).has_File(this.saveFileName)
			}
		},
		watch: {
			file() {
				this.selectedFilePath = ''
				this.renamePath = ''
				this.name = ''
			},
			selectedPath(newval) {
				this.selectedFilePath = ''
				this.renamePath = ''
				this.name = ''
				this.fileList = FileSystem.ROOT.get(newval).get_ObjectShallow().list
			}
		},
		activated() {
			this.file = FileSystem.ROOT.get_Object()
			this.saveFileName = this.Input.savename || ''
			this.selectedPath = this.Input.path
			this.renamePath = ''
			this.name = ''
			this.fileList = FileSystem.ROOT.get(this.selectedPath).get_ObjectShallow().list
		},
		deactivated() {
		},
		methods: {
			click(item) {
				this.selectedPath = item.path
			},
			go_Back() {
				let parent = FileSystem.ROOT.get(this.selectedPath).parent
				if (parent !== null)
					this.selectedPath = parent.get_AbsolutePath()
			},
			cancel() {
				if (this.Input.action !== undefined) {
					this.$EventBus.$emit(this.Input.action, false, this.Input, {})
				}
				this.$EventBus.$emit('app_close_Popup')
			},
			rightclick_Item(item) {
				if (this.renamePath === '')
					if (item.type === 'folder')
						this.$EventBus.$emit('contextmenu_open', 'filedialogue', ['文件右键菜单 - 文件夹', '-', { text: '重命名文件夹', icon: 'blank', action: 'filedialogue_begin_rename' }, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: 'filedialogue_begin_delete' }], item, event.clientX, event.clientY, 0)
					else if (item.type === 'file')
						this.$EventBus.$emit('contextmenu_open', 'filedialogue', ['文件右键菜单 - 文件', '-', { text: '重命名文件', icon: 'blank', action: 'filedialogue_begin_rename' }, '-', { text: '<a style="color: var(--ElementColorRed);">删除</a>', icon: 'delete', action: 'filedialogue_begin_delete' }], item, event.clientX, event.clientY, 0)
			},
			rightclick_Background() {
				if (this.renamePath === '')
					this.$EventBus.$emit('contextmenu_open', 'filedialogue', ['文件右键菜单', '-', { text: '新建文件夹', icon: '资源管理器', action: 'filedialogue_begin_newfolder' }], {}, event.clientX, event.clientY, 0)
			},
			confirm() {
				// //console.log("save!!!", this.selectedPath + '/' + this.saveFileName + '.' + this.Input.savetype)
				if (this.Input.action === undefined) {
					this.$EventBus.$emit('filesystem_save_File', this.Input.data, this.selectedPath + '/' + this.saveFileName + '.' + this.Input.savetype)
					this.$EventBus.$emit('app_close_Popup')
				}
				else {
					this.$EventBus.$emit(this.Input.action, true, this.Input, { filepath: this.selectedPath + '/' + this.saveFileName + '.' + this.Input.savetype, folderpath: this.selectedPath, name: this.saveFileName, filetype: this.Input.savetype })
					this.$EventBus.$emit('app_close_Popup')
				}
			},
			rename(item) {
				this.$EventBus.$emit('filesystem_rename', item.path, this.name)
				this.file = FileSystem.ROOT.get_Object()
				this.fileList = FileSystem.ROOT.get(this.selectedPath).get_ObjectShallow().list
				this.$forceUpdate()
			},
			new_Folder() {
				this.$EventBus.$emit('filesystem_add_Folder', { path: this.selectedPath })
				this.file = FileSystem.ROOT.get_Object()
				this.fileList = FileSystem.ROOT.get(this.selectedPath).get_ObjectShallow().list
			},
			drag(item) {
				if (this.renamePath === '')
					event.dataTransfer.setData("FileDragData", JSON.stringify({ type: item.type, name: item.name, path: item.path }))
			},
			drop(item) {
				let data = event.dataTransfer.getData("FileDragData")
				if (data !== '') {
					let itemfrom = JSON.parse(data)
					if (itemfrom)
						this.move(itemfrom, item)
				}
			},
			drop_on_Parent() {
				let parent = FileSystem.ROOT.get(this.selectedPath).parent
				let to = { type: 'folder', path: '', name: '' }
				if (parent !== null) {
					to.path = parent.get_AbsolutePath()
					to.name = parent.name
				}
				else return
				let data = event.dataTransfer.getData("FileDragData")
				if (data !== '') {
					let itemfrom = JSON.parse(data)
					if (itemfrom)
						this.move(itemfrom, to)
				}
			},
			move(from, to) {
				// //console.log(from, to)
				if (to.type === 'file') return
				this.$EventBus.$emit('filesystem_move', from.path, to.path)
				this.file = FileSystem.ROOT.get_Object()
				this.selectedPath = FileSystem.ROOT.name
				this.fileList = FileSystem.ROOT.get(this.selectedPath).get_ObjectShallow().list
			}

		},
		mounted() {
			this.$EventBus.$on('filedialogue_begin_rename', (data) => {
				// //console.log(data, path)
				this.renamePath = data.path
				this.name = data.name
			})
			this.$EventBus.$on('filedialogue_begin_newfolder', () => {
				// //console.log("?????????")
				this.new_Folder()
			})
			this.$EventBus.$on('filedialogue_begin_delete', (data) => {
				this.$EventBus.$emit('filesystem_delete', data)
				this.file = FileSystem.ROOT.get_Object()
				this.fileList = FileSystem.ROOT.get(this.selectedPath).get_ObjectShallow().list
				// this.new_Folder()
			})
		},
		beforeDestroy() {
			this.$EventBus.$off('filedialogue_begin_rename')
			this.$EventBus.$off('filedialogue_begin_newfolder')
			this.$EventBus.$off('filedialogue_begin_delete')
		}
	}
</script>
<style scoped>
	.icon-container {
		width: 100px;
		height: 100px;
		display: flex;
		/* margin: 0px 0px 6px 6px; */
		border-radius: var(--ObjectRadius);
		/* background-color: var(--ThemeColor); */
	}

	.item {
		display: flex;
		flex-direction: column;
		font-size: 14px;
		padding: 6px 12px 18px 12px;
		background-color: transparent;
		align-self: flex-start;
		border-radius: var(--ObjectBGRadius);
		border: transparent 4px solid;
		/* margin-bottom: 6px; */
		/* margin-left: 3px;
	margin-right: 3px; */
		width: max-content;
		max-width: 110px;
		align-items: center;
		/* flex: 1; */
		min-width: min-content;
		color: var(--FontColor);
	}

	.item:hover {
		border: var(--ObjectColor) 4px solid;
		background-color: var(--ObjectColor);
	}

	.item.selected {
		background-color: var(--ObjectColor);
		border: var(--ThemeColor) 4px solid;
	}
</style>
