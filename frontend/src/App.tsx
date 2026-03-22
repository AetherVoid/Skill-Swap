import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { PublicChrome } from "./components/PublicChrome";
import { Welcome } from "./pages/Welcome";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Feed } from "./pages/Feed";
import { Dashboard } from "./pages/Dashboard";
import { SkillsSetup } from "./pages/SkillsSetup";
import { Chat } from "./pages/Chat";

function FeedGate() {
  const { loading } = useAuth();
  if (loading) return <p className="py-8 text-center text-zinc-500">…</p>;
  return <Feed />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PublicChrome>
                <Welcome />
              </PublicChrome>
            }
          />
          <Route
            path="/register"
            element={
              <PublicChrome>
                <Register />
              </PublicChrome>
            }
          />
          <Route
            path="/login"
            element={
              <PublicChrome>
                <Login />
              </PublicChrome>
            }
          />
          <Route element={<Layout />}>
            <Route path="/feed" element={<FeedGate />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/skills" element={<SkillsSetup />} />
            <Route path="/exchange/:id" element={<Chat />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
