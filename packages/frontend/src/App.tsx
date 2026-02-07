import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadTicket from "./screens/UploadTicket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterForm } from "./screens/RegisterForm";
import { LoginForm } from "./screens/LoginForm";
import { DashboardPage } from "./screens/HomeScreen";
import { AppLayout } from "./screens/AppLayout";
import { ReportsScreen } from "./screens/ReportsScreen";
import { ReportDetailScreen } from "./screens/ReportDetailScreen";

const queryClient = new QueryClient();


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
             <Route path="/home" element={<DashboardPage />} />
             <Route path="/trips" element={<ReportsScreen />} />
             <Route path="/trips/:id" element={<ReportDetailScreen />} />
             <Route path="/tickets" element={<div>Página de Tickets (Pronto)</div>} />
          </Route>
          <Route path="/upload" element={<ProtectedRoute><UploadTicket /></ProtectedRoute>} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
