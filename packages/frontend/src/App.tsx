import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadTicket from "./screens/UploadTicket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterForm } from "./screens/RegisterForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/upload" element={<UploadTicket />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
