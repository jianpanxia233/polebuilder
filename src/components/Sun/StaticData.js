// create a $static area in vue
// you can use this.$static in .vue file to get access to it
// this is aimed to escape from vue's reactivity
// the data is different in different vue component so like data() use static() {return {}}

export default {
	beforeCreate() {
		const vue_static = this.$options.static

		if (vue_static && typeof (vue_static) === 'function') {
			let data = vue_static.apply(this)
			this.$static = {}
			Object.assign(this.$static, data)
		}
		else {
			throw new Error('static is undefined ot not a function')
		}
	}
}