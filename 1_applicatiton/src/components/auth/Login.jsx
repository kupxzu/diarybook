import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError } from '../../store/authSlice';
import { selectIsLoading, selectError } from '../../store/authSlice';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice';
import { login } from '../../store/authThunks';

const Login = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  // Clear error on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch(login(formData))
      .unwrap()
      .then(() => {
        dispatch(showSuccessToast('🎉 Welcome back! Login successful.'));
      })
      .catch((error) => {
        dispatch(showErrorToast(`❌ ${error.message || 'Login failed. Please check your credentials.'}`));
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Book Diary</h1>
            <p className="text-gray-600">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Input */}
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-black mb-2">
                Username or Email
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                value={formData.login}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white text-black placeholder-gray-500"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors bg-white text-black placeholder-gray-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gray-100 border border-gray-300 text-black px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Test Accounts Card */}
        <div className="bg-white rounded-lg shadow-2xl p-6 mt-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4 text-center">Demo Accounts</h3>
          
          <div className="space-y-3">
            {/* Admin Account */}
            <div className="p-4 border border-gray-300 rounded-md hover:border-black transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black">Admin Account</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Username: <span className="font-mono">admin</span> | Password: <span className="font-mono">password</span>
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ login: 'admin', password: 'password' })}
                  className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  Use
                </button>
              </div>
            </div>

            {/* Client Account */}
            <div className="p-4 border border-gray-300 rounded-md hover:border-black transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black">Client Account</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Username: <span className="font-mono">client</span> | Password: <span className="font-mono">password</span>
                  </p>
                </div>
                <button
                  onClick={() => setFormData({ login: 'client', password: 'password' })}
                  className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                  type="button"
                >
                  Use
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;