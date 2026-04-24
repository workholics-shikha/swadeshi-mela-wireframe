import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthSessionExpiredError, getAuthToken, getCurrentUser, validateSession } from "@/lib/auth";
import Index from "./pages/Index.tsx";
import VendorLogin from "./pages/VendorLogin.tsx";
import TermsAndConditions from "./pages/TermsAndConditions.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import BookStall from "./pages/BookStall.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

type RequiredRole = "admin" | "vendor";

const RouteScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const ProtectedRoute = ({ role, children }: { role: RequiredRole; children: JSX.Element }) => {
  const token = getAuthToken();
  const user = getCurrentUser();
  const hasUser = Boolean(user);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionUserRole, setSessionUserRole] = useState<RequiredRole | null>((user?.role as RequiredRole) ?? null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!token || !hasUser) {
        if (active) setIsCheckingSession(false);
        return;
      }

      try {
        const validatedUser = await validateSession();
        if (!active) return;
        setSessionUserRole((validatedUser?.role as RequiredRole) ?? null);
      } catch (error) {
        if (!active) return;
        if (error instanceof AuthSessionExpiredError) {
          setSessionUserRole(null);
        }
      } finally {
        if (active) setIsCheckingSession(false);
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, [token, hasUser]);

  if (isCheckingSession) {
    return null;
  }

  if (!token || !user) {
    return <Navigate replace to={`/login?redirect=${role}`} />;
  }
  if (!sessionUserRole) {
    return <Navigate replace to={`/login?redirect=${role}`} />;
  }
  if (sessionUserRole !== role) {
    return <Navigate replace to={sessionUserRole === "admin" ? "/admin" : "/vendor/dashboard"} />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteScrollRestoration />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index.html" element={<Navigate replace to="/" />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/vendor/login" element={<Navigate replace to="/login" />} />
          <Route path="/vendor/register" element={<Navigate replace to="/login" />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel userRole="Admin" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute role="vendor">
                <AdminPanel userRole="Vendor" />
              </ProtectedRoute>
            }
          />
          <Route path="/book-stall" element={<BookStall />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
