import { lazy, Suspense } from "react"
import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import { SiteHeader } from "@/core/components/site-header"
import { EmptyModules, NotFound } from "@/core/components/app-states"
import { PageLoading } from "@/core/components/page-loading"
import { availableModules, defaultPath } from "./registry"
const routes = availableModules.flatMap((module) =>
  module.routes.map((route) => ({ ...route, Page: lazy(route.load) }))
)
function MainLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
/** Public shell: each module registers its own lazy routes. */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            defaultPath ? (
              <Navigate to={defaultPath} replace />
            ) : (
              <EmptyModules />
            )
          }
        />
        {routes.map(({ path, title, Page }) => (
          <Route key={path} path={path} element={<Page title={title} />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
