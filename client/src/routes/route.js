/* eslint-disable no-unused-vars */
import { lazy } from "react"
const Main=lazy(()=>import('../pages/Main'));
const Email=lazy(()=>import('../components/Email'));
const ViewEmails=lazy(()=>import('../components/ViewEmails'))
const Login=lazy(()=>import('../pages/Login'))
const Register=lazy(()=>import('../pages/Register'))
const Dashboard=lazy(()=>import('../pages/Dashboard'))


export const routes={
    main:{
        path:'/',
        element:Main,
    },
    login:{
        path:'/login',
        element:Login,
    },
    register:{
        path:'/register',
        element:Register,
    },
    email:{
        path:'/emails',
        element:Email,

    },
    invalid:{
        path:'/*',
        element:Email,
    },
    view:{
        path:'/view',
        element:ViewEmails 
    },
    dashboard:{
        path:'/dashboard',
        element:Dashboard
    }

}

