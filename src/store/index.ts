import app from './modules/global'
import tagsView from './modules/tagsView'
import { createStore } from 'vuex';
const store = createStore({
	modules: {
		app,
		tagsView,
	}
});
export default store