import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components
import Dashboard from "./components/Dashboard";
import LiveFeed from "./components/LiveFeed";
import Analytics from "./components/Analytics";
import EventDetail from "./components/EventDetail";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    provider: "",
    model: "",
    user_id: "",
    service: "",
    days: 7
  });

  // Auth token (mock for MVP)
  const authToken = "Bearer demo-token";
  
  const apiHeaders = {
    'Authorization': authToken,
    'Content-Type': 'application/json'
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/v1/ai-usage/analytics?days=${filters.days}`, {
        headers: apiHeaders
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events data
  const fetchEvents = async (limit = 100) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.model) params.append('model', filters.model);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.service) params.append('service', filters.service);
      
      const response = await axios.get(`${API}/v1/ai-usage/events?${params}`, {
        headers: apiHeaders
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events data");
    } finally {
      setLoading(false);
    }
  };

  // Generate demo data
  const generateDemoData = async () => {
    try {
      setLoading(true);
      toast.loading("Generating demo data...");
      
      const response = await axios.post(`${API}/v1/ai-usage/generate-demo-data?count=100`, {}, {
        headers: apiHeaders
      });
      
      toast.success(`Generated ${response.data.count} demo events`);
      
      // Refresh data
      await Promise.all([fetchAnalytics(), fetchEvents()]);
    } catch (error) {
      console.error("Error generating demo data:", error);
      toast.error("Failed to generate demo data");
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Initial data load
  useEffect(() => {
    fetchAnalytics();
    fetchEvents();
  }, [filters.days]);

  // Refresh events when filters change
  useEffect(() => {
    if (filters.provider || filters.model || filters.user_id || filters.service) {
      fetchEvents();
    }
  }, [filters.provider, filters.model, filters.user_id, filters.service]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard 
            analytics={analytics}
            events={events}
            loading={loading}
            filters={filters}
            updateFilters={updateFilters}
            onGenerateDemoData={generateDemoData}
          />
        );
      case "live-feed":
        return (
          <LiveFeed 
            events={events}
            loading={loading}
            onRefresh={fetchEvents}
            filters={filters}
            updateFilters={updateFilters}
          />
        );
      case "analytics":
        return (
          <Analytics 
            analytics={analytics}
            loading={loading}
            filters={filters}
            updateFilters={updateFilters}
          />
        );
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="flex">
            {/* Sidebar */}
            <Sidebar 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
            />
            
            {/* Main Content */}
            <div className="flex-1 ml-64">
              <Header 
                currentPage={currentPage}
                analytics={analytics}
              />
              
              <main className="p-6">
                <Routes>
                  <Route path="/" element={renderCurrentPage()} />
                  <Route path="/dashboard" element={renderCurrentPage()} />
                  <Route path="/live-feed" element={renderCurrentPage()} />
                  <Route path="/analytics" element={renderCurrentPage()} />
                  <Route path="/events/:eventId" element={<EventDetail />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
        
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;