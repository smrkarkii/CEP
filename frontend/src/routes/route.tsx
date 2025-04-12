import { createBrowserRouter } from "react-router-dom";
import NotFound from "@/pages/NotFoundPage";
import HomePage from "../pages/HomePage";
import MyLearningPage from "../pages/MyLearningPage";
import Profile from "../pages/Profile";
import Layout from "../layout/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "../pages/Profile";
import PostDetailPage from "@/pages/PostDetailPage";

export const routes = createBrowserRouter([
  {
    path: "/*",
    element: <NotFound />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        element: <ProtectedRoute redirectPath="/login" />,
        children: [
          { path: "/chat", element: <ChatPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/profile/:id", element: <ProfilePage /> },
          { path: "/post/:id", element: <PostDetailPage /> },
        ],
      },
    ],
  },
]);

export default routes;
