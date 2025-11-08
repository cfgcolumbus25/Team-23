# Institutes Service

Flask backend for the Institution Update Portal - handles magic link validation and CLEP policy updates.

## Purpose

This service handles the **institution-facing** features from the PRD:

1. **Validate Magic Links** - Verify tokens sent to colleges via email
2. **Fetch Current Policies** - Show colleges their existing CLEP acceptance data
3. **Update Policies** - Accept and save updated CLEP policy information
4. **Mark Tokens as Used** - Ensure one-time or rate-limited token usage

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns service status.

### 2. Verify Token & Get Institution Data
```
POST /institution/verify
Content-Type: application/json

{
  "token": "uuid-string-from-magic-link"
}
```

**Response (200):**
```json
{
  "institution": {
    "id": "uuid",
    "name": "University Name",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipcode": "02101",
    "contact_email": "registrar@university.edu",
    "last_updated": "2024-01-15T10:30:00Z"
  },
  "policies": [
    {
      "exam_code": "ENGL_101",
      "cut_score": 50,
      "credits_awarded": 3,
      "notes": "Must be taken before enrollment"
    }
  ],
  "token_id": "uuid"
}
```

### 3. Update Institution Policies
```
POST /institution/update
Content-Type: application/json

{
  "token": "uuid-string-from-magic-link",
  "verified_by": "registrar@university.edu",
  "policies": [
    {
      "exam_code": "ENGL_101",
      "cut_score": 50,
      "credits_awarded": 3,
      "notes": "Optional notes"
    },
    {
      "exam_code": "MATH_141",
      "cut_score": 55,
      "credits_awarded": 4
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Policies updated successfully",
  "institution_id": "uuid"
}
```

### 4. Get Institution Details
```
GET /institution/<institution_id>
```

Returns institution info and policies (used for confirmation page).

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5001
```

### 3. Run the Service
```bash
python app.py
```

Service runs on `http://localhost:5001`

## Database Tables Used

- `magic_tokens` - Token validation and tracking
- `institutions` - College information
- `institution_policies` - CLEP acceptance policies

## Token Security Features

✅ **Expiration Check** - Tokens expire after 7 days  
✅ **Single-Use Enforcement** - Tokens marked as used after update  
✅ **Validation** - Invalid/expired tokens return 401/404  

## Next Steps

The **admin service** (separate backend) will handle:
- Generating magic tokens
- Sending bulk emails to institutions
- Tracking outreach campaigns
- Analytics dashboard

## Testing

Test the verify endpoint:
```bash
curl -X POST http://localhost:5001/institution/verify \
  -H "Content-Type: application/json" \
  -d '{"token": "your-test-token"}'
```

