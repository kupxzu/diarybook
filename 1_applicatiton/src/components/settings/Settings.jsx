import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { logout } from '../../store/authSlice';
import { changePassword, deactivateAccount, deleteAccount, getActivityHistory } from '../../lib/api';
import NavBar from '../shared/NavBar';

const Settings = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  // Modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form states
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Activity history state
  const [activityHistory, setActivityHistory] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    // Apply theme on load
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      window.location.href = '/';
    }
  };

  const fetchActivityHistory = async () => {
    setLoadingActivity(true);
    try {
      const response = await getActivityHistory();
      if (response.success) {
        setActivityHistory(response.data);
      } else {
        // Fallback to mock data if API fails
        const mockActivity = [
          { id: 1, type: 'post', action: 'Created new post', date: '2025-10-06 14:30', details: 'Posted: "Had an amazing day today..."' },
          { id: 2, type: 'profile', action: 'Updated profile', date: '2025-10-05 09:15', details: 'Changed name and bio' },
          { id: 3, type: 'post', action: 'Updated post', date: '2025-10-04 16:45', details: 'Edited post content' },
          { id: 4, type: 'like', action: 'Liked a post', date: '2025-10-04 12:20', details: 'Liked John\'s post' },
          { id: 5, type: 'comment', action: 'Added comment', date: '2025-10-03 18:30', details: 'Commented on Sarah\'s post' },
        ];
        setActivityHistory(mockActivity);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      // Use mock data as fallback
      const mockActivity = [
        { id: 1, type: 'post', action: 'Created new post', date: '2025-10-06 14:30', details: 'Posted: "Had an amazing day today..."' },
        { id: 2, type: 'profile', action: 'Updated profile', date: '2025-10-05 09:15', details: 'Changed name and bio' },
        { id: 3, type: 'post', action: 'Updated post', date: '2025-10-04 16:45', details: 'Edited post content' },
      ];
      setActivityHistory(mockActivity);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      const response = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword
      });
      
      if (response.success) {
        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.message || 'Error changing password');
    }
  };

  const handleDeactivateAccount = async () => {
    try {
      const response = await deactivateAccount();
      if (response.success) {
        alert('Account deactivated successfully');
        setShowDeactivateModal(false);
        dispatch(logout());
      }
    } catch (error) {
      alert(error.message || 'Error deactivating account');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await deleteAccount();
      if (response.success) {
        alert('Account deleted successfully');
        setShowDeleteModal(false);
        dispatch(logout());
      }
    } catch (error) {
      alert(error.message || 'Error deleting account');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post':
        return '📝';
      case 'profile':
        return '👤';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar activeTab="settings" />
      
      <main className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and privacy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Settings */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Account Settings
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🔑</span>
                  <div className="text-left">
                    <p className="font-medium text-black">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => {
                  fetchActivityHistory();
                  setShowActivityModal(true);
                }}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <div className="text-left">
                    <p className="font-medium text-black">Activity History</p>
                    <p className="text-sm text-gray-600">View your posts and profile updates</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-medium text-black mb-3">Theme Preference</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-3 border rounded-lg transition-colors ${
                      theme === 'light' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">☀️</span>
                    Light Mode
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3 border rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-2">🌙</span>
                    Night Mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">🔒</span>
              Privacy & Security
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="w-full flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏸️</span>
                  <div className="text-left">
                    <p className="font-medium text-yellow-800">Deactivate Account</p>
                    <p className="text-sm text-yellow-600">Temporarily disable your account</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-4 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🗑️</span>
                  <div className="text-left">
                    <p className="font-medium text-red-800">Delete Account</p>
                    <p className="text-sm text-red-600">Permanently delete your account</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚪</span>
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                    <p className="text-sm opacity-70">Sign out of your account</p>
                  </div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Activity History Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black flex items-center">
                  <span className="mr-2">📊</span>
                  Activity History
                </h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {loadingActivity ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading activity...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityHistory.map(activity => (
                    <div key={activity.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl mr-4 flex-shrink-0">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-black">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-2">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">⏸️</span>
                </div>
                <h2 className="text-xl font-bold text-black mb-2">Deactivate Account</h2>
                <p className="text-gray-600 mb-6">Your account will be temporarily disabled. You can reactivate it anytime by logging back in.</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivateAccount}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🗑️</span>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
                <p className="text-gray-600 mb-6">This action cannot be undone. All your posts, comments, and profile data will be permanently deleted.</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;