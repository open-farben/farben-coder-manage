import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
import {constantRouterMap} from '@/config/router.config'

const router = createRouter({
	history: createWebHistory('/web/'),
	routes: constantRouterMap as unknown as RouteRecordRaw[],
});

export default router;