<template>
	<div class="container" id="Left-Menu">
		<div class="v-box">
			<div class="topbar">
				<panel-switch-bar :Tabs="PanelTabs" :currentTab="'大纲'" :Width="PanelWidth" :Height="PanelHeight" />
			</div>

			<div class="scroll-container flex">

				<div class="listview-dark">

					<div class="form-vcontainer right">

						<div class="form-container left gap">
							<div class="button-dark" @click="includeslots = !includeslots">
								<a class="button-text">{{includeslots? '隐藏插槽':'显示插槽'}}</a>
							</div>
							<div v-show="includeslots" class="button-dark" @click="cut = !cut">
								<a class="button-text">{{cut? '展开':'折叠'}}</a>
							</div>
						</div>
						<!-- <div class="form-container">
							<input class="lineedit-dark" placeholder="筛选组件" style="flex: 1;" />
							<div class="button-dark">
								<svg class="button-icon-svg" viewBox="0 0 115 116" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
									<g transform="translate(-561 -534)">
										<path d="M584 558 653.101 627.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
										<path d="M653.101 557 584 626.101" stroke-width="9" stroke-miterlimit="8"
											fill-rule="evenodd" />
									</g>
								</svg>
							</div>
						</div> -->
					</div>
				</div>

				<!-- <div class="title1-dark">
					大纲视图
				</div> -->
				<div class="treeview-dark" style="flex: 1; padding-bottom: 0px;" @dblclick="cancel_Selection()">
					<ul class="tree-dark">
						<!-- <li class="treeitem-dark">
							<div :class="{'select-dark':true, 'border': true, 'selected': false}"
								style="height: unset; flex: 1; justify-content: flex-start; margin-left: 0px; margin-bottom: 0px;"
								@mousedown.stop.right="contextmenu_Base($event)" @dblclick.stop>
								<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall" overflow="hidden">
									<path
										d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
								</svg>
								<div class="button-text" style="text-align: left;">基座</div>
							</div>
						</li>
						<li v-if="includeslots" class="treeitem-dark">
							<div :class="{'select-dark':true, 'border': true, 'selected': false}"
								style="height: unset; flex: 1; justify-content: flex-start; margin-left: 0px; margin-bottom: 0px;"
								@dblclick.stop>
								<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
									xmlns="http://www.w3.org/2000/svg" p-id="4127"
									xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"
									style="pointer-events: none;">
									<path
										d="M895.5 314.2c11 11.3 16.6 24.7 16.6 40.4 0 15.6-5.6 29.1-16.6 40.4L716.4 573.6l67 67-71.4 71.5c-48.5 48.5-106.5 76.3-173.9 83.2-67.4 7-128.7-8-183.7-44.8L192.8 912H112v-80.8l161.6-161.6c-36.9-55-51.8-116.3-44.8-183.7s34.7-125.3 83.3-173.9l71.4-71.4 67 67 178.6-179c11.3-11 24.8-16.6 40.7-16.6 15.8 0 29.2 5.6 40.2 16.6 11 11 16.6 24.5 16.6 40.4 0 16-5.6 29.4-16.6 40.4L531.2 388.3l104.5 104.5 179.1-178.6c11.3-11 24.8-16.6 40.7-16.6 15.5 0.1 28.9 5.6 40 16.6z"
										p-id="4128"></path>
								</svg>
								<div class="button-text" style="text-align: left;">
									基座插槽</div>
							</div>
						</li> -->
						<li v-for="item in cut_List" class="treeitem-dark"
							:style="{'padding-left': (item.Layer - 1)*30 +'px'}">
							<div v-if="item['Type']=='Module'" class="form-container"
								style="align-items: unset; flex-wrap: nowrap;">
								<div class="form-container"
									:style="{'align-items': 'unset', 'padding-left': '30px', 'background-color': item.tags.includes('ingroup')? 'var(--ThemeColorTransparent)':'var(--ThemeColor)', 'border-radius': '6px'}">
									<div :class="{'select-dark':true, 'border': true, 'selected': item['UID']===ModuleSelected}"
										style="height: unset; flex: 1; justify-content: flex-start; margin-left: 0px; margin-bottom: 0px;"
										@click="childModuleViewClick(item['Name'], item['UID'])"
										@mousedown.stop.right="contextmenu_Module($event, item.UID, item.tags)"
										@dblclick.stop>
										<svg class="button-icon-svg" viewBox="0 0 96 96"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall"
											overflow="hidden">
											<path
												d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
										</svg>
										<div class="button-text" style="text-align: left;">
											{{item.Name + ' '}}<span
												style="color: var(--BarColorTransparent);">{{item.UID}}</span></div>
									</div>
								</div>
								<template v-for="(tag, index) in item.tags">
									<div :class="{'button-dark': true, 'left': index===0&&item.tags.length>1, 'hcenter': index!==0&&index!==item.tags.length-1, 'right': index===item.tags.length-1&&item.tags.length>1}"
										:style="{'margin-left': (index > 0)?'0px':'6px', 'align-content': 'center', 'height': 'auto', 'margin-bottom': '0px'}"
										:title="get_TagTitle(tag, item)">
										<svg v-if="tag === 'link'" class="button-icon-svg" viewBox="-120 -120 1264 1264"
											xmlns="http://www.w3.org/2000/svg">
											<path
												d="M969.586403 624.769747l-129.946199-130.564991c-34.911813-35.071501-77.458713-52.607251-127.401169-52.607251-50.830721 0-94.146121 18.30425-129.946199 55.172242l-54.912749-55.172242c36.568577-36.089513 54.912749-79.74425 54.912749-131.203743 0-50.172008-17.32616-92.678986-51.848733-127.361247L401.885195 53.246004C367.362622 17.795244 324.815721 0 274.484025 0c-49.942456 0-92.229864 17.406004-126.762417 52.098246l-91.850604 91.521247c-35.291072 34.682261-52.996491 77.179259-52.996492 127.351267 0 50.172008 17.455906 92.928499 52.357739 128l129.946199 130.684757c34.901832 35.071501 77.458713 52.617232 127.40117 52.617232 50.830721 0 94.156101-18.30425 129.946198-55.172242l54.912749 55.172242c-36.688343 36.089513-54.912749 79.74425-54.912749 131.203742 0 50.172008 17.32616 92.669006 51.858714 127.361248l128.538947 129.916257c34.522573 35.460741 76.949708 53.246004 127.40117 53.246004 49.942456 0 92.239844-17.406004 126.762417-52.227992l91.850604-91.521248c35.291072-34.692242 52.996491-77.179259 52.996492-127.361247 0.019961-50.042261-17.435945-92.798752-52.347759-128.119766zM460.790146 365.556023c-1.626823-1.337388-5.90846-5.938402-13.453723-13.813021-7.395556-7.575205-12.555478-12.924756-15.519688-15.599532-2.95423-2.525068-7.545263-6.237817-13.753139-10.838831-6.357583-4.601014-12.41575-7.724912-18.473918-9.511423-6.058168-1.77653-12.715166-2.664795-19.961014-2.664795-19.212476 0-35.620429 6.676959-49.223859 20.350253-13.603431 13.513606-20.250448 30.001404-20.250449 49.453412 0 7.28577 1.027992 13.97271 2.664796 20.050838 1.626823 5.938402 4.870487 12.325926 9.45154 18.563743 4.581053 6.237817 8.283821 10.998519 10.788928 13.813021 2.515088 2.824483 7.68499 8.024327 15.529668 15.589552 7.68499 7.575205 12.276023 12.026511 13.743158 13.513606-14.481715 15.010682-31.917661 22.585887-52.17809 22.585887-19.801326 0-36.069552-6.387524-49.223859-19.601715L110.145 315.952904C96.541569 302.429318 89.894551 285.951501 89.894551 266.489513c0-19.012865 6.647018-35.201248 20.250449-48.864562l106.591813-106.3423c14.042573-13.074464 30.300819-19.611696 49.223859-19.611696 19.222456 0 35.630409 6.68694 49.22386 20.350254l149.168655 150.755555c13.59345 13.513606 20.250448 30.001404 20.250448 49.463392-0.009981 20.350253-7.844678 38.165458-23.813489 53.315867z m455.849669 443.334113L809.62882 915.511891c-13.503626 12.824951-29.981442 19.082729-49.423469 19.082729-19.89115 0-36.209279-6.417466-49.42347-19.68156L561.034356 763.708382c-13.663314-13.573489-20.330292-30.12117-20.330292-49.653021 0-20.430097 8.014347-38.325146 24.043041-53.385731 1.626823 1.347368 6.078129 6.118051 13.503626 13.872904 7.425497 7.754854 12.615361 13.124366 15.589551 15.649435 2.964211 2.535049 7.565224 6.257778 13.793061 10.888733 6.387524 4.620975 12.475634 7.904561 18.553762 9.541364 6.088109 1.936218 12.765068 2.684756 20.040858 2.684757 19.29232 0 35.770136-6.716881 49.423469-20.430098 13.653333-13.573489 20.330292-30.12117 20.330293-49.653021 0-7.305731-1.037973-14.012632-2.674776-20.130683-1.626823-5.958363-4.900429-12.375828-9.501442-18.643586-4.601014-6.257778-8.164055-10.888733-10.838831-13.862924-2.525068-2.844444-7.714932-8.054269-15.579571-15.659415-7.714932-7.605146-12.315945-12.076413-13.803041-13.563509 14.541598-15.509708 32.057388-23.414269 52.397661-23.414269 19.29232 0 35.760156 6.716881 49.413489 20.430097l151.384328 152.102924c13.653333 13.563509 20.330292 30.111189 20.330292 49.653022 0.009981 19.082729-6.816686 35.490682-20.470019 48.754775z">
											</path>
										</svg>
										<svg v-else-if="tag === 'linkby'" class="button-icon-svg"
											viewBox="-120 -120 1264 1264" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M969.586403 624.769747l-129.946199-130.564991c-34.911813-35.071501-77.458713-52.607251-127.401169-52.607251-50.830721 0-94.146121 18.30425-129.946199 55.172242l-54.912749-55.172242c36.568577-36.089513 54.912749-79.74425 54.912749-131.203743 0-50.172008-17.32616-92.678986-51.848733-127.361247L401.885195 53.246004C367.362622 17.795244 324.815721 0 274.484025 0c-49.942456 0-92.229864 17.406004-126.762417 52.098246l-91.850604 91.521247c-35.291072 34.682261-52.996491 77.179259-52.996492 127.351267 0 50.172008 17.455906 92.928499 52.357739 128l129.946199 130.684757c34.901832 35.071501 77.458713 52.617232 127.40117 52.617232 50.830721 0 94.156101-18.30425 129.946198-55.172242l54.912749 55.172242c-36.688343 36.089513-54.912749 79.74425-54.912749 131.203742 0 50.172008 17.32616 92.669006 51.858714 127.361248l128.538947 129.916257c34.522573 35.460741 76.949708 53.246004 127.40117 53.246004 49.942456 0 92.239844-17.406004 126.762417-52.227992l91.850604-91.521248c35.291072-34.692242 52.996491-77.179259 52.996492-127.361247 0.019961-50.042261-17.435945-92.798752-52.347759-128.119766zM460.790146 365.556023c-1.626823-1.337388-5.90846-5.938402-13.453723-13.813021-7.395556-7.575205-12.555478-12.924756-15.519688-15.599532-2.95423-2.525068-7.545263-6.237817-13.753139-10.838831-6.357583-4.601014-12.41575-7.724912-18.473918-9.511423-6.058168-1.77653-12.715166-2.664795-19.961014-2.664795-19.212476 0-35.620429 6.676959-49.223859 20.350253-13.603431 13.513606-20.250448 30.001404-20.250449 49.453412 0 7.28577 1.027992 13.97271 2.664796 20.050838 1.626823 5.938402 4.870487 12.325926 9.45154 18.563743 4.581053 6.237817 8.283821 10.998519 10.788928 13.813021 2.515088 2.824483 7.68499 8.024327 15.529668 15.589552 7.68499 7.575205 12.276023 12.026511 13.743158 13.513606-14.481715 15.010682-31.917661 22.585887-52.17809 22.585887-19.801326 0-36.069552-6.387524-49.223859-19.601715L110.145 315.952904C96.541569 302.429318 89.894551 285.951501 89.894551 266.489513c0-19.012865 6.647018-35.201248 20.250449-48.864562l106.591813-106.3423c14.042573-13.074464 30.300819-19.611696 49.223859-19.611696 19.222456 0 35.630409 6.68694 49.22386 20.350254l149.168655 150.755555c13.59345 13.513606 20.250448 30.001404 20.250448 49.463392-0.009981 20.350253-7.844678 38.165458-23.813489 53.315867z m455.849669 443.334113L809.62882 915.511891c-13.503626 12.824951-29.981442 19.082729-49.423469 19.082729-19.89115 0-36.209279-6.417466-49.42347-19.68156L561.034356 763.708382c-13.663314-13.573489-20.330292-30.12117-20.330292-49.653021 0-20.430097 8.014347-38.325146 24.043041-53.385731 1.626823 1.347368 6.078129 6.118051 13.503626 13.872904 7.425497 7.754854 12.615361 13.124366 15.589551 15.649435 2.964211 2.535049 7.565224 6.257778 13.793061 10.888733 6.387524 4.620975 12.475634 7.904561 18.553762 9.541364 6.088109 1.936218 12.765068 2.684756 20.040858 2.684757 19.29232 0 35.770136-6.716881 49.423469-20.430098 13.653333-13.573489 20.330292-30.12117 20.330293-49.653021 0-7.305731-1.037973-14.012632-2.674776-20.130683-1.626823-5.958363-4.900429-12.375828-9.501442-18.643586-4.601014-6.257778-8.164055-10.888733-10.838831-13.862924-2.525068-2.844444-7.714932-8.054269-15.579571-15.659415-7.714932-7.605146-12.315945-12.076413-13.803041-13.563509 14.541598-15.509708 32.057388-23.414269 52.397661-23.414269 19.29232 0 35.760156 6.716881 49.413489 20.430097l151.384328 152.102924c13.653333 13.563509 20.330292 30.111189 20.330292 49.653022 0.009981 19.082729-6.816686 35.490682-20.470019 48.754775z">
											</path>
										</svg>
										<svg v-else-if="tag === 'grouproot'" class="button-icon-svg"
											viewBox="-20 -40 1084 1084" version="1.1" xmlns="http://www.w3.org/2000/svg"
											p-id="5163" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
											<path
												d="M490.666667 716.8h401.066666c25.6 0 46.933333 21.333333 46.933334 51.2v76.8c0 25.6-21.333333 51.2-46.933334 51.2h-401.066666c-25.6 0-46.933333-21.333333-46.933334-51.2v-8.533333H174.933333c-17.066667 0-29.866667-12.8-29.866666-29.866667V307.2h-12.8C106.666667 307.2 85.333333 281.6 85.333333 256V179.2C85.333333 149.333333 106.666667 128 132.266667 128H213.333333c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2h-12.8v179.2h238.933334v-8.533333c0-25.6 21.333333-51.2 46.933333-51.2h401.066667c25.6 0 46.933333 21.333333 46.933333 51.2V554.666667c0 25.6-21.333333 51.2-46.933333 51.2h-401.066667c-25.6 0-46.933333-21.333333-46.933333-51.2v-8.533334H200.533333v234.666667h238.933334V768c0-25.6 21.333333-51.2 51.2-51.2z m401.066666-409.6H366.933333c-29.866667 0-51.2-25.6-51.2-51.2V179.2c0-29.866667 21.333333-51.2 51.2-51.2h524.8c25.6 0 46.933333 21.333333 46.933334 51.2V256c0 25.6-21.333333 51.2-46.933334 51.2z">
											</path>
										</svg>
										<svg v-else-if="tag === 'ingroup'" class="button-icon-svg"
											viewBox="-130 -130 1284 1284" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M860.069521 429.487623h-73.242947v-170.422692C786.826574 116.337371 670.888872 0.272064 528.240764 0.272064c-142.650515 0-258.720638 116.065307-258.720638 258.792867v170.422692H196.339779c-35.281619 0-63.879618 28.612445-63.879618 63.91814v466.606275c0 35.368294 28.597999 63.983146 63.879618 63.983147h663.79234c35.29125 0 63.821834-28.614852 63.821835-63.983147V493.405763c-0.004815-35.310511-28.590776-63.91814-63.884433-63.91814zM564.114664 738.867504v101.889098c0 4.552855-3.765556 8.388233-8.385825 8.388233h-54.91355c-4.678053 0-8.446016-3.837785-8.446017-8.388233v-101.889098c-25.800316-13.201114-43.672259-39.665939-43.672259-70.68362 0-43.888947 35.613874-79.584681 79.481153-79.584682 43.932285 0 79.548567 35.695734 79.548566 79.584682 0.062599 31.020089-17.811752 57.482507-43.612068 70.68362z m123.476036-309.379881H368.883605v-166.202091c0-87.912723 71.55278-159.501618 159.417351-159.501618s159.287337 71.588895 159.287337 159.501618l0.002407 166.202091z">
											</path>
										</svg>
										<!-- <svg class="button-icon-svg" viewBox="0 0 114 114"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
											<g transform="translate(-252 -261)">
												<path
													d="M340.25 288.833 322.542 288.833 322.542 283.625C322.542 279.563 319.313 276.333 315.25 276.333L302.75 276.333C298.688 276.333 295.458 279.563 295.458 283.625L295.458 288.833 277.75 288.833C275.458 288.833 273.583 290.708 273.583 293L273.583 297.167 344.417 297.167 344.417 293C344.417 290.708 342.542 288.833 340.25 288.833ZM301.708 283.625C301.708 283 302.125 282.583 302.75 282.583L315.25 282.583C315.875 282.583 316.292 283 316.292 283.625L316.292 288.833 301.708 288.833 301.708 283.625Z" />
												<path
													d="M279.833 355.5C279.833 357.792 281.708 359.667 284 359.667L334 359.667C336.292 359.667 338.167 357.792 338.167 355.5L338.167 301.333 279.833 301.333 279.833 355.5ZM322.542 307.583 328.792 307.583 328.792 353.417 322.542 353.417 322.542 307.583ZM305.875 307.583 312.125 307.583 312.125 353.417 305.875 353.417 305.875 307.583ZM289.208 307.583 295.458 307.583 295.458 353.417 289.208 353.417 289.208 307.583Z" />
											</g>
										</svg> -->
									</div>
								</template>
							</div>
							<div v-else-if="item['Type']=='Slot'" class="form-container" style="align-items: unset;">
								<div class="form-container"
									style="align-items: unset; padding-left: 30px; background-color: var(--ScrollColor); border-radius: 6px;">
									<div :class="{'select-dark':true, 'border': true, 'selected': item.UID === ModuleSelected }"
										style="height: unset; flex: 1; justify-content: flex-start; margin-left: 0px; margin-bottom: 0px;"
										@click="childSlotViewClick(item['Name'], item['UID'])"
										@mousedown.stop.right="contextmenu_Slot($event, item.UID)" @dblclick.stop>
										<svg class="button-icon-svg" viewBox="0 0 1024 1024" version="1.1"
											xmlns="http://www.w3.org/2000/svg" p-id="4127"
											xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"
											style="pointer-events: none;">
											<path
												d="M895.5 314.2c11 11.3 16.6 24.7 16.6 40.4 0 15.6-5.6 29.1-16.6 40.4L716.4 573.6l67 67-71.4 71.5c-48.5 48.5-106.5 76.3-173.9 83.2-67.4 7-128.7-8-183.7-44.8L192.8 912H112v-80.8l161.6-161.6c-36.9-55-51.8-116.3-44.8-183.7s34.7-125.3 83.3-173.9l71.4-71.4 67 67 178.6-179c11.3-11 24.8-16.6 40.7-16.6 15.8 0 29.2 5.6 40.2 16.6 11 11 16.6 24.5 16.6 40.4 0 16-5.6 29.4-16.6 40.4L531.2 388.3l104.5 104.5 179.1-178.6c11.3-11 24.8-16.6 40.7-16.6 15.5 0.1 28.9 5.6 40 16.6z"
												p-id="4128"></path>
										</svg>
										<div class="button-text" style="text-align: left;">
											{{item.Name + ' '}}<span
												style="color: var(--BarColorTransparent);">{{item.UID}}</span>
										</div>
									</div>
								</div>
								<template v-for="(tag, index) in item.tags">
									<div :class="{'button-dark': true, 'left': index===0&&item.tags.length>1, 'hcenter': index!==0&&index!==item.tags.length-1, 'right': index===item.tags.length-1&&item.tags.length>1}"
										:style="{'margin-left': (index > 0)?'0px':'6px', 'align-content': 'center', 'height': 'auto', 'margin-bottom': '0px'}"
										:title="get_TagTitle(tag, item)">
										<svg v-if="tag === 'linkedby'" class="button-icon-svg"
											viewBox="-120 -120 1264 1264" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M969.586403 624.769747l-129.946199-130.564991c-34.911813-35.071501-77.458713-52.607251-127.401169-52.607251-50.830721 0-94.146121 18.30425-129.946199 55.172242l-54.912749-55.172242c36.568577-36.089513 54.912749-79.74425 54.912749-131.203743 0-50.172008-17.32616-92.678986-51.848733-127.361247L401.885195 53.246004C367.362622 17.795244 324.815721 0 274.484025 0c-49.942456 0-92.229864 17.406004-126.762417 52.098246l-91.850604 91.521247c-35.291072 34.682261-52.996491 77.179259-52.996492 127.351267 0 50.172008 17.455906 92.928499 52.357739 128l129.946199 130.684757c34.901832 35.071501 77.458713 52.617232 127.40117 52.617232 50.830721 0 94.156101-18.30425 129.946198-55.172242l54.912749 55.172242c-36.688343 36.089513-54.912749 79.74425-54.912749 131.203742 0 50.172008 17.32616 92.669006 51.858714 127.361248l128.538947 129.916257c34.522573 35.460741 76.949708 53.246004 127.40117 53.246004 49.942456 0 92.239844-17.406004 126.762417-52.227992l91.850604-91.521248c35.291072-34.692242 52.996491-77.179259 52.996492-127.361247 0.019961-50.042261-17.435945-92.798752-52.347759-128.119766zM460.790146 365.556023c-1.626823-1.337388-5.90846-5.938402-13.453723-13.813021-7.395556-7.575205-12.555478-12.924756-15.519688-15.599532-2.95423-2.525068-7.545263-6.237817-13.753139-10.838831-6.357583-4.601014-12.41575-7.724912-18.473918-9.511423-6.058168-1.77653-12.715166-2.664795-19.961014-2.664795-19.212476 0-35.620429 6.676959-49.223859 20.350253-13.603431 13.513606-20.250448 30.001404-20.250449 49.453412 0 7.28577 1.027992 13.97271 2.664796 20.050838 1.626823 5.938402 4.870487 12.325926 9.45154 18.563743 4.581053 6.237817 8.283821 10.998519 10.788928 13.813021 2.515088 2.824483 7.68499 8.024327 15.529668 15.589552 7.68499 7.575205 12.276023 12.026511 13.743158 13.513606-14.481715 15.010682-31.917661 22.585887-52.17809 22.585887-19.801326 0-36.069552-6.387524-49.223859-19.601715L110.145 315.952904C96.541569 302.429318 89.894551 285.951501 89.894551 266.489513c0-19.012865 6.647018-35.201248 20.250449-48.864562l106.591813-106.3423c14.042573-13.074464 30.300819-19.611696 49.223859-19.611696 19.222456 0 35.630409 6.68694 49.22386 20.350254l149.168655 150.755555c13.59345 13.513606 20.250448 30.001404 20.250448 49.463392-0.009981 20.350253-7.844678 38.165458-23.813489 53.315867z m455.849669 443.334113L809.62882 915.511891c-13.503626 12.824951-29.981442 19.082729-49.423469 19.082729-19.89115 0-36.209279-6.417466-49.42347-19.68156L561.034356 763.708382c-13.663314-13.573489-20.330292-30.12117-20.330292-49.653021 0-20.430097 8.014347-38.325146 24.043041-53.385731 1.626823 1.347368 6.078129 6.118051 13.503626 13.872904 7.425497 7.754854 12.615361 13.124366 15.589551 15.649435 2.964211 2.535049 7.565224 6.257778 13.793061 10.888733 6.387524 4.620975 12.475634 7.904561 18.553762 9.541364 6.088109 1.936218 12.765068 2.684756 20.040858 2.684757 19.29232 0 35.770136-6.716881 49.423469-20.430098 13.653333-13.573489 20.330292-30.12117 20.330293-49.653021 0-7.305731-1.037973-14.012632-2.674776-20.130683-1.626823-5.958363-4.900429-12.375828-9.501442-18.643586-4.601014-6.257778-8.164055-10.888733-10.838831-13.862924-2.525068-2.844444-7.714932-8.054269-15.579571-15.659415-7.714932-7.605146-12.315945-12.076413-13.803041-13.563509 14.541598-15.509708 32.057388-23.414269 52.397661-23.414269 19.29232 0 35.760156 6.716881 49.413489 20.430097l151.384328 152.102924c13.653333 13.563509 20.330292 30.111189 20.330292 49.653022 0.009981 19.082729-6.816686 35.490682-20.470019 48.754775z">
											</path>
										</svg>

										<!-- <svg class="button-icon-svg" viewBox="0 0 114 114"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
											<g transform="translate(-252 -261)">
												<path
													d="M340.25 288.833 322.542 288.833 322.542 283.625C322.542 279.563 319.313 276.333 315.25 276.333L302.75 276.333C298.688 276.333 295.458 279.563 295.458 283.625L295.458 288.833 277.75 288.833C275.458 288.833 273.583 290.708 273.583 293L273.583 297.167 344.417 297.167 344.417 293C344.417 290.708 342.542 288.833 340.25 288.833ZM301.708 283.625C301.708 283 302.125 282.583 302.75 282.583L315.25 282.583C315.875 282.583 316.292 283 316.292 283.625L316.292 288.833 301.708 288.833 301.708 283.625Z" />
												<path
													d="M279.833 355.5C279.833 357.792 281.708 359.667 284 359.667L334 359.667C336.292 359.667 338.167 357.792 338.167 355.5L338.167 301.333 279.833 301.333 279.833 355.5ZM322.542 307.583 328.792 307.583 328.792 353.417 322.542 353.417 322.542 307.583ZM305.875 307.583 312.125 307.583 312.125 353.417 305.875 353.417 305.875 307.583ZM289.208 307.583 295.458 307.583 295.458 353.417 289.208 353.417 289.208 307.583Z" />
											</g>
										</svg> -->
									</div>
								</template>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import PanelSwitchBar from './Sun/PanelSwitchBar'
	import FileTreeGroup from './Sun/FileTreeGroup'

	export default {
		name: 'Outliner',
		components: {
			'panel-switch-bar': PanelSwitchBar,
			'filetree-group': FileTreeGroup
		},
		props: {
			LeftMenuType: {
				type: String,
				default: 'Current'
			},
			ModuleSelected: {

			},
			show: {
				type: Boolean,
				default: false
			},
			PanelTabs: {
				type: Array,
				default: () => {
					return [{ name: '大纲', panelid: 'OutlinerPanel' }]
				}
			},
			PanelWidth: {
				type: Number,
				default: 100
			},
			PanelHeight: {
				type: Number,
				default: 100
			}
		},
		data() {
			return {
				moduleStylesList: new Array(),


				selectedClass: '',
				// componectdata: comsDataManager.Manager.loadResources(),
				classList: [],
				classObj: {},
				showList: [],
				cut: true,
				includeslots: true,
				// currentPage: 0,
				// maxPageCount: 1,
				// maxItemCount: 8,
			}
		},
		computed: {
			cut_List: function () {
				if (this.cut)
					return this.moduleStylesList.filter((item, index, array) => {
						if (item.Type === 'Slot') {
							if (!this.includeslots) {
								return false
							}
							if (item.tags.length > 0) {
								return true
							}
							if (array[index + 1] === undefined) {
								return false
							}
							if (array[index + 1].Type === 'Slot') {
								return false
							}
							if (array[index + 1].Type === 'Module' && array[index + 1].Layer <= item.Layer) {
								return false
							}
						}
						else {
							// if (item.tags.includes('ingroup')) {
							// 	return false
							// }
						}
						return true
					})
				else return this.moduleStylesList.filter((item, index, array) => {
					if (item.Type === 'Slot') {
						if (!this.includeslots) {
							return false
						}
					}
					return true
				})
			}
		},
		watch: {
		},
		methods: {
			childModuleViewClick: function (modulename, moduleuid) {
				this.$EventBus.$emit('display_select_Module', moduleuid)
			},
			childSlotViewClick: function (modulename, slotuid) {
				this.$EventBus.$emit('display_select_Slot', slotuid)
			},
			cancel_Selection: function () {
				// //console.log(">>>>>")
				// this.$EventBus.$emit('display_select_Module', BigInt(-1), 'deselect')
			},
			contextmenu_Base(event) {
				event.preventDefault()
				// if (this.LeftMenuType === 'Library') {
				// 	this.$EventBus.$emit('contextmenu_open', 'outliner', ['大纲右键菜单 - 组装树', '-', { text: '转换为父级组装树', icon: '大纲', action: 'display_convertTo_LocalTree' }, '-', { text: '删除组装树', icon: 'delete', action: 'display_delete_Tree', description: '删除整棵组装树，清空场景' }], '', event.clientX, event.clientY)
				// }
				// this.$EventBus.$emit('contextmenu_open', 'outliner', ['大纲右键菜单', '-', { text: '删除', icon: 'delete', action: 'delete_Module' }, '-', { text: '断开所有驱动链接', icon: 'blank', action: 'delete_Module' }, { text: '断开所有驱动链sdfghfddreefrrvgrtgtrtg接引用', icon: 'blank', action: 'delete_Module', description: '断开所有以该组件的插槽为驱动的引用' }, '-', { text: '转换为父级组装树', icon: '大纲', action: 'delete_Module' }, '-', { text: '属性', icon: '控制台', action: 'delete_Module' }], slotuid, event.clientX, event.clientY, 0)
				return false
			},
			contextmenu_Slot(event, slotuid) {
				event.preventDefault()
				// this.$EventBus.$emit('contextmenu_open', 'outliner', ['大纲右键菜单', '-', { text: '删除', icon: 'delete', action: 'delete_Module' }, '-', { text: '断开所有驱动链接', icon: 'blank', action: 'delete_Module' }, { text: '断开所有驱动链sdfghfddreefrrvgrtgtrtg接引用', icon: 'blank', action: 'delete_Module', description: '断开所有以该组件的插槽为驱动的引用' }, '-', { text: '转换为父级组装树', icon: '大纲', action: 'delete_Module' }, '-', { text: '属性', icon: '控制台', action: 'delete_Module' }], slotuid, event.clientX, event.clientY, 0)
				return false
			},
			contextmenu_Module(event, moduleuid) {
				event.preventDefault()
				// this.$EventBus.$emit('contextmenu_open', 'outliner', ['大纲右键菜单 - 组件', '-', { text: '删除', icon: 'delete', action: 'leftmenu_delete_Module' }/* , '-', { text: '断开所有驱动链接', icon: 'blank', action: 'delete_Module' }, '-', { text: '属性', icon: '控制台', action: 'delete_Module' } */], moduleuid, event.clientX, event.clientY)
				return false
			},
			get_TagTitle(tag, item) {
				switch (tag) {
					case 'ingroup':
						return '复合组件子组件，GID:' + item.GroupID
					case 'grouproot':
						return '复合组件根组件，GID:' + item.GroupID
					case 'link':
						return '被驱动'
					case 'linkedby':
						return '驱动自'
					default:
						return '错误 Error'
				}
			}
		},
		mounted() {
			this.$EventBus.$on("display_TreeData_changed", (nameuidlist, moduletree) => {
				this.moduleStylesList = moduletree
			})
		},
		beforeDestroy() {
			this.$EventBus.$off('display_TreeData_changed')
		}
	}
</script>
<style scoped>

</style>
