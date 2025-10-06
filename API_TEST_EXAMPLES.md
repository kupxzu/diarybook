# Test API Endpoints

You can test these endpoints using tools like Postman, curl, or any HTTP client.

## 1. Register a new user
```bash
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

## 2. Login with username
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "testuser",
    "password": "password123"
  }'
```

## 3. Login with email
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "password123"
  }'
```

## 4. Get user profile (requires token from login)
```bash
curl -X GET http://127.0.0.1:8000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 5. Get all users (admin only)
```bash
curl -X GET http://127.0.0.1:8000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## 6. Update user
```bash
curl -X PUT http://127.0.0.1:8000/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

## 7. Logout
```bash
curl -X POST http://127.0.0.1:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test with seeded users:

**Admin Login:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "admin",
    "password": "password"
  }'
```

**Client Login:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "client",
    "password": "password"
  }'
```