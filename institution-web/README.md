# Institution Web Portal

Frontend for institutions to manage their CLEP exam acceptance policies.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Variables

Create a `.env.local` file in the root of this directory:

```env
# Institution Backend API
NEXT_PUBLIC_API_URL=http://localhost:5001

# Supabase (if needed for direct client access)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001)

## Routes

- `/` - Home page with login/signup links
- `/login` - Institution login
- `/signup` - Institution signup
- `/manage` - Policy management (requires authentication)

## API Integration

The frontend connects to the institution backend API at `http://localhost:5001`

All API calls use the client in `app/lib/api.ts`:
- Login/Signup authentication
- JWT token management
- CLEP acceptance CRUD operations

## Features

- ✅ Institution authentication (login/signup)
- ✅ Secure JWT token storage
- ✅ Policy management interface
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive design

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- React 19

## Development

### Run from Root

```bash
# From Team-23/ root
npm run dev:institution-web
```

Or use the combined command:

```bash
# Run institution frontend + backend together
npm run dev:institution
```
