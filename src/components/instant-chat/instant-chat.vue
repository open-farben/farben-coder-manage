<template>
	<div class="chat-body">
		<div class="flex-grow" ref="scrollbarRef" @scroll="handleScroll">
			<div ref="innerRef">
				<template v-for="(item, index) in state.dialogs" :key="index">
					<div class="flex mt10" v-if="item.question">
						<span class="prompt-label">
							<slot name="questionIcon">问</slot>
						</span>
						<div class="ml20">{{ item.question }}</div>
					</div>
					<div class="flex mt10 mb10">
						<div class="flex flex-start">
							<span class="prompt-label">
								<slot name="answerIcon">答</slot>
							</span>
						</div>
						<div class="bubble">
							<template v-if="item.type !== 'tips'">
								<slot name="answerHeader"></slot>
								<hr v-if="slotHeader">
							</template>
							<Markdown :code="item.answerContent || '正在思考。。。'"></Markdown>
						</div>
					</div>
					<div class="dialog-action" v-show="!item.isAnswering">
						<slot name="answerEnder" :item="item" :index="index"></slot> 
					</div>
				</template>
			</div>
		</div>
		<div class="editor-bottom flex flex-col">
			<div v-if="slotOption" style="padding-bottom: 10px;">
				<slot name="postOption"></slot>
			</div>
			<div class="flex w-full">
				<span class="editor-label">问题：</span>
				<div class="formno" name="UserQuestion">
					<textarea style="height: 70px;" v-model="formState.UserQuestion" @keydown.enter.native="send" placeholder="在此输入你的问题" />
					<svg class="send-button" @click="send" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M581.632 784.384l215.552 93.184c13.312 5.632 28.16-2.56 30.208-16.896l113.664-757.248c2.56-17.92-16.896-31.232-32.256-22.016L111.616 550.4c-14.848 8.704-13.824 30.72 1.536 38.4L291.84 672.768c8.192 3.584 17.408 2.56 24.064-3.584l541.696-492.544-438.784 547.84c-3.072 3.584-4.608 8.192-4.608 12.8l-4.096 166.912c-0.512 20.48 25.088 30.208 38.4 14.336l109.056-128c5.12-7.168 15.36-9.728 24.064-6.144z" fill="currentColor"></path></svg>
					<a-select class="send-model" size="small" v-model:value="state.model" style="width: 100px" placeholder="选择模型">
    				  <a-select-option v-for="item in state.modelList" :key="item" :value="item">{{ item }}</a-select-option>
    				</a-select>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts" setup name="instant-chat">
	// import Markdown from '../markdown/markdown.vue'
	import Markdown from '../Markdown/markdown.vue'
	import { nextTick, onMounted, ref, reactive, useSlots } from 'vue';
	import { fetchEventSource } from '@microsoft/fetch-event-source';
	const props = defineProps({
		// 请求地址
		questUrl: {
			type:String,
		},
		// 请求api的请求体
		postBody: {
			type: Function
		},
		postHeader: {
			type: String
		},
		// 接收消息的处理逻辑
		process:  {
			type: Function
		},
		// 收到的模型列表
		model: {
			type:Array
		}
	});
	const slotHeader = !!useSlots().answerHeader;
	const slotOption = !!useSlots().postOption;
	let controller: {
		signal: any;
		abort: () => void;
	}
	const scrollbarRef = ref()
	const innerRef = ref();

    const state = reactive({
		model:'默认',
		joinForm: [],
		variable:[],
		//回答的对话组
		dialogs: [],
		//正在答题的正文
		answerContent: '',
		//正在答题
		answering: false,
		scrolling: false,
		scrollFlag: false,
		oldScrollTop: 0,
		newScrollTop: 0,
		forceStop: false,
		modelList:props.model
	})
	const formState = reactive({
		srcLang: '',
		dstLang: '',
		AnswerLanguage: '',
		DevelopLanguage: '',
		UserQuestion: '',
	})

	const send = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.keyCode==13) {   // 用户点击了ctrl+enter触发
			formState.UserQuestion += "\n";
			return;
		}
		if (e.keyCode==13) {
			e.preventDefault();
		}
		const sendOjb = {
			question: '',
			answerContent: '',
			isAnswering: true,
			type: 'normal'
		}
		if (!formState.UserQuestion) return;
		sendOjb.question = formState.UserQuestion;
		state.answering = true;
		formState.UserQuestion = '';

		state.dialogs = [ ...state.dialogs, sendOjb ];
		sendMessage(sendOjb);
	}

	// 发送消息
	const endSignal = '<|endoftext|>';
	controller = new AbortController();
	const sendMessage = (sendOjb: any) => {
		// JSON.stringify({ ...props.postBody(sendOjb.question, state.dialogs, state.model) }),
		// props.process && props.process(messageContent, sendOjb, controller);
		const wsurl = (location.origin + props.questUrl).replace('http', 'ws')
		console.log(wsurl);
		
		const ws = new WebSocket(wsurl);
		ws.onopen = function(event) {
			console.log("websocket connection open.");
			ws.send(JSON.stringify({ ...props.postBody(sendOjb.question, state.dialogs, state.model) }));
    	};
		ws.onmessage = async function(event) {
			const errorCode = event.data.match(/\|code:\s*([\w|\d]*)\s*\|/);
			if (errorCode && errorCode.length) {
				let returnMsg = '';
				let needLoginOut = false;
				const [, code] = errorCode;
				switch (code) {
					case 'A0804':
						returnMsg = "用户安装版本已过期";
						needLoginOut = true;
					break;
					case 'A0230':
						returnMsg = "用户登陆已过期";
						needLoginOut = true;
					break;
					default:
						returnMsg = '服务器错误';
				}
				// if (needLoginOut) {
				// 	vscode.postMessage({
				// 		command: "code.error",
				// 		errorMsg: returnMsg,
				// 	});
				// }
				
				// 有错的情况下，结束对话
				sendOjb.answerContent = returnMsg // 给消息框展示错误内容
				ws.close();
				return;
			}
			if (event.data === 'ws:end') { ws.close(); console.log('关闭连接', sendOjb.answerContent); return; }
			if (!event.data.trim()) return;
			// 查看是否是 json 开头并从中取出 serialNumber
			if (event.data.trim().startsWith("{")) {
				const { ['Serial-Number']:serialNumber } = JSON.parse(event.data);
				if (serialNumber) {
					sendOjb.id = serialNumber;
					return;
				}
			};
			try {
				const messageContent = JSON.parse(event.data);
				props.process && props.process(messageContent, sendOjb, controller);
				sendOjb.isAnswering = false;
				sendOjb.answerContent = sendOjb.answerContent;
				state.dialogs = [...state.dialogs];
			} catch(e) {
				sendOjb.answerContent = event.data.replace(/\{.*\}/g, '');
				console.log(sendOjb.answerContent,1111);
				
				state.dialogs = [...state.dialogs];
				controller.abort();
			}
			await bottomScroll();
		}

		ws.onclose = async function (event) {
    	    console.log("websocket connection close.");
    	    // state.answerContent = sendOjb.answerContent.replace(endSignal, '')
    	    sendOjb.answerContent = sendOjb.answerContent.replace(endSignal, '')
    	    await bottomScroll();
    	    sendOjb.isAnswering = false;
    	    sendOjb.isError = false;
    	    // state.answering = false;
    	};

    	ws.onerror = function(event) {
    	  console.log("websocket connection error.");
    	  console.log(event);
    	  sendOjb.answerContent = '连接失败';
    	  sendOjb.isError = true;
    	  sendOjb.isAnswering = false;
    	//   state.answering = false
    	};
	}

	async function bottomScroll() {
		if(scrollbarRef.value){
			// 注意：需要通过 nextTick 以等待 DOM 更新完成
			await nextTick()
			const max = innerRef.value!.clientHeight
			// 如：当 count = 5 时，max = 总项数 * 每一项的高度 + 外边距 * (总项数 - 1)，即 max = 5 * 50px + 20px * (5 - 1) = 330px
			scrollbarRef.value!.scrollTo({ top: max });
		}
	}

	//当触发滚动事件时，返回滚动的距离
  	function handleScroll(e:any) {
		// 更新——滚动前，滚动条距文档顶部的距离
    	const scrollTop = e.target.scrollTop

		state.oldScrollTop = scrollTop;
		state.newScrollTop = scrollTop;
		state.scrolling = true
		state.scrollFlag = true
		nextTick(() => {
			state.scrollFlag = false
			state.scrolling = false
		})
	}

	onMounted(async() => {
		await bottomScroll();
	})

	// 外部插入消息
	const insetDilog = (content: any) => {
		state.dialogs.push(content)
	}
	defineExpose({
        insetDilog
    })

</script>
<style lang="css" scoped>
.flex {
	display:flex;
}
.send-button {
	width: 26px;
	height: 26px;
	position: absolute;
	right: 6px;
	bottom: 10px;
	cursor: pointer;
}
.send-model {
	width: 26px;
	height: 26px;
	position: absolute;
	right: 6px;
	top: 8px;
	cursor: pointer;
}
.flex-col {
	flex-direction: column;
}
.w-full {
	width: 100%;
}
.chat-body {
	display: flex;
	flex-direction: column;
	padding: 5px;
	height: 100%;
}
.flex-grow {
	flex-grow: 1;
    overflow-y: scroll;
}
.bubble {
	border-radius: 4px;
	backdrop-filter: brightness(.9);
	padding: 4px;
}
.bubble * {
	border-color: currentColor;
}
.mt10 {
	margin-top: 10px;
}
.prompt-preview{
	padding: 15px 0 0 20px;
	height: 100%;
	border-left: 1px solid #eee;
}
.prompt-label{
	width:24px;
	height:24px;
	margin-right: 5px;
	color: #fff;
	font-weight: 600;
	text-align: center;
	background: #bbb;
	border-radius: 50%;
}
.formno{
	margin-bottom:0;
	position: relative;
	width: 100%;
}
.code-scroll{
	overflow: auto;
}
.code-scroll::-webkit-scrollbar {
	width: 3px;
}
.code-scroll::-webkit-scrollbar-thumb {
	width: 3px;
}
.scroll {height: 100%;overflow: auto;}
.dialog-action {
	text-align: right;
}
.editor-bottom {
	box-shadow: 0px -1px 20px rgba(0, 21, 41, 0.06);
	padding-top: 6px;
}
.editor-bottom button {
	border: 1px solid #dddddd;
	border-radius: 4px;
	margin: 10px;
	padding: 5px;
	&:hover {
		backdrop-filter: brightness(.9);
	}
}
.editor-bottom textarea {
	width: 100%;
	background: transparent;
	resize: none;
	border: 1px solid #bbb;
    border-radius: 4px;
	padding: 4px;
	&:focus-visible {
		border: 1px solid #5973dd;
		outline: 0;
	}
}
.editor-label{
	width: 60px;
	text-align: right;
}
</style>