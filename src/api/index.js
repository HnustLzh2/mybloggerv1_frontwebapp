import axios from "axios"

const instance = axios.create({
    baseURL: "http://127.0.0.1:3002",
    timeout: 5000,
})

instance.interceptors.request.use(function (config) {
    const authToken = localStorage.getItem("authToken");
    const refreshToken = localStorage.getItem("refreshToken");
    // 检查 URL 是否以 /article/ 或 /folder/ 开头
    if (authToken && refreshToken && (config.url.startsWith('/article/') || config.url.startsWith('/folder/'))) {
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

instance.interceptors.response.use(function (response) {
    //打印response
    console.log(response);
    return response;
}, function (error) {
    console.log(error)
    return Promise.reject(error);
});
export default instance;