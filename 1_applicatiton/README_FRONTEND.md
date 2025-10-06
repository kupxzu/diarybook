# Book Diary Frontend

Modern React frontend with Redux Toolkit, Tailwind CSS, and Laravel API integration.

## 🚀 Features

- ✅ **Redux Toolkit** for state management
- ✅ **Tailwind CSS** for styling
- ✅ **Axios** HTTP client with interceptors
- ✅ **Laravel Sanctum** authentication
- ✅ **Role-based dashboards** (Admin/Client)
- ✅ **Beautiful UI** with responsive design
- ✅ **Login with username or email**
- ✅ **Automatic token management**
- ✅ **Error handling and user feedback**

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── Login.jsx                # Login component with Tailwind
│   ├── dashboard/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx   # Admin dashboard with user management
│   │   └── client/
│   │       └── ClientDashboard.jsx  # Client dashboard with reading stats
│   ├── shared/
│   │   └── Header.jsx               # Shared header component
│   └── index.js                     # Component exports
├── store/
│   ├── authSlice.js                 # Authentication state
│   ├── usersSlice.js                # Users management state
│   ├── authThunks.js                # Async actions
│   ├── store.js                     # Redux store configuration
│   └── index.js                     # Store exports
├── lib/
│   ├── api.js                       # API functions and axios setup
│   ├── useAuth.js                   # Legacy auth hooks (kept for compatibility)
│   ├── constants.js                 # API constants and configuration
│   └── index.js                     # Library exports
├── App.jsx                          # Main app with routing logic
├── App.css                          # Additional styles
├── index.css                        # Tailwind imports and global styles
└── main.jsx                         # Entry point
```

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Ensure Laravel API is running**
   ```bash
   # In Laravel project directory
   php artisan serve
   ```

## 🔐 Authentication with Redux

### Using Redux for Authentication

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/authThunks';
import { selectUser, selectIsAuthenticated } from '../store/authSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogin = async (credentials) => {
    await dispatch(login(credentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // Your component JSX
  );
}
```

### Available Selectors

```javascript
import {
  selectUser,              // Current user object
  selectIsAuthenticated,   // Authentication status
  selectIsLoading,         // Loading state
  selectError,             // Error messages
  selectIsAdmin,           // Admin role check
  selectIsClient           // Client role check
} from './store/authSlice';
```

### Available Actions

```javascript
import {
  login,          // Login user
  register,       // Register new user
  logout,         // Logout user
  getAllUsers,    // Get all users (admin)
  updateUser,     // Update user
  deleteUser      // Delete user (admin)
} from './store/authThunks';
```

## 🎨 UI Components

### Login Component
- Beautiful gradient background
- Form validation
- Password visibility toggle
- Error handling
- Test accounts display
- Responsive design

### Client Dashboard
- Welcome section with user avatar
- Reading statistics cards
- Recent books with progress bars
- Reading goals tracking
- Quick action buttons
- Responsive grid layout

### Admin Dashboard
- User management interface
- Statistics overview
- Users table with role management
- Delete confirmation modal
- Real-time user actions
- Comprehensive admin tools

## 🔑 Test Accounts

After running Laravel seeders:

- **Admin Account:**
  - Username: `admin`
  - Email: `admin@example.com`
  - Password: `password`

- **Client Account:**
  - Username: `client`
  - Email: `client@example.com`
  - Password: `password`

## 📡 API Integration

- **Base URL:** `http://127.0.0.1:8000/api`
- **Authentication:** Laravel Sanctum tokens
- **Storage:** localStorage for persistence
- **Auto-retry:** Failed requests with token refresh
- **Error handling:** Global interceptors

## 🎯 Key Features

### Role-Based Dashboards
- **Admin Dashboard:** User management, system stats, CRUD operations
- **Client Dashboard:** Reading progress, book management, personal stats

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive grids and layouts
- Mobile-friendly navigation

### State Management
- Redux Toolkit for predictable state updates
- Async thunks for API calls
- Optimistic updates for better UX

### Error Handling
- Global error boundaries
- User-friendly error messages
- Automatic error clearing

## 📦 Tech Stack

- **React** - UI library
- **Redux Toolkit** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## 🚀 Development Features

### Hot Reload
- Instant updates during development
- State preservation across reloads

### Component Architecture
- Modular component structure
- Reusable UI components
- Clean separation of concerns

### Performance
- Code splitting ready
- Optimized bundle sizes
- Efficient re-renders with Redux

## 🔄 State Flow

```
User Action → Dispatch Thunk → API Call → Update State → UI Update
```

1. User interacts with UI
2. Component dispatches Redux thunk
3. Thunk makes API call
4. Response updates Redux state
5. Components re-render automatically

## 📱 Screenshots

The app features:
- Modern login interface with gradient backgrounds
- Clean, professional dashboards
- Intuitive user management for admins
- Reading progress tracking for clients
- Responsive design for all devices

## 🔧 Customization

### Adding New Features
1. Create new slice in `src/store/`
2. Add API functions in `src/lib/api.js`
3. Create components in appropriate folders
4. Connect with Redux selectors and actions

### Styling
- Modify `tailwind.config.js` for theme customization
- Use Tailwind utilities for consistent styling
- Add custom CSS in `src/App.css` if needed

## 🧪 Testing Ready

Structure supports easy testing with:
- Redux Toolkit Testing Utils
- React Testing Library
- Component isolation
- Mock API responses