import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AppLayout from 'layouts/AppLayout'

import Redeem from './Redeem/Redeem'
import Send from './Send/Send'
import Transactions from './Transactions/Transactions'

export interface RouteConfig {
  path: string
  label: string
  component: React.ComponentType
  nav: boolean
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    label: 'Profolio',
    component: Send,
    nav: true,
  },
  {
    path: '/redeem',
    label: 'Receive',
    component: Redeem,
    nav: true,
  },
  {
    path: '/transactions',
    label: 'Transactions',
    component: Transactions,
    nav: false,
  },
]

function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => {
        const Page = route.component
        return <Route key={route.path} path={route.path} element={<Page />} />
      })}
    </Routes>
  )
}

function Router() {
  return (
    <BrowserRouter basename={window.location.pathname}>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </BrowserRouter>
  )
}

export default Router
