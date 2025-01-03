import store from '@/store'
 
const hasPermi = (el, binding) => {
	const {value} = binding;
	const allPermission = "*:*:*";
  	const permissions = store.getters && store.getters.permissions
 
	if (value && value instanceof Array && value.length > 0) {
		const hasPermission = permissions.some(permission => {
			return allPermission === permission || value.includes(permission)
		})
		if (!hasPermission) {
			//console.log(el)
      		el.remove()
		}
	} else {
		throw new Error('请设置操作权限标签值')
	}
}
 
export default hasPermi;