import axios from "axios"

const instance = axios.create({
    baseURL: "http://127.0.0.1:3002",
    timeout: 5000,
})

instance.interceptors.request.use(function (config) {
    //打印request
    console.log(config)
    return config;
}, function (error) {
    console.log(error)
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