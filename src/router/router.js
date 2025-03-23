import { createRouter, createWebHistory } from 'vue-router';
import HomeView from "@/page/HomeView.vue";
import ArticlesView from "@/page/ArticlesView.vue";
import ArticleDetailView from "@/page/ArticleDetailView.vue";
import LoginView from "@/page/loginView.vue";
import RegisterView from "@/page/RegisterView.vue";
import FavorateView from "@/page/FavorateView.vue";
import SearchView from "@/page/SearchView.vue";
import SpecialSubjectView from "@/page/SpecialSubjectView.vue";
import TypeArticleView from "@/page/TypeArticleView.vue";


const routes = [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/Articles', name: 'Articles', component: ArticlesView },
    { path: '/Article/:id', name: 'ArticleDetail', component: ArticleDetailView },
    { path: '/Favorite', name: 'Favorite', component: FavorateView },
    { path: '/Search', name: 'Search', component: SearchView },
    { path: '/SpecialSubject', name: 'SpecialSubject', component: SpecialSubjectView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
    { path: '/ArticleType', name: 'Type', component: TypeArticleView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 如果 savedPosition 存在（例如用户使用浏览器的后退按钮），则恢复到该位置
        if (savedPosition) {
            return savedPosition;
        }
        // 如果是从文章详情页返回到首页，恢复到之前的位置
        if (to.path === '/' && from.path.startsWith('/article/')) {
            return { top: localStorage.getItem('homeScrollTop') || 0 };
        }
        // 其他情况滚动到顶部
        return { top: 0 };
    }
});

export default router;
