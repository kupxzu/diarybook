import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import { selectIsAuthenticated, selectIsLoading, selectIsAdmin, initializeAuth } from './store/authSlice';
import { getStoredUser } from './lib/api';
import Login from './components/auth/Login';
import ClientDashboard from './components/dashboard/client/ClientDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import ClientProfile from './components/profile/ClientProfile';
import Settings from './components/settings/Settings';
import Explore from './components/pages/Explore';
import ToastContainer from './components/shared/ToastContainer';
import './App.css'

// Main App Router Component
function AppRouter() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  // Initialize authentication state on app start
  useEffect(() => {
    const storedUser = getStoredUser();
    dispatch(initializeAuth(storedUser));
  }, [dispatch]);

  // Simple routing handler
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    // Listen for clicks on anchor tags
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = e.target.getAttribute('href');
        window.history.pushState({}, '', path);
        setCurrentRoute(path);
      }
    });

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-indigo-500 bg-white transition ease-in-out duration-150 cursor-not-allowed">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Route based on authentication and role
  if (!isAuthenticated) {
    return <Login />;
  }

  // Authenticated users - route based on current path and role
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Client routes
  if (currentRoute === '/profile') {
    return <ClientProfile />;
  }
  
  if (currentRoute === '/settings') {
    return <Settings />;
  }
  
  if (currentRoute === '/explore') {
    return <Explore />;
  }

  return <ClientDashboard />;
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <AppRouter />
        <ToastContainer />
      </div>
    </Provider>
  );
}

export default App
