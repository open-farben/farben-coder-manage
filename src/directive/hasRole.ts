import store from '@/store'
 
const hasRole = (el, binding) => {
	const {value} = binding;
	const superAdmin = 'admin'
  	const roles = store.getters && store.getters.roles
 
	if (value && value instanceof Array && value.length > 0) {
    	const roleFlag = value

		const hasRole = roles.some(role => {
			return superAdmin === role || roleFlag.includes(role)
		})
		if (!hasRole) {
			//console.log(el)
      		el.remove()
		}
	} else {
		throw new Error('请设置操作权限标签值')
	}
}
 
export default hasRole;

