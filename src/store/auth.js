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
    const setToken = (AuthToken, RefreshToken) => {
        token.value = AuthToken;
        refreshToken.value = RefreshToken;
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
        setToken,
        login,
        register,
        logout,
    };
},{
    persist: true,
})
export const tokenStore = defineStore('valid', () => {
    const userAuth = userAuthStore()
    const checkToken = async (auth_token, refresh_token) => {
        return await axios.post("/checkToken", {auth_token, refresh_token});
    }
    const refreshToken = async (auth_token, refresh_token) => {
        const response = await axios.post("/refreshToken", {auth_token, refresh_token});
        userAuth.setToken(response.data.AuthToken, response.data.RefreshToken);
        return response;
    }
    return {
        checkToken,
        refreshToken,
    }
},{
    persist: true,
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
    const searchArticle = async (text, page, size) => {
        try {
            return await axios.get('/searchArticle', {
                params: {
                    text: text,
                    page: page,
                    size: size
                }
            });
        } catch (err) {
            console.error('SearchArticle error:', err);
            return null;
        }
    };
    const likeArticle = async (articleId) => {
        try {
            return await axios.get(`/article/likeArticle/${articleId}`)
        } catch (err) {
            console.error('LikeArticle error:', err);
            return null;
        }
    }
    const addComment = async (content, user_id, article_id) => {
        try {
            return await axios.post("/article/addComments", {content, user_id, article_id})
        } catch (err) {
            console.error('AddComment error:', err);
            return null;
        }
    }
    const getComments = async (article_id) => {
        try {
            return await axios.get(`/getComment/${article_id}`)
        } catch (err) {
            console.error('GetComment error:', err);
            return null;
        }
    }
    const replyComments = async (content, user_id, article_id, parent_id) => {
        try {
            return await axios.post(`/article/repliedComment`, {content, user_id, article_id, parent_id})
        } catch (err) {
            console.error('ReplyComment error:', err);
            return null;
        }
    }
    const likeComment = async (comment_id, user_id) => {
        try {
            return await axios.post(`/article/likeComment`, {comment_id: comment_id, user_id: user_id})
        } catch (err) {
            console.error('LikeComment error:', err);
            return null;
        }
    }
    const deleteComment = async (comment_id) => {
        try {
            return await axios.delete(`/article/deleteComment/${comment_id}`)
        } catch (err) {
            console.error('DeleteComment error:', err);
            return null;
        }
    }
    return {
        getComments,
        getArticleById,
        getAllArticles,
        getCategory,
        getArticlesByCategory,
        getFavoritesArticle,
        addFavoriteArticle,
        addComment,
        searchArticle,
        likeArticle,
        replyComments,
        likeComment,
        deleteComment,
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
        return await axios.get(`/folder/getMyFolders/${id}`)
    }
    return {
        createCustomizedFolder,
        ModifyFolder,
        GetArticleFromFolder,
        GetAllFolder,
    }
})
export const chatStore = defineStore('chat', () => {
    const createChatRoom = async (room_name, creator_id) => {
        try {
            return await axios.post(`/chat/create-room`, {room_name, creator_id})
        } catch (err) {
            console.error('CreateChatRoomError:', err);
            return null;
        }
    }
    const getChatMessage = async (roomId) => {
        try {
            return await axios.get(`/message/history/${roomId}`)
        } catch (err) {
            console.error('GetChatMessage error:', err);
            return null;
        }
    }
    const getAllChatRooms = async () => {
        try {
            return await axios.get(`/chat/rooms`)
        } catch (err) {
            console.error('GetAllChatRooms error:', err);
            return null;
        }
    }
    const getAllYourCharRooms = async (user_id) => {
        try {
            return await axios.get(`/chat/yourRooms/${user_id}`)
        } catch (err) {
            console.error('GetAllYourCharRooms error:', err);
            return null;
        }
    }
    const getRoomInfo = async (room_id) => {
        try {
            return await axios.get(`/chat/room/${room_id}`)
        } catch (err) {
            console.error('GetRoomMessageHistoryError:', err);
            return null;
        }
    }
    const JoinRoom = async (room_id, user_id) => {
        try {
            return await axios.get(`/chat/joinRoom`, {
                params: {
                    roomId :room_id,
                    userId :user_id,
                }
            })
        } catch (err) {
            console.error('JoinRoomError:', err);
            return null;
        }
    }
    return {
        createChatRoom,
        getChatMessage,
        getAllChatRooms,
        getAllYourCharRooms,
        getRoomInfo,
        JoinRoom
    }
})