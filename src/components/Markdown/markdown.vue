<template>
	<div class="htmledit_views">
		<template v-for="(el, index) in codeLists" :key="index">
			<div v-if="!el.isCode" v-html="el.markdown"></div>
			<template v-else>
				<slot name="code" :data="el"></slot>
				<pre class="set-code-show">
					<div class="code-bnt">
						<span>{{el.codeLang}}</span>
						<span @click="copy(el.content)">复制</span>
					</div>
					<code v-html="el.markdown"></code>
				</pre>
			</template>
		</template>
	</div>
</template>

<script lang="ts" setup name="markdown">
	import { onMounted, watchEffect, watch, defineComponent, ref } from 'vue'
	import {marked} from 'marked';
	import hljs from 'highlight.js'
	import 'highlight.js/styles/base16/material.css'
	import useClipboard from 'vue-clipboard3'
	import { message } from 'ant-design-vue'
	
	const props = defineProps({
		code: {
			type: String,
		},
	});
	const html = ref("");
		const codeLists = ref([])
		
		const getLines = (text) => {
		    if (text.length === 0) return [];
		    return text.split(/\r\n|\r|\n/g);
		}
		
		const Renderer = new marked.Renderer();
		Renderer.code = function(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		    //使代码转换成带有标签的节点
		    const textHtml = hljs.highlight(code, { language }).value;
		    //返回分割后的数组
		    const lines = getLines(textHtml);
		    //添加自定义行号
		    let html = lines.map((item, index) => {
		    	return `<li>
		    		<div class="hljs-ln-numbers"><div class="hljs-ln-line hljs-ln-n" data-line-number="${index}">${index + 1}</div></div>
		    		<div class="hljs-ln-code"><div class="hljs-ln-line">${item}</div></div>
		    	</li>`
		    }).join('')
		    html = `<ol class="hljs-ln">${html}</ol>`
		    return html;
		}
		
		watchEffect(() => {
			let input = props.code;
			input = input + ((input.match(/```/g) && (input.match(/```/g).length % 2)) ? '\n```' : '')
			let mdList:any = [];
			//拆分code 与 正文
			const codeList = input.match(/(((?!```).\s*)+)|```(((?!```).\s*)+)```/g);
			if (Array.isArray(codeList)) {
				mdList = codeList.map(item => {
					const isCode = item.startsWith("```");
					const markdown = marked(item, {renderer:Renderer});
					return {
						isCode,
						content: item,
						codeContent: item.match(/```[^\n]+[\n]+([\s\S]*)```/) ? item.match(/```[^\n]+[\n]+([\s\S]*)```/)[1] : '',
						codeLang: item.match(/```([^\n]+)\n/) ? item.match(/```([^\n]+)\n/)[1] : '',
						markdown,
					}
				})
			}
			codeLists.value = mdList
		})
		
		//复制
		const { toClipboard } = useClipboard()
		const copy = (e) => {
			toClipboard(e).then((msg) => {
				message.success('复制成功')
			}).catch((err) => {
				message.error('复制失败' + err)
			})
		}
</script>

