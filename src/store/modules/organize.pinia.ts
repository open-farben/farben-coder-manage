import { defineStore } from "pinia";
import request from '@/utils/request';
import { RebuildTree } from "@far/utils/tree";

export const useOrganizeStore = defineStore("organize", {
    state: () => {
        return {
            groupId: ''
        }
    },
    getters: {

    },
    actions: {
        // 分页查询工作组
        GetGroupList(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/pageGroup',
                    method: 'get',
                    params: parameter
                }).then(res => {
                    console.log(res);
                    resolve(res.data)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 新增工作组
        addGroup(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/addGroup',
                    method: 'post',
                    data: parameter
                }).then(res => {
                    console.log(res,888888);
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 编辑工作组
        editGroup(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/editGroup',
                    method: 'post',
                    data: parameter
                }).then(res => {
                    console.log(res);
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 删除工作组
        deleteGroup(parameter){
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/removeGroup',
                    method: 'DELETE',
                    params: parameter
                }).then(res => {
                    if(res.code == '0') {
                        resolve(res.data)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 获取工作组可授权人员信息
        GetDistributableInfo(parameter){
            // 当前查看的工作组id
            this.groupId = parameter.groupId;
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/authorizedUser',
                    method: 'get',
                    params: parameter
                }).then((res: any) => {
                    const optionalOrgan = res.data.optionalOrgan?.map( item => 
                        RebuildTree(item, ['organName', 'userName'], ['organNo', 'userId'], ['users', 'children'])
                    ) || [];
                    const { memberList } = res.data;
                    resolve({
                        optionalOrgan,
                        memberList
                    })
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 保存工作组
        saveWorkGroup(parameter) {
            return new Promise((resolve, reject) => {
                request({
                    url: '/coder-api/group/accreditGroup',
                    method: 'post',
                    data: { id: this.groupId, ...parameter }
                }).then(res => {
                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
})