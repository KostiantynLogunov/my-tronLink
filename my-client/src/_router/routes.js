import Home from '@/components/Home'
import SignIn from '@/components/auth/SignIn'

export const routes = [
    {
        path: '/',
        component: Home,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/signin',
        component: SignIn
    }
];