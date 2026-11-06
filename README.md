# RentBridge

A full-stack rental marketplace starter connecting owners and customers looking for rooms/houses. Both account types can post and manage their own property listings.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Authentication: JWT
- Images: local uploads (use persistent storage for production)

## Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` in `frontend/.env` if needed.

The backend expects `MONGODB_URI` and a private `JWT_SECRET` of at least 32 random characters. Copy `backend/.env.example` to `backend/.env` and fill in your own values. Never commit `.env` files.

## Production deployment

Deploy the frontend and API as separate services, or serve both under one HTTPS origin with `/api` and `/uploads` routed to the backend.

1. Use a currently supported Node.js LTS runtime and MongoDB Atlas or another managed MongoDB service. Create a database user with access only to this app's database and restrict database network access to the API service.
2. Configure these backend environment variables in the hosting dashboard: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (a new random secret, at least 32 characters), `CLIENT_ORIGINS` (exact HTTPS frontend origin(s), comma separated), `UPLOAD_DIR` (a persistent disk path), and `PORT` if required by the host. Set `TRUST_PROXY_HOPS=1` only when exactly one trusted reverse proxy sits in front of Express.
3. Build the frontend with `VITE_API_URL=https://your-api-domain.example/api` if the API has a separate domain. For a same-origin reverse proxy, leave it unset so the built app uses `/api`. This value is public and must not contain secrets.
4. Run `npm ci && npm start` in `backend`, and `npm ci && npm run build` in `frontend`; publish `frontend/dist` to a static host. Configure the host's health check to `GET /api/ready` and enable HTTPS.
5. Keep a persistent volume for `UPLOAD_DIR`; local uploaded photos are not suitable for ephemeral instances. The built-in rate limiter is process-local, so use the hosting provider's shared/edge rate limiting before running multiple API instances.

The API limits login and registration attempts, restricts browser origins, validates uploaded image signatures, and requires explicit production secrets/storage configuration. Public listing responses omit exact addresses and poster emails; those details are shared through an accepted contact request.

Listings are currently capped at the newest 100 results. Owners and customers can upload up to five JPG, PNG, or WebP photos (5 MB each) and manage their own listings; files are stored locally in `backend/uploads`, so use persistent storage or a service such as Cloudinary before deploying to ephemeral hosting. Contact requests notify the listing poster, who can accept or decline; accepted requests reveal the poster's email to the requester. Ratings and identity verification are not implemented.
