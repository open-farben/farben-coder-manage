import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { rm } from 'node:fs/promises'
import path from 'path';

//https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	const isBuild = command === "build"
	return {
		esbuild: {
			drop: [],
		},
		plugins: [
			vue(),
			vueJsx(),
			{
				name: "Cleaning assets folder",
				async buildStart() {
				  	await rm(path.resolve(__dirname, 'dist/operate'), { recursive: true, force: true });
				}
			}
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			}
		},
		css: {
			preprocessorOptions: {
				less: {
					//modifyVars: generateModifyVars(),
					javascriptEnabled: true,
				},
			},
		},
		base: isBuild ? `/web/` : `/`,
		server: {
			host: '0.0.0.0',
			proxy: {
				'/web/api': {
					//target: 'http://10.18.69.207:8080', //需要代理的域名，目标域名
					target: 'http://10.18.59.146:9080', //需要代理的域名，目标域名
					changeOrigin: true, //需要代理跨域
					rewrite: (path) => path.replace(/^\/web\/api/, ''), //路径重写，把'/api'替换为''
					bypass(req,res,options){
						console.log("请求地址", options.target + req.url)
					}
				},
				'/agent': {
					//target: 'http://10.18.69.207:8080', //需要代理的域名，目标域名
					target: 'http://10.18.59.146:9080', //需要代理的域名，目标域名
					changeOrigin: true, //需要代理跨域
					ws: true,
					bypass(req,res,options){
						console.log("请求地址", options.target + req.url)
					}
				},
			}
		},
		build: {
			outDir: 'dist/operate'
		},
	}
})