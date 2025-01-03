import hasPermi from "./hasPermi"
import hasRole from "./hasRole"
 
function directive(app:any) {
	app.directive('hasPermi', hasPermi)
	app.directive('hasRole', hasRole)
}
 
export default directive;