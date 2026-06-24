# Creator Card Microservice API

A REST API microservice that allows creators to publish shareable profile cards showcasing their links and service rates.

Built as part of the **Resilience 17 Venture Studio** Backend Engineer Assessment.

---

## Base URL

```
https://creator-4t4y.onrender.com
```

---

## Tech Stack

- **Runtime:** Node.js (Vanilla JavaScript)
- **Framework:** Express.js (via project template)
- **Database:** MongoDB Atlas
- **Deployment:** Render
- **ID Generation:** ULID

---

## Endpoints

### 1. Create Creator Card

```
POST /creator-cards
```

**Request Body:**
```json
{
  "title": "George Cooks",
  "description": "George Cooks is a weekly cooking podcast by Chef George AmadiObi",
  "slug": "george-cooks",
  "creator_reference": "crt_8f2k1m9x4p7w3q5z",
  "links": [
    { "title": "YouTube Channel", "url": "https://youtube.com/@georgecooks" },
    { "title": "Instagram", "url": "https://instagram.com/georgecooks" }
  ],
  "service_rates": {
    "currency": "NGN",
    "rates": [
      { "name": "IG Story Post", "description": "One Instagram story mention", "amount": 5000000 }
    ]
  },
  "status": "published",
  "access_type": "public"
}
```

**Success Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Creator Card Created Successfully.",
  "data": { ... }
}
```

---

### 2. Retrieve Creator Card

```
GET /creator-cards/:slug
```

For private cards, supply the access code as a query parameter:

```
GET /creator-cards/:slug?access_code=A1B2C3
```

**Success Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Creator Card Retrieved Successfully.",
  "data": { ... }
}
```

---

### 3. Delete Creator Card

```
DELETE /creator-cards/:slug
```

**Request Body:**
```json
{
  "creator_reference": "crt_8f2k1m9x4p7w3q5z"
}
```

**Success Response (HTTP 200):**
```json
{
  "status": "success",
  "message": "Creator Card Deleted Successfully.",
  "data": { ... }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `SL02` | 400 | Slug is already taken |
| `AC01` | 400 | access_code required when access_type is private |
| `AC05` | 400 | access_code cannot be set on public cards |
| `NF01` | 404 | Creator card not found |
| `NF02` | 404 | Card exists but is in draft status |
| `AC03` | 403 | Private card requires access code |
| `AC04` | 403 | Invalid access code |

---

## Business Rules

- `slug` is auto-generated from `title` if not provided
- If a provided `slug` is already taken, `SL02` is returned
- Draft cards are never retrievable via the public endpoint
- `access_code` is returned in create/delete responses but never in retrieval
- All MongoDB `_id` fields are serialized as `id` in API responses
- Deleted cards are soft-deleted and no longer retrievable
- Request body keys are case-insensitive (normalized to lowercase)

---

## Project Structure

```
├── endpoints/
│   └── creator-cards/
│       ├── create-card.js       # POST /creator-cards
│       ├── retrieve-card.js     # GET  /creator-cards/:slug
│       └── delete-card.js       # DELETE /creator-cards/:slug
├── services/
│   └── creator-cards/
│       ├── create.js       # Create business logic
│       ├── retrieve.js     # Retrieve business logic
│       └── delete.js       # Delete business logic
├── models/
│   ├── creator-card.js     # MongoDB schema
│   └── index.js
├── core/
│   └── validator/          # Extended VSL validator
│       ├── constants.js    # Added min-length, max-length, enum rules
│       └── ...
└── app.js
```

---

## Validator Extensions

The template's VSL validator was extended to support:

- `has min length of N` — minimum string length
- `has max length of N` — maximum string length
- `is one of: A, B, C` — enum validation

These additions follow the existing framework patterns and do not break any existing functionality.

---

## Setup & Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/node-template.git
cd node-template

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your MongoDB connection string to .env

# Start the server
npm start
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 8811) |
| `MONGODB_URI` | MongoDB Atlas connection string |

---

## Additional Notes

- No authentication required on any endpoint
- All endpoints live at the root — no `/api/v1` versioning
- Malformed JSON bodies return HTTP 400 gracefully
- Request body keys are normalized to lowercase automatically
