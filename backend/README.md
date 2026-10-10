# Backend API Setup

This is a lightweight Express backend built for the Peace Be Upon Him website, integrated with Supabase for PostgreSQL and Authentication.

## Features
- **Authentication**: Secure user registration, login, and logout via Supabase Auth (JWT).
- **Activity History**: Tracks user activities (search, chat, bookmarks) with timestamps.
- **Security**: 
  - Passwords are never handled by the backend logic manually (delegated securely to Supabase).
  - Row Level Security (RLS) ensures users can only read/delete their own history.
  - Supabase Service Role key is only used on the backend and kept in `.env`.

## 1. Setup Instructions

1. **Install Dependencies**:
   Navigate to the backend directory and run:
   ```bash
   cd backend
   npm install
   ```

2. **Existing Supabase Project**:
   - Reuse the existing project and its data; do not create a new project or run destructive schema commands.
   - Go to Project Settings -> API and configure this backend with the existing **Project URL** and backend-only **service_role key**.

3. **Configure Environment Variables**:
   - Copy `.env.example` to a new `.env` file in the `backend` folder.
   - Fill in your Supabase credentials:
     ```env
     SUPABASE_URL=your-supabase-project-url
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     APP_SESSION_SECRET=a-long-random-server-only-secret
     PORT=5000
     ```

4. **Secure the Existing Database**:
   - Go to the SQL Editor in your Supabase dashboard.
   - Review and run `backend/migrations/20261010_add_password_hash_and_lock_direct_access.sql` once. It adds a password-hash column and locks down direct database access without dropping or recreating tables.

## 2. Running the Server

Start the backend server in development mode:
```bash
npm start
```
The server will run on `http://localhost:5000`.

## 3. Frontend Integration

To integrate this backend with your React app, you can use the built-in `fetch` API. Here is an example flow:

**Login**:
```javascript
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, age, password })
});
const data = await res.json();
localStorage.setItem('pbuh_auth_token', data.token);
```

**Save Activity History**:
```javascript
await fetch('http://localhost:5000/api/history', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('pbuh_auth_token')}`
  },
  body: JSON.stringify({
    activity_type: 'search',
    details: { query: 'peace' }
  })
});
```

**Fetch History**:
```javascript
const res = await fetch('http://localhost:5000/api/history', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('pbuh_auth_token')}` }
});
const data = await res.json();
console.log(data.history);
```

## 4. Deployment Configuration

**Render / Heroku / Vercel**:
- Add your backend repository to your hosting provider.
- Set the Build Command to `npm install` and Start Command to `node index.js`.
- Add the backend-only variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `APP_SESSION_SECRET` into the environment variables settings of your hosting provider.
