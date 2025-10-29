/* eslint-disable no-unused-vars */
import React, { Suspense } from 'react'
import {Navigate, Route, createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import {routes} from './routes/route'
import Error from './components/error/Error'
import SuspenseLoader from './components/error/SuspenseLoader'
import RequireAuth from './components/Auth/RequireAuth'



const router=createBrowserRouter(
  createRoutesFromElements(
    <Route>
    <Route path={routes.login.path} element={<routes.login.element />} />
    <Route path={routes.register.path} element={<routes.register.element />} />

    <Route path={routes.main.path} element={<Navigate to={`${routes.email.path}/inbox`} />} />

    <Route path={routes.main.path}
       element={<RequireAuth><routes.main.element /></RequireAuth>} >

    <Route path={routes.dashboard.path}
         element={<routes.dashboard.element />}
         Error={<Error/>} />

    <Route path={`${routes.email.path}/:type`}
         element={<routes.email.element />}
         Error={<Error/>} />

    <Route path={routes.view.path} 
        element={<routes.view.element />}
        Error={<Error/>}
        />
    </Route>

    <Route path={routes.invalid.path}
     element={<Navigate to={`${routes.email.path}/inbox`} />} />
  </Route>

  )
  
)

const App = () => {
  return (
    <Suspense fallback={<SuspenseLoader/>}>
   <RouterProvider router={router}/>
   </Suspense>

  )
}

export default App