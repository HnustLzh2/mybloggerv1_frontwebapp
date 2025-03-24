import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import axios from '../api';

export const userAuthStore = defineStore('auth', () => {
    const token = ref('');
    const refreshToken = ref('');
    //定义一个用户状态管理
    const userInfo = ref({});
    const isAuthenticated = computed(() => !!token.value);  //有没有验证成功

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            console.log(response.data.data.tokens);
            token.value = response.data.data.tokens;
            refreshToken.value = response.data.data.refresh_token;
            console.log(token.value);
            return response;
        } catch (error) {
            console.error('Login error:', error);
        }
    };
    const setUserInfo = (UserInfo) => {
        userInfo.value = UserInfo;
    }
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
        userInfo.value = null;
        token.value = null;
        refreshToken.value = null;
        try {
            return await axios.get('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return {
        token,
        refreshToken,
        isAuthenticated,
        userInfo,
        setUserInfo,
        login,
        register,
        logout,
    };
},{
    persist: true,
})
export const tokenStore = defineStore('valid', () => {
    const userAuth = userAuthStore()
    const authTokenString = userAuth.token
    const refreshTokenString = userAuth.refreshToken
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
            return response;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
    return {
        authTokenString,
        refreshTokenString,
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
    const addFavoriteArticle = async (articleId, folderId) => {
        try {
            return await axios.post(`/article/favoriteArticle`, {article_id: articleId, folder_id: folderId})
        } catch (err) {
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
export const folderStore = defineStore('folder', () => {
    const createCustomizedFolder = async (folder_name, user_id) => {
        try {
            return await axios.post(`/folder/createFolder`, { folder_name, user_id })
        }catch (error) {
            console.error('Create folder error:', error);
            return null;
        }
    }
    const ModifyFolder = async (new_name, folder_id) => {
        try {
            return await axios.post(`/folder/modifyFolder`, {new_name, folder_id})
        } catch (err){
            console.error('ModifyFolder error:', err);
            return null;
        }
    }
    const GetArticleFromFolder = async (folder_id) => {
        try {
            return await axios.get(`/folder/getArticleFromFolder/${folder_id}`)
        } catch (err) {
            console.error('GetArticleFromFolder error:', err);
            return null;
        }
    }
    const GetAllFolder = async (id) => {
        try {
            return await axios.get(`/folder/getMyFolders/${id}`)
        } catch (err) {
            console.error('GetAllFolder error:', err);
            return null;
        }
    }
    return {
        createCustomizedFolder,
        ModifyFolder,
        GetArticleFromFolder,
        GetAllFolder,
    }
})