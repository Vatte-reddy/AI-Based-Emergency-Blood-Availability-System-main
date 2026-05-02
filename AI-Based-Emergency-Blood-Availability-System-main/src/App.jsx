import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { apiUrl } from "./config/api";
import Home from "./pages/Home";
import About from "./pages/About";
import Faq from "./pages/Faq";
import DonorReg from "./pages/DonorReg";
import BloodRequest from "./pages/BloodRequest";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";
import DonorsPage from "./pages/DonorsPage.jsx";
import RequestsPage from "./pages/RequestsPage.jsx";
import UrgentPage from "./pages/UrgentPage.jsx";


const getPreferredName = (firebaseUser) => {
  if (!firebaseUser) return null;
  const displayName = String(firebaseUser.displayName || "").trim();
  if (displayName) return displayName;
  const email = String(firebaseUser.email || "").trim();
  if (email.includes("@")) {
    const base = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    return base ? base.replace(/\b\w/g, (m) => m.toUpperCase()) : "Member";
  }
  return "Member";
};

function App() {
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadData = async (retryCount = 0) => {
    setIsDataLoading(true);
    setDataError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`[CONNECTIVITY] Load attempt ${retryCount + 1} timed out after 8s.`);
    }, 8000); // 8s timeout for cold starts

    try {
      const fetchOptions = { 
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
        mode: 'cors'
      };

      const [donorRes, requestRes] = await Promise.all([
        fetch(apiUrl("/api/donors"), fetchOptions),
        fetch(apiUrl("/api/requests"), fetchOptions),
      ]);
      
      clearTimeout(timeoutId);

      if (!donorRes.ok || !requestRes.ok) {
         throw new Error(`Server Error: Donors(${donorRes.status}) Requests(${requestRes.status})`);
      }

      const donorsData = await donorRes.json();
      const requestsData = await requestRes.json();
      
      const donorArray = donorsData.donors && Array.isArray(donorsData.donors) ? donorsData.donors : (Array.isArray(donorsData) ? donorsData : []);
      const requestArray = requestsData.requests && Array.isArray(requestsData.requests) ? requestsData.requests : (Array.isArray(requestsData) ? requestsData : []);
      
      setDonors(donorArray);
      setRequests(requestArray);
      
      localStorage.setItem("bloodhub_donors_cache", JSON.stringify(donorArray));
      localStorage.setItem("bloodhub_requests_cache", JSON.stringify(requestArray));
      console.log(`[CONNECTIVITY] Successfully loaded ${donorArray.length} donors.`);
    } catch (error) {
      clearTimeout(timeoutId);
      
      const isTimeout = error.name === "AbortError";
      
      // Automatic retry once on any failure (timeout or error)
      if (retryCount < 1) {
        console.log(`[CONNECTIVITY] Retrying connection (Attempt ${retryCount + 2})...`);
        // Slight delay before retry to allow server to stabilize
        await new Promise(r => setTimeout(r, 500));
        return loadData(retryCount + 1);
      }

      console.error(isTimeout ? "[CONNECTIVITY] Fetch timed out permanently" : "[CONNECTIVITY] Fetch error:", error);
      
      // Load fallback from cache
      const cachedDonors = localStorage.getItem("bloodhub_donors_cache");
      const cachedRequests = localStorage.getItem("bloodhub_requests_cache");
      
      if (cachedDonors || cachedRequests) {
        setDonors(cachedDonors ? JSON.parse(cachedDonors) : []);
        setRequests(cachedRequests ? JSON.parse(cachedRequests) : []);
        setDataError("Server is slow or unavailable. Showing limited data.");
      } else {
        setDataError("Unable to connect to server. Please check your network or restart the backend.");
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          name: getPreferredName(firebaseUser),
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
        localStorage.setItem("bloodhub_user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("bloodhub_user");
      }
      setLoading(false);
    });

    loadData();
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <div style={{ paddingTop: "80px", minHeight: 'calc(100vh - 80px)' }}>
        {isDataLoading && (
          <div className="flex-center" style={{ flexDirection: "column", padding: "100px 20px" }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ marginBottom: "24px" }}
            >
              <Heart size={64} color="var(--primary-blue)" fill="var(--primary-blue)" />
            </motion.div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-main)" }}>Connecting to BloodHub...</h2>
            <p style={{ color: "var(--text-soft)", marginTop: "12px", fontSize: "16px" }}>Syncing life-saving data in your region</p>
          </div>
        )}
        {dataError && !isDataLoading && (
          <div className="container" style={{ textAlign: "center", padding: "40px" }}>
            <div className="card" style={{ padding: "40px", border: "1px solid var(--danger-red)", background: "#FEF2F2" }}>
              <h3 style={{ color: "var(--danger-red)", marginBottom: "20px" }}>{dataError}</h3>
              <button 
                onClick={() => loadData()}
                className="auth-single-btn"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
        {!isDataLoading && (
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/auth" element={<AuthPage setUser={setUser} user={user} initialMode="login" />} />
          <Route path="/login" element={<AuthPage setUser={setUser} user={user} initialMode="login" />} />
          <Route path="/signup" element={<AuthPage setUser={setUser} user={user} initialMode="signup" />} />
          <Route
            path="/donate"
            element={
              <ProtectedRoute
                element={<DonorReg setDonors={setDonors} user={user} donors={donors} />}
                isAuthenticated={!!user}
                loading={loading}
              />
            }
          />
          <Route
            path="/request"
            element={
              <ProtectedRoute
                element={<BloodRequest donors={donors} requests={requests} setRequests={setRequests} user={user} />}
                isAuthenticated={!!user}
                loading={loading}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard donors={donors} setDonors={setDonors} requests={requests} setRequests={setRequests} user={user} loading={loading} />}
                isAuthenticated={!!user}
                loading={loading}
              />
            }
          />

          <Route 
            path="/welcome" 
            element={
              <ProtectedRoute element={<WelcomePage user={user} />} isAuthenticated={!!user} loading={loading} />
            } 
          />
          <Route 
            path="/donors" 
            element={
              <ProtectedRoute element={<DonorsPage donors={donors} />} isAuthenticated={!!user} loading={loading} />
            } 
          />
          <Route 
            path="/requests" 
            element={
              <ProtectedRoute element={<RequestsPage requests={requests} />} isAuthenticated={!!user} loading={loading} />
            } 
          />
           <Route 
            path="/urgent" 
            element={
              <ProtectedRoute element={<UrgentPage requests={requests} />} isAuthenticated={!!user} loading={loading} />
            } 
          />
          {/* Legacy Redirects */}
          <Route path="/donor-registration" element={<Navigate to="/donate" replace />} />
          <Route path="/blood-request" element={<Navigate to="/request" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;

