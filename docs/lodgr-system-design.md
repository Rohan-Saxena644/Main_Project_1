# LODGR System Design

## Goal

Provide a clear target architecture for LODGR as it evolves from a listings app into a booking platform with stronger caching, Redis-backed sessions, host-guest messaging, and room for horizontal scaling.

## Current State In This Repo

Frontend:

- React + Vite
- Axios client with session cookies
- cart state in local storage

Backend:

- Node.js + Express
- MongoDB with Mongoose
- Passport session auth
- listing and review APIs
- Redis cache helper for listing reads
- Mongo-backed session store

## Target High-Level Architecture

```txt
Client
  -> Frontend React app
  -> CDN for static assets and listing images

Frontend
  -> API requests to Express backend
  -> optional WebSocket connection for messaging and live booking updates

Backend
  -> Express app instances behind a load balancer
  -> Redis for cache and sessions
  -> MongoDB for persistent data
  -> background jobs for notifications and async tasks

Data
  -> Listings
  -> Users
  -> Reviews
  -> Bookings
  -> Conversations
  -> Messages
  -> Short URLs later
```

## Main Components

### 1. Frontend

Responsibilities:

- browse listings
- search and filter
- show listing detail
- collect booking dates
- show cart or checkout
- show host-guest messages

Useful future additions:

- React Query for client-side request caching
- optimistic UI for messaging
- booking history screens

### 2. API Layer

Responsibilities:

- auth and sessions
- listing read and write APIs
- booking create and cancel APIs
- messaging APIs
- availability checks

Suggested route groups:

- `/api/listings`
- `/api/reviews`
- `/api/bookings`
- `/api/conversations`
- `/api/messages`
- `/api/auth`

### 3. Redis Layer

Redis should be used for:

- listing read cache
- listing availability cache
- session store
- rate limiting data later
- short URL lookup later

Suggested namespaces:

- `session:*`
- `listing:detail:*`
- `listing:availability:*`
- `listing:list:*`
- `booking:quote:*`
- `shorturl:*`

### 4. MongoDB Collections

Existing:

- `users`
- `listings`
- `reviews`

Planned:

- `bookings`
- `conversations`
- `messages`
- `shortlinks` later

## Collection Design Summary

### Users

Keep auth-related user identity here.

Possible future additions:

- avatar
- role
- phone
- host profile metadata

### Listings

Primary listing data:

- title
- description
- images
- price
- location
- country
- geometry
- category
- owner

Optional derived booking summary fields:

- `bookedTill`
- `bookingStatus`

### Reviews

Current review model remains fine and continues to reference listing and author.

### Bookings

Source of truth for reservation logic.

Core fields:

- listing
- guest
- host
- checkInDate
- checkOutDate
- nights
- totalPrice
- status
- paymentStatus

### Conversations

Container for host-guest discussion:

- listing
- booking optional
- participants
- lastMessageAt
- lastMessagePreview

### Messages

Message records tied to a conversation:

- conversation
- sender
- body
- readBy
- createdAt

## Cache Key Design

The current cache helper in this repo is a good start, but the key design should evolve.

### Listing detail

```txt
listing:detail:<listingId>
```

Stores:

- listing document with owner and reviews
- optional derived fields for booked status

TTL:

- 10 to 30 minutes

### Listing availability

```txt
listing:availability:<listingId>
```

Stores:

- booked ranges summary
- bookedTill
- available or unavailable flag
- next available date optional

TTL:

- 30 to 120 seconds

### Listing list results

Use versioned keys:

```txt
listing:list:v<version>:<filterHash>
```

Why:

- cheaper invalidation than deleting many wildcard keys
- safer than Redis `KEYS` in production

Stores:

- paginated list result
- count
- active filters

TTL:

- 2 to 5 minutes

### Home content

```txt
home:featured
```

TTL:

- 5 to 15 minutes

## Cache Invalidation Design

### On listing created

- increment `listing:list:version`
- clear or refresh `home:featured` if affected

### On listing updated

- delete `listing:detail:<id>`
- if visibility in search changed, increment `listing:list:version`
- if availability-related field changed, delete `listing:availability:<id>`

### On listing deleted

- delete `listing:detail:<id>`
- delete `listing:availability:<id>`
- increment `listing:list:version`

### On booking created or cancelled

- delete `listing:availability:<id>`
- delete `listing:detail:<id>` if booked status is shown there
- increment `listing:list:version` only if list results expose availability

## Session Design

Current repo uses `connect-mongo` for sessions.

Target design:

- move sessions to Redis store
- keep `express-session`
- store session data in Redis for better multi-instance behavior

Why:

- better fit once a load balancer is introduced
- faster reads than Mongo for hot session access
- common production pattern

## Request Flow Examples

### Listing detail

1. frontend requests `/api/listings/:id`
2. backend checks `listing:detail:<id>`
3. if hit, return cache
4. if miss, query Mongo, populate owner and reviews, cache response, return JSON

### Booking creation

1. frontend posts booking payload
2. backend validates dates and auth
3. backend checks overlap in a DB transaction
4. backend inserts booking
5. backend updates derived listing booking summary if used
6. backend invalidates availability and detail cache
7. backend returns confirmed booking

### Messaging

1. frontend loads conversation
2. backend loads messages from Mongo
3. optional WebSocket pushes new message to participants

## Performance Upgrades In Recommended Order

1. transactional booking correctness
2. indexes for listings and bookings
3. split cache into detail, availability, and versioned list keys
4. Redis session store
5. CDN and image optimization
6. job queue for emails and notifications
7. load balancer
8. URL shortener

## Nice Future Additions

- rate limiting in Redis
- search suggestions cache
- short-link click analytics
- activity feed for hosts
- background image processing
- read replicas later if traffic ever justifies it
