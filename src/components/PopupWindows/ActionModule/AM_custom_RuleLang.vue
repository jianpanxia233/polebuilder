<template>
	<div :class="{'selectview-dark': true, 'selected': selected}" @click="on_Click()">
		<div class="form-container">
			<div class="form-container icon">
				<svg class="icon-dark large" style="margin-left: 16px;" viewBox="0 0 97 97"
					xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden">
					<g transform="translate(-415 -248)">
						<path
							d="M431 287C431 289.761 428.985 292 426.5 292 424.015 292 422 289.761 422 287 422 284.239 424.015 282 426.5 282 428.985 282 431 284.239 431 287Z"
							fill-rule="evenodd" />
						<path
							d="M450 287C450 289.761 447.761 292 445 292 442.239 292 440 289.761 440 287 440 284.239 442.239 282 445 282 447.761 282 450 284.239 450 287Z"
							fill-rule="evenodd" />
						<path
							d="M468 287C468 289.761 465.985 292 463.5 292 461.015 292 459 289.761 459 287 459 284.239 461.015 282 463.5 282 465.985 282 468 284.239 468 287Z"
							fill-rule="evenodd" />
						<path d="M422 264 450 264 450 273 422 273Z" fill-rule="evenodd" />
						<path d="M459 264 486 264 486 273 459 273Z" fill-rule="evenodd" />
						<path
							d="M431 305.5C431 307.985 428.985 310 426.5 310 424.015 310 422 307.985 422 305.5 422 303.015 424.015 301 426.5 301 428.985 301 431 303.015 431 305.5Z"
							fill-rule="evenodd" />
						<path
							d="M450 305.5C450 307.985 447.761 310 445 310 442.239 310 440 307.985 440 305.5 440 303.015 442.239 301 445 301 447.761 301 450 303.015 450 305.5Z"
							fill-rule="evenodd" />
						<path
							d="M505 305.5C505 307.985 502.985 310 500.5 310 498.015 310 496 307.985 496 305.5 496 303.015 498.015 301 500.5 301 502.985 301 505 303.015 505 305.5Z"
							fill-rule="evenodd" />
						<path d="M459 301 486 301 486 310 459 310Z" fill-rule="evenodd" />
						<path d="M423 319 451 319 451 328 423 328Z" fill-rule="evenodd" />
					</g>
				</svg>
			</div>
			<div class="form-vcontainer sub">
				<div class="form-container left">
					<div class="title-dark left" style="margin-left: 0px;"><a href="http://www.w3school.com.cn"
							target="_blank" style="color: var(--FontColor);">RuleLang</a> 片段
					</div>
					<div class="form-container icon">
						<div v-show="!isValid"
							style="width: 10px; height: 10px; border-radius: 50%; background-color: rgb(255, 76, 76); margin-left: 12px;" />
					</div>
				</div>
				<div class="listview-dark" @click.stop>
					<div class="form-container">
						<textarea class="textarea-dark"
							style="flex: 1; min-height: 140px; font-family: 'consolas'; line-height: 1.2; resize: vertical; tab-size: 2;"
							v-model="SelfString" />
						</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'AM_custom_RuleLang',
		model: {
			prop: 'code',
			event: 'change'
		},
		props: {
			idx: {
				type: Number,
				default: 0
			},
			selected: {
				type: Boolean,
				default: false
			},
			code: {
				type: String,
				default: ''
			},
		},
		data() {
			return {
				SelfString: [],
				isValid: false
			}
		},
		watch: {
			code(newval) {
				this.SelfString = newval
			},
			SelfString(newval) {
				let that = this
				try {
					JSON.parse(newval)
				} catch (error) {
					that.isValid = false
					return
				}
				this.isValid = true
				this.$emit('change', newval)
			}
		},
		methods: {
			on_Click() {
				this.$emit('onClick')
			}
		},
		mounted() {
		}
	}
</script>
<style>
</style>