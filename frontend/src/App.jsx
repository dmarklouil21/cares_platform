import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientLayout from "./layouts/PatientLayout";
import SelectUserType from "./pages/user/registration/SelectUserType";
import Info102 from "./pages/user/registration/beneficiary/Info102";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PatientLayout />}>
          <Route index element={<SelectUserType />} />
          <Route path="Info1_02" element={<Info102 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
