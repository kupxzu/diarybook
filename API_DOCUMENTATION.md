# Book Diary API Documentation

## Authentication Endpoints

All API responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Only present on success
  "errors": {}, // Only present on validation failures
  "error": "Error message" // Only present on server errors
}
```

### Register User
- **POST** `/api/register`
- **Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "client" // optional, defaults to "client", can be "admin"
}
```

### Login
- **POST** `/api/login`
- **Body:**
```json
{
  "login": "johndoe", // can be username or email
  "password": "password123"
}
```

### Get Current User
- **GET** `/api/user`
- **Headers:** `Authorization: Bearer {token}`

### Get User Profile
- **GET** `/api/profile`
- **Headers:** `Authorization: Bearer {token}`

### Logout
- **POST** `/api/logout`
- **Headers:** `Authorization: Bearer {token}`

## User Management Endpoints

### List Users (Admin Only)
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer {token}`

### Get Specific User
- **GET** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Note:** Users can only view their own profile unless they're admin

### Update User
- **PUT/PATCH** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
```json
{
  "name": "Updated Name",
  "username": "updated_username",
  "email": "updated@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123",
  "role": "admin" // only admin can update roles
}
```

### Delete User (Admin Only)
- **DELETE** `/api/users/{id}`
- **Headers:** `Authorization: Bearer {token}`

## User Roles

- **client**: Default role for regular users
- **admin**: Administrative role with elevated permissions

## Authentication

The API uses Laravel Sanctum for authentication. After login/register, include the token in the Authorization header:
```
Authorization: Bearer your-token-here
```

## Test Users

After seeding, you can use these test accounts:

**Admin User:**
- Username: `admin`
- Email: `admin@example.com`
- Password: `password`

**Client User:**
- Username: `client`
- Email: `client@example.com`
- Password: `password`

## Error Codes

- **200**: Success
- **201**: Created
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **500**: Server Error