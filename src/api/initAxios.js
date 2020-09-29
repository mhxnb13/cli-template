import axios from "axios"

// 取消请求的特殊地址数组
const specialUrlArr = []

// 存储每个请求的标识和取消函数的Map
const pending = new Map()

// 添加请求
const addPending = (config) => {
    const url = [
        config.method,
        config.url
    ].join('&')
    config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
        if (!pending.has(url)) {
            // 如果 pending 中不存在当前请求，则添加进去
            pending.set(url, cancel)
        }
    })
}

// 移除请求
const removePending = (config) => {
    let url = ""
    if (config.method && config.url) {
        // 请求时移除
        url = [
            config.method,
            config.url
        ].join('&')
    } else if (config.config) {
        // 返回响应时移除
        url = [
            config.config.method,
            config.config.url
        ].join('&')
    }
    if (url && url != '&') {
        let specialUrl = specialUrlArr.find(value => new RegExp(url).test(value))
        if (specialUrl) {
            // 对特殊取消地址数组中的地址做处理
            let eachOtherSpecialUrlArr = specialUrl.split('||').filter(value => value != url)
            // 有其他url，保留自身url，取消其他url
            if (eachOtherSpecialUrlArr.length != 0) {
                eachOtherSpecialUrlArr.forEach(value => {
                    if (pending.has(value)) {
                        // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
                        const cancel = pending.get(value)
                        cancel(value)
                        pending.delete(value)
                    }
                })
            } else {
                // 只有自身url，只取消重复url
                if (pending.has(url)) {
                    // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
                    const cancel = pending.get(url)
                    cancel(url)
                    pending.delete(url)
                }
            }
        } else {
            // 对普通地址做处理
            if (pending.has(url)) {
                // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
                const cancel = pending.get(url)
                cancel(url)
                pending.delete(url)
            }
        }
    }
}

// 清空 pending 中的请求（在路由跳转时调用）
export const clearPending = () => {
    for (const [url, cancel] of pending) {
        cancel(url)
    }
    pending.clear()
}

// 请求拦截器
axios.interceptors.request.use(config => {
    removePending(config) // 在请求开始前，对之前的请求做检查取消操作
    addPending(config) // 将当前请求添加到 pending 中
    // other code before request
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(function (response) {
    removePending(response) // 在请求结束后，移除本次请求
    return responseHandle(response);
}, function (error) {
    errorHandle(error);
    return Promise.reject(error);
});

// 响应处理方法
function responseHandle(response) {
    console.log('响应对象：', response)
    return response.data;
}

// 错误处理方法
function errorHandle(error) {
    console.log('错误对象：', error)
}