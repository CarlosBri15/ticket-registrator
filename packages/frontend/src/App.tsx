import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadTicket from "./screens/UploadTicket";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/upload" element={<UploadTicket />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
