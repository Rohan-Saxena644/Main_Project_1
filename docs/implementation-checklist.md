# LODGR Phased Implementation Checklist

## Goal

Use this checklist to track the completed booking, availability, caching, session, and query-performance work on the `update` branch.

The sequence followed this order:

- correctness first
- booking domain before cache redesign
- availability-aware invalidation after bookings existed
- Redis-backed infra before final performance cleanup

## Phase 0: Branch And Baseline

- [x] create `update` branch
- [x] keep app working on the new branch while developing features
- [x] document the original cache shape and TTL limitations before redesign
- [x] keep a phased execution plan in `docs/`

## Phase 1: Add Booking Domain

### Backend model work

- [x] create `Backend/models/booking.js`
- [x] define booking schema fields
- [x] add indexes for listing/date/status and user booking history
- [x] add derived availability helper fields to `Listing`

### Backend API work

- [x] create `Backend/controllers/booking.js`
- [x] create `Backend/routes/booking.js`
- [x] register booking routes in `Backend/app.js`
- [x] add validation middleware for booking payloads
- [x] add pagination support for booking history endpoints

### Booking logic

- [x] validate `checkInDate` and `checkOutDate`
- [x] compute `nights`
- [x] compute total price from listing price and selected nights
- [x] block owner from booking own listing
- [x] implement overlap check for confirmed bookings
- [x] wrap booking create flow in a Mongo transaction
- [x] implement cancel booking flow
- [x] implement paginated `getMyBookings`
- [x] implement paginated `getHostBookings`

### Frontend integration

- [x] keep cart-based checkout as the first booking flow
- [x] connect cart checkout button to booking endpoint
- [x] handle booking success and failure states
- [x] clear successful cart items after booking
- [x] add profile booking history section with cancel action

## Phase 2: Availability And Listing Summary

- [x] add derived availability helper logic
- [x] compute `bookedTill` from active confirmed bookings
- [x] show booked state in listing detail
- [x] show booked state in listing cards
- [x] ensure cancelled bookings reopen dates correctly
- [x] prevent unavailable date ranges from being added to cart
- [x] keep cart badge scoped to the authenticated user

## Phase 3: Cache Redesign

### Refactor cache utility

- [x] add centralized cache key helpers
- [x] replace wildcard invalidation with versioned list cache keys
- [x] introduce separate detail and availability keys
- [x] keep TTL values configurable by key type

### Cache keys implemented

- [x] `listing:detail:<id>`
- [x] `listing:availability:<id>`
- [x] `listing:list:v<version>:<filterHash>`
- [x] `home:featured`

### Controller updates

- [x] update listing controller to use new detail and list key patterns
- [x] add availability endpoint and cache layer
- [x] invalidate cache on booking create and cancel
- [x] invalidate cache on listing create, update, and delete

### Code-level verification

- [x] remove `KEYS`-based invalidation from the cache flow
- [x] centralize list invalidation through version bumping
- [x] target detail, availability, and list invalidation from booking events

## Phase 4: Session Store Migration To Redis

### Dependencies and setup

- [x] add Redis-backed session storage implementation
- [x] decide on Redis provider strategy for local and deployed use
- [x] add `REDIS_URL` to environment setup
- [x] add Redis service to `docker-compose.yml` for local container support

### App changes

- [x] replace Mongo-first session storage with Redis-backed session storage in `Backend/app.js`
- [x] keep existing `express-session` configuration where possible
- [x] preserve environment-aware cookie behavior for localhost and production
- [x] keep a safe Mongo fallback only when Redis is not configured

### Multi-instance readiness

- [x] move session state out of per-process memory and out of Mongo-backed session documents
- [x] align session storage with future load-balancer readiness

## Phase 6: Indexing And Query Performance

- [x] add listing indexes for common filters and owner views
- [x] keep booking indexes for overlap and history queries
- [x] upgrade search path from regex-only to text-search-first with regex fallback
- [x] add slow-query timing instrumentation for controller-level query review

## Deferred For Later

- [ ] snapshot fields for booking history UI
- [ ] denormalized booking counters on `User`
- [ ] archival strategy for very old bookings

## Phase 7: Infra And Product Enhancements

- [ ] add image optimization strategy
- [ ] add CDN-backed image delivery
- [ ] add background jobs for email and notifications
- [ ] add load balancer when multiple backend instances exist
- [ ] add URL shortener later

## Manual Smoke Pass Still Worth Doing

- [ ] test cache hits with Redis running locally
- [ ] test login persistence across backend restart with Redis running
- [ ] test booking create and cancel once through the deployed stack after merge

## Definition Of Done For The Current Milestone

The current milestone is complete when:

- a user can create a booking from the current frontend flow
- overlapping bookings for the same listing are rejected safely
- listing availability updates correctly
- unavailable dates cannot be added to cart
- booking history is visible from profile
- listing cache invalidation happens on booking and listing changes
- sessions are stored through Redis-backed session storage
