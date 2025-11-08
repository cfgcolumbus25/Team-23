# Institution Service API

Flask backend for Institution Portal - handles both **persistent login accounts** and **magic link** access for institutions to manage their CLEP policies.

## 🎯 Purpose

This service provides **TWO ways** for institutions to manage their CLEP policies:

1. **Persistent Login Accounts** (Recommended)
   - Create account and login anytime
   - Full CRUD operations on policies
   - No waiting for magic links
2. **Magic Links** (Legacy/Fallback)
   - One-time access via email
   - No account needed
   - Option to create account after submission

## 🏗️ Architecture

### Authentication: Supabase Auth

- All password hashing, JWT tokens, session management handled by Supabase
- No custom password logic needed
- Built-in security features

### Database Tables

- `institutions` - College/university information
- `institution_members` - Links Supabase Auth users to institutions
- `acceptances` - CLEP exam acceptance policies
- `exams` - Master list of 38 CLEP exams
- `contacts` - Institution contact information
- `magic_tokens` - One-time access tokens

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5001
```

### 3. Run Database Migration

Apply migration to create `institution_members` table:

```bash
# Copy SQL from migrations/001_create_institution_users.sql
# Paste into Supabase SQL Editor and run
```

### 4. Seed Test Data

```bash
# Seed institutions, exams, contacts (if not done)
python scripts/seed_data.py

# Create test institution user accounts
python scripts/seed_institution_users.py
```

This creates test accounts:

- `admin@sunybuffalo.edu` / `TestPass123!`
- `registrar@ohio.edu` / `TestPass123!`
- `admin@brandeis.edu` / `TestPass123!`

### 5. Run API Server

```bash
python app.py
```

Server runs on `http://localhost:5001`

### 6. Test the API

```bash
python test_api.py
```

## 📚 API Documentation

See [INSTITUTION_API.md](./INSTITUTION_API.md) for complete API documentation including:

- All endpoints
- Request/response examples
- Authentication flow
- Frontend integration examples
- cURL test commands

## 🔑 Key Endpoints

### Authentication

- `POST /auth/signup` - Create institution account
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user info

### Policy Management (Authenticated)

- `GET /institution/policies` - Get my policies
- `POST /institution/policies` - Add new policy
- `PUT /institution/policies/{id}` - Update policy
- `DELETE /institution/policies/{id}` - Delete policy

### Magic Links (No Auth)

- `POST /magic/verify` - Verify magic token
- `POST /magic/update` - Update via magic link (with optional account creation)

## 🔒 Security Features

✅ **Supabase Auth** - Industry-standard authentication  
✅ **JWT Tokens** - Secure session management  
✅ **Row-Level Security** - Database-level access control  
✅ **Role-Based Permissions** - Admin, Editor, Viewer roles  
✅ **Token Expiration** - Magic links expire in 7 days  
✅ **Single-Use Tokens** - Prevents replay attacks

## 👥 User Roles

| Role     | View Policies | Add/Edit | Delete |
| -------- | ------------- | -------- | ------ |
| `viewer` | ✅            | ❌       | ❌     |
| `editor` | ✅            | ✅       | ❌     |
| `admin`  | ✅            | ✅       | ✅     |

## 📖 User Flows

### Flow 1: New Institution Creates Account

```
1. Visit portal → Click "Create Account"
2. Select institution from dropdown
3. Enter email, password, name, title
4. Account created → Auto-logged in
5. Manage policies immediately
```

### Flow 2: Magic Link → Account Creation

```
1. Receive magic link email
2. Click link → Update policies
3. After submit: "Create account to manage anytime?"
4. Enter password → Account created
5. Next time: Login directly (no magic link)
```

### Flow 3: Existing User Login

```
1. Visit portal → Login
2. View current policies
3. Add/edit/delete policies anytime
```

## 🧪 Testing

### Manual Testing with cURL

**Login:**

```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@sunybuffalo.edu", "password": "TestPass123!"}'
```

**Get Policies:**

```bash
curl -X GET http://localhost:5001/institution/policies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Add Policy:**

```bash
curl -X POST http://localhost:5001/institution/policies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exam_id": 14, "cut_score": 50, "credits": 3}'
```

### Automated Testing

```bash
python test_api.py
```

## 📁 Project Structure

```
backend/institutes/
├── app.py                        # Main API (accounts + magic links)
├── supabase_client.py           # Supabase connection
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── INSTITUTION_API.md           # Full API documentation
├── migrations/
│   └── 001_create_institution_users.sql
├── scripts/
│   ├── seed_data.py            # Seed institutions/exams
│   └── seed_institution_users.py  # Create test accounts
└── test_api.py                  # API test suite
```

## 🔄 Migration from Old System

If you have existing magic link code, both systems work side-by-side:

- Old magic link endpoints still work (`/institution/verify`, `/institution/update`)
- New account endpoints available (`/auth/*`, `/institution/policies`)
- Institutions can gradually transition to accounts

## 🚧 Next Steps

- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add multi-user support per institution
- [ ] Add audit logging for policy changes
- [ ] Add analytics dashboard for institutions

## 💡 Tips

1. **For Development:** Use test accounts from `seed_institution_users.py`
2. **For Production:** Have institutions create accounts via signup flow
3. **Token Management:** Magic links expire in 7 days - remind institutions to use quickly
4. **Permissions:** First user for an institution gets `admin` role automatically

## 📞 Support

For questions or issues, see:

- [Full API Documentation](./INSTITUTION_API.md)
- [Product Requirements Doc](../../docs/PRD.md)
- Test with `python test_api.py` to verify setup
