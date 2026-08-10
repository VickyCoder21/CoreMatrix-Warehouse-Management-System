import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSpinner } from "@coreui/react";
import DefaultLayout from "./layout/DefaultLayout";
import RequireAuth from "./components/RequireAuth";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";

const Login = React.lazy(() => import("./views/Pages/Login/Login"));
const ForgotPassword = React.lazy(() => import("./views/Pages/Login/ForgotPassword"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" />
        </div>
      }>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <Login />
              </RedirectIfAuthenticated>
            }
          />

          {/* Public — a locked-out user can't be required to log in first */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/*"
            element={
              <RequireAuth>
                <DefaultLayout />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;