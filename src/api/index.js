import axios from "axios"
import {tokenStore, userAuthStore} from "@/store/auth.js";

const instance = axios.create({
    baseURL: "http://127.0.0.1:3002",
    timeout: 5000,
})

instance.interceptors.request.use(function (config) {
    const userAuth = userAuthStore()
    const authToken = userAuth.token;
    const refreshToken =  userAuth.refreshToken;
    if (config.url.startsWith('/chat/joinRoom')) {
        config.headers['Connection'] = 'Upgrade'
        config.headers['Upgrade'] = 'websocket'
    }
    // 检查 URL 是否以 /article/ 或 /folder/ 开头
    if (authToken && refreshToken && (config.url.startsWith('/article/') || config.url.startsWith('/folder/') || config.url.startsWith('/chat/') || config.url.startsWith('/message/'))) {
        config.headers['Authorization'] = `${authToken}`;
        config.headers['RefreshToken'] = `${refreshToken}`;
    }
    // 打印请求配置（可选）
    console.log(config);
    return config;
}, function (error) {
    console.log(error);
    return Promise.reject(error);
});
import router from '../router/router.js' // 导入路由实例
instance.interceptors.response.use(function (response) {
    //打印response
    console.log(response);
    return response;
}, async function (error) {
    const userAuth = userAuthStore()
    const tokens = tokenStore()
    console.log(router)
        if (error.response && error.response.status === 401) {
            // 调用刷新token的API
            const refreshResult = await tokens.refreshToken(userAuth.token, userAuth.refreshToken);
            if (refreshResult.data.AuthToken && refreshResult.data.RefreshToken) {
                userAuth.refreshToken = refreshResult.data.RefreshToken;
                userAuth.token = refreshResult.data.AuthToken
            }
        }
    if (error.response && error.response.status === 409) {
        await router.push('/login');
    }
    console.log(error)
    return Promise.reject(error);
});
export default instance;