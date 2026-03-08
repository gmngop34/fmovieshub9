import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { ContactButton } from "./components/ContactButton";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { AnimePage } from "./pages/AnimePage";
import { HomePage } from "./pages/HomePage";
import { MoviesPage } from "./pages/MoviesPage";
import { NewReleasePage } from "./pages/NewReleasePage";
import { PlayerPage } from "./pages/PlayerPage";
import { TVPage } from "./pages/TVPage";
import { TopImdbPage } from "./pages/TopImdbPage";
import { TrendingPage } from "./pages/TrendingPage";

// Root layout
function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#141414] font-sans">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>
        <Outlet />
      </main>
      <ContactButton />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/movies",
  component: MoviesPage,
});

const tvRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tv",
  component: TVPage,
});

const animeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/anime",
  component: AnimePage,
});

const trendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trending",
  component: TrendingPage,
});

const topImdbRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/top-imdb",
  component: TopImdbPage,
});

const newReleaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-release",
  component: NewReleasePage,
});

const playerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/player/$imdbId",
  component: PlayerPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  moviesRoute,
  tvRoute,
  animeRoute,
  trendingRoute,
  topImdbRoute,
  newReleaseRoute,
  playerRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
