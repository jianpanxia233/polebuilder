<template>
	<div class="toolbar">
		<!-- <div :class="{'button-round': true, 'selected': currentPage==='map'}" @click="change_Page('map')">
			<svg class="button-icon-svg" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
				<g transform="translate(-847 -478)">
					<path
						d="M906 531C909.6 531 912 533.6 912 537.5 912 541.4 909.6 544 906 544 902.4 544 900 541.4 900 537.5 900 533.6 902.4 531 906 531Z"
						fill-rule="evenodd" />
					<path
						d="M906 494C929.748 494 949 513.476 949 537.5 949 561.524 929.748 581 906 581 882.252 581 863 561.524 863 537.5 863 513.476 882.252 494 906 494ZM930.555 512.66 895.542 527.472 881.219 562.569 916.232 548.079 930.555 512.66Z"
						fill-rule="evenodd" />
				</g>
			</svg>
			<a class="button-text">地图</a>
		</div> -->
		<div :class="{'button-round': true, 'selected': currentPage==='build'}" @click="change_Page('build')">
			<svg class="button-icon-svg" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
				<g transform="translate(-591 -311)">
					<path
						d="M665 359C663.3 359 662 357.7 662 356 662 354.3 663.3 353 665 353 666.7 353 668 354.3 668 356 668 357.7 666.7 359 665 359ZM659 365C657.3 365 656 363.7 656 362 656 360.3 657.3 359 659 359 660.7 359 662 360.3 662 362 662 363.7 660.7 365 659 365ZM653 359C651.3 359 650 357.7 650 356 650 354.3 651.3 353 653 353 654.7 353 656 354.3 656 356 656 357.7 654.7 359 653 359ZM659 347C660.7 347 662 348.3 662 350 662 351.7 660.7 353 659 353 657.3 353 656 351.7 656 350 656 348.3 657.3 347 659 347ZM627 358 623 358 623 362C623 363.1 622.1 364 621 364 619.9 364 619 363.1 619 362L619 358 615 358C613.9 358 613 357.1 613 356 613 354.9 613.9 354 615 354L619 354 619 350C619 348.9 619.9 348 621 348 622.1 348 623 348.9 623 350L623 354 627 354C628.1 354 629 354.9 629 356 629 357.1 628.1 358 627 358ZM663 332C651.2 332 657.2 338 640 338 622.8 338 628.8 332 617 332 604.4 332 588.4 388 605 388 620.3 388 614.5 374 640 374 665.5 374 659.7 388 675 388 691.6 388 675.6 332 663 332Z" />
				</g>
			</svg>
			<a class="button-text">编辑器</a>
		</div>
		<div :class="{'button-round': true, 'selected': currentPage==='display'}" @click="change_Page('display')">
			<svg class="button-icon-svg" viewBox="0 0 98 98" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
				<g transform="translate(-591 -311)">
					<path
						d="M640 385C630 385 622 377 622 367 622 357 630 349 640 349 650 349 658 357 658 367 658 377 650 385 640 385ZM620 353 608 353 608 345 620 345 620 353ZM676 337 656 337 650 327 630 327 624 337 604 337C601.8 337 600 338.8 600 341L600 389C600 391.2 601.8 393 604 393L676 393C678.2 393 680 391.2 680 389L680 341C680 338.8 678.2 337 676 337Z" />
					<path
						d="M640 357C634.4 357 630 361.4 630 367 630 372.6 634.4 377 640 377 645.6 377 650 372.6 650 367 650 361.4 645.6 357 640 357ZM640 381C632.2 381 626 374.8 626 367 626 359.2 632.2 353 640 353 647.8 353 654 359.2 654 367 654 374.8 647.8 381 640 381Z" />
				</g>
			</svg>
			<a class="button-text">呈现</a>
		</div>
		<div :class="{'button-round': true, 'selected': currentPage==='engineeringdisplay'}" @click="change_Page('engineeringdisplay')">
			<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_Box" overflow="hidden">
				<g>
					<path d="M30 19.5 15 28.6 48 48.6 63 39.5Z" />
					<path d="M81 28.6 48 8.6 33.8 17.2 66.8 37.2Z" />
					<path d="M15 36.6 15 68.6 46 87.4 46 52.1 15 33.3Z" />
					<path d="M61 57.6 54 61.6 54 54.6 61 50.6 61 57.6ZM50 52.1 50 87.4 81 68.6 81 33.3 50 52.1Z" />
				</g>
			</svg>
			<a class="button-text">工程演示</a>
		</div>
		<div class="button-round" @click="openDisplaytest()">
				<img class="button-icon" src="../assets/img/Ball.svg" draggable="false" />
					<a class="button-text">合箱</a>
		</div>
		<!-- <div :class="{'button-round': true, 'selected': currentPage==='import'}" @click="change_Page('import')">
			<svg class="button-icon-svg" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" id="Icons_BeachBall" overflow="hidden">
				<path
					d="M60.1 77.6C62 71 63 64.1 63 57 63 52.5 62.6 48.1 61.8 43.8 64.9 43.1 67.3 40.6 67.9 37.5 71.8 38.5 75.6 39.6 79.2 41 79.7 43.3 80 45.6 80 48.1 80 61.3 71.8 72.8 60.1 77.6ZM18.3 36.1C25.3 34.7 32.6 34 40 34 44.1 34 48.1 34.2 52.1 34.7 52 35.1 52 35.5 52 36 52 38.4 53.1 40.6 54.8 42 45.9 52.5 35.7 61.7 24.4 69.5 19.2 63.8 16 56.3 16 48 16 43.8 16.8 39.8 18.3 36.1ZM60 40C57.8 40 56 38.2 56 36 56 33.8 57.8 32 60 32 62.2 32 64 33.8 64 36 64 38.2 62.2 40 60 40ZM71.3 26.1C69.4 27.5 67.6 29 65.8 30.5 64.3 29 62.3 28 60 28 59.1 28 58.2 28.2 57.4 28.4 55.6 24.1 53.5 20 51 16.1 59 16.9 66.1 20.6 71.3 26.1ZM48 10C27 10 10 27 10 48 10 69 27 86 48 86 69 86 86 69 86 48 86 27 69 10 48 10Z" />
			</svg>
			<a class="button-text">组件导入</a>
		</div> -->
		<slot name="topmenu"></slot>
		<div class="filler" />
		<div class="button-round" @click="click_Popup('pw-setting', 'app', '设置', 700, 600, true, true, true)">
			<svg class="button-icon-svg" viewBox="0 0 97 98" xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
				<g transform="translate(-424 -241)">
					<path
						d="M472.941 304.118C465.188 304.118 458.844 297.765 458.844 290 458.844 282.235 465.188 275.882 472.941 275.882 480.695 275.882 487.038 282.235 487.038 290 487.038 297.765 480.695 304.118 472.941 304.118ZM504.659 281.177C503.955 278.588 502.897 276.118 501.605 273.882L504.542 265.059 497.846 258.353 489.035 261.294C486.686 260 484.219 258.941 481.634 258.235L477.64 250 468.242 250 464.131 258.235C461.546 258.941 459.079 260 456.847 261.294L448.037 258.353 441.341 265.059 444.278 273.882C442.985 276.235 441.928 278.706 441.223 281.294L433 285.294 433 294.706 441.223 298.824C441.928 301.412 442.985 303.882 444.278 306.118L441.341 314.941 448.037 321.647 456.847 318.706C459.197 320 461.664 321.059 464.248 321.765L468.36 330 477.758 330 481.869 321.765C484.454 321.059 486.921 320 489.153 318.706L497.963 321.647 504.659 314.941 501.723 306.118C503.015 303.765 504.072 301.294 504.777 298.706L513 294.588 513 285.177 504.659 281.177Z"
						fill-rule="evenodd" />
				</g>
			</svg>
		</div>

		<!-- <div :class="{'button-round': true, 'selected': page==='map'">
      <img class="button-icon" src="../assets/img/More.svg" draggable="false"/>
    </div> -->
	</div>
</template>
<script>
	export default {
		name: 'TopBar',
		props: {
			currentPage: {
				type: String,
				default: 'build'
			}
		},
		data() {
			return {
			}
		},
		methods: {
			change_Page(page) {
				this.page = page
				this.$EventBus.$emit('app_change_Page', page)
			},
			click_Popup(popup, parent, title, width, height, center, resizeable, exculsive) {
				this.$EventBus.$emit('app_open_Popup', popup, parent, title, width, height, center, resizeable, exculsive)
			},
			openDisplaytest() {
				this.$EventBus.$emit('app_open_Popup', 'pw-poleboxdisplay', 'box', '杆箱呈现:'+"合箱", 1200, 800, true, true, true, { poleid: 100 })
			},
		}
	}
</script>
<style scoped>
</style>