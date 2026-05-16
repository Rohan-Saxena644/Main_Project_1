# LODGR

LODGR is a full-stack accommodation listing and booking platform inspired by Airbnb, built to move beyond a demo marketplace into a real reservation system.

Users can browse stays, search and filter listings, add listings to a cart with selected dates, confirm bookings, cancel bookings, write reviews, manage their own listings, and view booking history from their profile.

The project also includes infrastructure-focused backend work such as Redis-backed caching, Redis-ready session storage, rate limiting, paginated listing feeds, indexed MongoDB queries, and booking overlap protection.

## Live Project Focus

LODGR was built to demonstrate:

- full-stack product thinking, not just CRUD screens
- booking correctness with overlap prevention
- caching and invalidation design
- pagination and indexing for query performance
- rate limiting and session architecture for production-style readiness

## Core Features

### Listings

- create, edit, and delete listings
- upload multiple listing images through Cloudinary
- category-based browsing
- text and regex-backed search
- public owner profile pages
- map view for listing location with Mapbox

### Booking System

- date-based booking flow from the cart
- booking overlap checks to prevent double-booking
- owner cannot book their own listing
- automatic price calculation from nights selected
- booking history for guests
- host-side booking visibility
- booking cancellation flow
- derived availability summary on listings

### Reviews

- authenticated users can create reviews
- users can delete only their own reviews
- listing detail cache invalidation after review writes so the UI stays fresh

### Auth And Sessions

- local username/password auth with Passport
- protected routes for listing creation, editing, booking history, and profile
- session-based authentication with Redis-ready session storage
- environment-aware cookie handling for localhost and production

### Performance And Infra

- Redis cache-aside design for listing reads
- versioned list cache invalidation instead of wildcard `KEYS`
- paginated listing feed
- MongoDB indexes for listings and bookings
- text-search-first listing search with regex fallback
- request rate limiting with optional Redis-backed limiter storage

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Mapbox GL

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Passport.js
- express-session
- Joi validation
- Multer + Cloudinary
- Redis + ioredis
- express-rate-limit

### Optional Service Integrations

- Upstash or Redis Cloud for hosted Redis
- Cloudinary for image hosting
- Mapbox for geocoding and maps
- Gemini API for AI-assisted search

## Architecture Highlights

### 1. Booking Correctness

The booking flow is the strongest backend feature in the project.

A booking is only confirmed after the backend:

- validates check-in and check-out dates
- computes nights and total price
- checks whether the current user is the listing owner
- checks for overlapping confirmed bookings
- creates the booking inside a Mongo transaction
- refreshes derived availability state
- invalidates relevant listing caches

This turns LODGR from a listings showcase into a working reservation platform.

### 2. Cache Design

Listing reads use a cache-aside strategy with Redis.

Implemented cache namespaces include:

- `listing:detail:<id>`
- `listing:availability:<id>`
- `listing:list:v<version>:<filterHash>`
- `home:featured`

List cache invalidation uses a version bump approach so old keys expire naturally instead of scanning Redis with wildcard deletion.

### 3. Query Performance

The project includes:

- listing indexes for category, owner, location, availability helpers, and geo support
- booking indexes for overlap checks and booking history
- paginated listing APIs
- text-search-first queries with regex fallback
- slow-query timing helper for backend query review

### 4. Rate Limiting

The backend uses route-aware rate limiting for:

- auth endpoints
- AI search endpoints
- write-heavy actions like bookings and listing mutations
- general read traffic

When Redis is configured, rate-limit state can also be stored in Redis.

## Project Structure

```txt
Project-1-finale/
  Backend/
    controllers/
    models/
    routes/
    utils/
    middleware.js
    app.js
  Frontend/
    src/
      components/
      context/
      pages/
      api/
  docs/
    booking-messaging-design.md
    implementation-checklist.md
    lodgr-system-design.md
  docker-compose.yml
```

## Important Backend Models

### Listing

Stores:

- title, description, images
- price, location, country
- geometry
- category
- owner
- derived fields such as `bookedTill`, `bookingStatus`, `activeBookingCount`

### Booking

Stores:

- listing
- guest
- host
- check-in/check-out dates
- nights
- price per night
- total price
- booking code
- status
- cancellation metadata

### Review

Stores:

- rating
- comment
- author
- relationship to a listing

## API Overview

### Auth

- `POST /api/signup`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/current-user`
- `GET /api/profile`
- `GET /api/profile/:username`

### Listings

- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`

### Reviews

- `POST /api/listings/:id/reviews`
- `DELETE /api/listings/:id/reviews/:reviewId`

### Bookings

- `POST /api/bookings`
- `GET /api/bookings/me`
- `GET /api/bookings/host`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings/availability/:listingId`

### AI Search

- `POST /api/ai/search`

## Local Development

### 1. Clone and install

Backend:

```bash
cd Backend
npm install
```

Frontend:

```bash
cd Frontend
npm install
```

### 2. Configure environment variables

#### Backend `.env`

Typical variables used by this project:

```env
ATLASDB_URL=your_mongodb_connection_string
SECRET=your_session_secret
MAP_TOKEN=your_mapbox_token
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
REDIS_URL=your_redis_connection_string_optional
GEMINI_API_KEY=your_gemini_key_optional
NODE_ENV=development
```

#### Frontend `.env.local`

```env
VITE_API_URL=http://localhost:8080/api
VITE_MAP_TOKEN=your_mapbox_public_token
```

### 3. Start the apps

Backend:

```bash
cd Backend
node app.js
```

Frontend:

```bash
cd Frontend
npm run dev
```

## Docker

A `docker-compose.yml` file is included for local multi-service setup.

It can be used to run:

- frontend
- backend
- Redis

Example:

```bash
docker compose up --build
```

## Redis Setup

For local development, Redis is optional.

If `REDIS_URL` is not configured:

- listing cache falls back to disabled mode
- session storage falls back safely to Mongo-backed session storage
- rate limiting falls back to in-memory storage

For deployment, a hosted Redis provider such as Upstash or Redis Cloud is recommended.

## Deployment Notes

### Recommended services

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Redis: Upstash or Redis Cloud
- Images: Cloudinary

### Production environment variables

Set the backend `REDIS_URL` when deploying if you want:

- active Redis listing cache
- Redis-backed rate limiting
- Redis-backed session storage

## What Makes This Project Strong

This project is no longer just a property listing UI.

It solves real backend and product problems:

- users can actually reserve stays
- double-booking is prevented
- bookings affect listing availability
- booking history and cancellation exist
- reviews and listing details stay coherent with cache invalidation
- the listing feed is paginated and query-aware
- the backend includes Redis, rate limiting, and indexing work that reflects production-style thinking

## Documentation In Repo

Additional design notes live in:

- [docs/implementation-checklist.md](docs/implementation-checklist.md)
- [docs/lodgr-system-design.md](docs/lodgr-system-design.md)
- [docs/booking-messaging-design.md](docs/booking-messaging-design.md)

## Future Improvements

Potential next steps:

- image optimization pipeline
- CDN-backed image delivery
- background jobs for notifications and emails
- richer booking-history snapshots
- archival strategy for older bookings
- load balancing once multiple backend instances are needed
- URL shortener for listing sharing

## Author Note

LODGR was built as a portfolio project with a strong focus on evolving a marketplace UI into a more realistic booking platform with meaningful backend depth.

## Key Engineering Challenges Solved

- designed a booking flow that prevents overlapping reservations through backend validation and transactional writes
- moved listing reads beyond basic CRUD by introducing Redis-backed cache-aside patterns with targeted invalidation
- replaced broad cache clearing with versioned list-cache invalidation for safer scaling behavior
- added paginated listing feeds and booking-history endpoints to keep large result sets manageable
- improved search performance with MongoDB text indexes plus regex fallback for broader matching
- added route-aware rate limiting with Redis-ready backing to protect auth, booking, and write-heavy endpoints
- built session handling to work cleanly across localhost and production while staying Redis-ready for multi-instance deployment
