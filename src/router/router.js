import { createRouter, createWebHistory } from 'vue-router';
import HomeView from "@/components/HomeView.vue";
import ArticlesView from "@/components/ArticlesView.vue";
import ArticleDetailView from "@/components/ArticleDetailView.vue";
import LoginView from "@/components/loginView.vue";
import RegisterView from "@/components/RegisterView.vue";
import FavorateView from "@/components/FavorateView.vue";
import SearchView from "@/components/SearchView.vue";
import SpecialSubjectView from "@/components/SpecialSubjectView.vue";


const routes = [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/Articles', name: 'Articles', component: ArticlesView },
    { path: '/Article/:id', name: 'ArticleDetail', component: ArticleDetailView },
    { path: '/Favorate', name: 'Favorate', component: FavorateView },
    { path: '/Search', name: 'Search', component: SearchView },
    { path: '/SpecialSubject', name: 'SpecialSubject', component: SpecialSubjectView },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/register', name: 'Register', component: RegisterView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
