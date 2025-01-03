import path from "path";
export const disposeVariable = (variablePool) => {
    let packages = [];
    // 如果 taskOption 值为 update
    if (variablePool.taskOption === 'update') {
        // 如果有重构内容 是依赖docker重构的，必须加上docker指令
        if (variablePool.rebuildList.length && variablePool.rebuildList.some(key => [ 'webServe', 'nodeServe', 'nodeMongo' ].indexOf(key) > -1)) {
            variablePool.rebuildList.push("docker");
        }
        // 如果有推送图片功能
        if (variablePool.functionList.indexOf('push-pic') > -1) {
            variablePool.rebuildList.push("images");
        }
        // 计算了最终要执行打包的文件列表
        packages = variablePool.allPackageList.filter(item => variablePool.rebuildList.indexOf(item.key) > -1);
    } else {
        packages = variablePool.allPackageList;
    }
    // 构建打包文件名
    const nameHash = (new Date().valueOf() / 1000).toFixed(0);
    variablePool.filename = `${variablePool.packageNamePrefix ? variablePool.packageNamePrefix + '-' : ''}${variablePool.taskOption}-${nameHash}.zip`;
    variablePool.packageList = packages.map(item => ({
        source: item.source,
        target: item.target.map(str => {
            const name = str.match(/^\{([^}]*)}$/) ? str.match(/^\{([^}]*)}$/)[1] : '';
            return name ? variablePool[name] : str
        }),
        include: item.key === "webDist" && variablePool.fileList  ? variablePool.fileList.map(file => file.filePath) : undefined
    }));
    // 构建docker 的配置文件的文件 位置。
    variablePool.configFilePath = path.join(...variablePool.configFilePath.map(str => {
        const name = str.match(/^\{([^}]*)}$/) ? str.match(/^\{([^}]*)}$/)[1] : '';
        return name ? variablePool[name] : str;
    }));
    // 构建 docker 配置文件 内容
    variablePool.configFileContent = variablePool.configFileContent.replace(/\{([^}]*)}/g, function (...arg) {
        const v = arg[1]
        return variablePool[v];
    })
}