import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { logout } from '../../store/authSlice';
import { useState } from 'react';

const NavBar = ({ activeTab = 'home' }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      href: '/',
      icon: (active) => (
        <svg className={`w-7 h-7 ${active ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      )
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      href: '/explore',
      icon: (active) => (
        <svg className={`w-7 h-7 ${active ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      href: '/profile',
      icon: (active) => (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'ring-2 ring-black' : ''} transition-all`}>
          <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo - Clean & Minimal */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black text-black">📖</div>
            <span className="text-xl font-bold text-black hidden sm:block">BookDiary</span>
          </div>

          {/* Center: Main Navigation */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={item.label}
              >
                {item.icon(activeTab === item.id)}
              </a>
            ))}
          </div>

          {/* Right: User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-sm font-medium text-black hidden sm:block">{user?.name}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-1">
                  <a href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-700">Profile</span>
                  </a>
                  <a href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">Settings</span>
                  </a>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm text-gray-700">Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
