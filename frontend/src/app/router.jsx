import { createBrowserRouter } from "react-router";
import MarketingLayout from "@/components/layout/MarketingLayout";
import HomePage from "@/pages/home/HomePage";
import DiscoverPage from "@/pages/discover/DiscoverPage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ChatPage from "@/pages/chat/ChatPage";
import SignupPage from "@/pages/auth/SignupPage";
import VerificationPage from "@/pages/auth/VerificationPage";
import { isChatHost } from "@/services/chatDestination";

import ResearchOverviewPage from "@/pages/research/ResearchOverviewPage";
import ResearchIndexPage from "@/pages/research/ResearchIndexPage";
import ResearchProgramsPage from "@/pages/research/ResearchProgramsPage";
import ObservatoryPage from "@/pages/research/ObservatoryPage";

export const router = createBrowserRouter([
  { path: "/signup", element: <SignupPage /> },
  { path: "/signup/verify", element: <VerificationPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/settings/:section", element: <SettingsPage /> },
  { path: "/profile", element: <SettingsPage profile /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/chat/:chatId", element: <ChatPage /> },
  ...(isChatHost
    ? [
        { path: "/", element: <ChatPage /> },
        { path: "/c/:chatId", element: <ChatPage /> },
      ]
    : []),
  {
    element: <MarketingLayout />,
    children: [
      {
        path: "/discover/research-overview",
        element: <ResearchOverviewPage />,
      },
      {
        path: "/discover/research-index",
        element: <ResearchIndexPage />,
      },
      {
        path: "/discover/research-program",
        element: <ResearchProgramsPage />,
      },
      {
        path: "/discover/nito-research-program",
        element: <ResearchProgramsPage />,
      },
      {
        path: "/discover/observatory",
        element: <ObservatoryPage />,
      },
      ...(!isChatHost ? [{ path: "/", element: <HomePage /> }] : []),
      { path: "/discover/:slug", element: <DiscoverPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
