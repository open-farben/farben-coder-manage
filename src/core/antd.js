import * as Icons from '@ant-design/icons-vue'

export function setupAntIcon(app){
    Object.keys(Icons).forEach((key) => {
        app.component(key,Icons[key])
    })
    app.config.globalProperties.$antIcons = Icons
}