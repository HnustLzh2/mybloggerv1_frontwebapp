import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import axios from '../api';

export const userAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('authToken'));
    const refreshToken = ref(localStorage.getItem('refreshToken'));
    //定义一个用户状态管理
    const userInfo = ref(localStorage.getItem('userInfo'));
    const isAuthenticated = computed(() => !!token.value);  //有没有验证成功

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            console.log(response.data.data.tokens);
            token.value = response.data.data.tokens;
            refreshToken.value = response.data.data.refresh_token;
            userInfo.value = response.data.data;
            console.log(token.value);
            localStorage.setItem('authToken', token.value || '');
            localStorage.setItem('refreshToken', refreshToken.value || '');
            localStorage.setItem('userInfo', JSON.stringify(response.data) || '');  //如果没有数据就是个空的string
            return response;
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const register = async (email, password, username, authorization) => {
        try {
            const response = await axios.post('/auth/register', { email, password, username, authorization });
            token.value = response.data.tokens;
            localStorage.setItem('token', token.value || '');
            return response;
        } catch (error) {
            console.error('Register error:', error);
        }
    };

    const logout = async() => {
        token.value = null;
        refreshToken.value = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        try {
            return await axios.get('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        token,
        isAuthenticated,
        userInfo,
        login,
        register,
        logout,
    };
})
export const tokenStore = defineStore('valid', () => {
    const authTokenString = ref(localStorage.getItem('authToken'));
    const refreshTokenString = ref(localStorage.getItem('refreshToken'));
    const checkToken = async (auth_token, refresh_token) => {
        try {
             return await axios.post("/checkToken", {auth_token, refresh_token});
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    const refreshToken = async (auth_token, refresh_token) => {
        try {
            const response = await axios.post("/refreshToken", {auth_token, refresh_token});
            authTokenString.value = response.data.AuthToken;
            refreshTokenString.value = response.data.RefreshToken
            localStorage.setItem('authToken', response.data.Token);
            localStorage.setItem('refreshToken', response.data.Token);
            return response;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    return {
        checkToken,
        refreshToken,
    }
})
export const articleAuthStore = defineStore('article', () => {
    const userStore = userAuthStore(); // 获取 userAuthStore 实例
    const tokens = tokenStore();

    const getAllArticles = async() => {
        try {
            return await axios.get('/getAllArticle')
        }catch (error) {
            console.error('GetAllArticles error:', error);
        }
    }
    const getArticleById = async (id) => {
        try {
            return await axios.get(`/getArticle/${id}`)
        }catch (error) {
            console.error('GetArticle Error:', error);
        }
    }
    const getCategory = async () => {
        try {
            return await axios.get('/getCategory')
        } catch (error) {
            console.error('GetCategoryError:', error);
        }
    }
    const getArticlesByCategory = async (category) => {
        try {
            console.log(category)
            const params = new URLSearchParams({ category: category });
            return await axios.get(`/getCategoryArticle/${params}`);
        } catch (error) {
            console.error('GetArticlesByCategoryError:', error);
        }
    }
    const getFavoritesArticle = async () => {
        if (userStore.userInfo && userStore.token) {
            try {
                const response = await axios.post(
                    '/article/getFavoriteArticle',
                    { user_id: userStore.userInfo.id },
                    {
                        headers: {
                            Authorization: `${userStore.token}`,
                            'Refresh-Token': tokens.refreshToken || '' // 如果有 refreshToken，也一并添加
                        }
                    }
                );
                return response;
            } catch (error) {
                console.error('GetFavoritesArticle error:', error);
                return null;
            }
        } else {
            console.log("权限错误，你还没有登入或没有有效的 token");
            return null;
        }
    };
    const addFavoriteArticle = async (articleId, userId) => {
        try {
            return await axios.post(`/article/addFavoriteArticle`, {article_id: articleId, user_id: userId})
        } catch (err) {
            console.log(err)
            return null;
        }
    }
    return {
        getArticleById,
        getAllArticles,
        getCategory,
        getArticlesByCategory,
        getFavoritesArticle,
        addFavoriteArticle,
    }
})