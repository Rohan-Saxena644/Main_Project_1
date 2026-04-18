# LODGR Phased Implementation Checklist

## Goal

Use this as the execution order for the next phase of work on the `update` branch.

The sequence is optimized for:

- correctness first
- low-risk integration with the current repo
- clear cache redesign after bookings exist
- smooth move from Mongo session store to Redis session store

## Phase 0: Branch And Baseline

- [x] create `update` branch
- [DONE] confirm app still starts on the new branch
- [Kind of Done will re see wih postman later] capture current API behavior for listing read endpoints
- [noted TTl is 5 mins for everything and currently only two main cache keys] note current cache keys and TTL behavior

## Phase 1: Add Booking Domain

### Backend model work

- [</] create `Backend/models/booking.js`
- [</] define booking schema fields
- [x] add indexes for listing/date/status and user booking history
- [x] decide whether to add derived fields to `Listing`

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
- [x] block owner from booking own listing if desired
- [x] implement overlap check for confirmed bookings
- [x] wrap booking create flow in a Mongo transaction
- [x] implement cancel booking flow
- [x] implement paginated `getMyBookings`
- [x] implement paginated `getHostBookings`

### Frontend integration

- [x] decide whether to keep cart-based checkout first or add direct booking
- [x] connect cart checkout button to booking endpoint
- [x] handle booking success and failure states
- [x] clear cart item after success

## Phase 2: Availability And Listing Summary

- [x] add derived availability helper logic
- [x] decide how `bookedTill` should be computed
- [x] show booked state in listing detail
- [x] optionally show booked state in listing cards
- [x] ensure cancelled bookings reopen dates correctly

## Phase 3: Cache Redesign

### Refactor cache utility

- [ ] add centralized cache key helpers
- [ ] replace wildcard invalidation with versioned list cache keys
- [ ] introduce separate detail and availability keys
- [ ] keep TTL values configurable by key type

### Cache keys to implement

- [ ] `listing:detail:<id>`
- [ ] `listing:availability:<id>`
- [ ] `listing:list:v<version>:<filterHash>`
- [ ] `home:featured`

### Controller updates

- [ ] update listing controller to use new detail and list key patterns
- [ ] add availability endpoint and cache layer
- [ ] invalidate cache on booking create and cancel
- [ ] invalidate cache on listing create, update, and delete

### Verification

- [ ] verify cache hit on repeated listing detail requests
- [ ] verify list cache invalidates without `KEYS`
- [ ] verify booking invalidates availability and detail data

## Phase 4: Session Store Migration To Redis

### Dependencies and setup

- [ ] add Redis-backed session store package
- [ ] decide on Redis provider for local and deployed use
- [ ] add `REDIS_URL` to environment setup
- [ ] add Redis service to `docker-compose.yml` if you want local container support

### App changes

- [ ] replace `connect-mongo` session store in `Backend/app.js`
- [ ] keep existing `express-session` configuration where possible
- [ ] verify login, logout, and session timeout behavior
- [ ] verify cookies still work cross-origin

### Multi-instance readiness

- [ ] confirm session persistence across restarts
- [ ] confirm session behavior is safe for future load balancing

## Phase 5: Messaging Foundation

- [ ] create `Conversation` model
- [ ] create `Message` model
- [ ] add message routes and controller
- [ ] allow host-guest conversation per listing
- [ ] optionally attach conversation to booking
- [ ] add unread tracking

## Phase 6: Indexing And Query Performance

- [ ] add listing indexes for common filters
- [ ] add booking indexes for overlap and history queries
- [ ] review regex search and plan upgrade path
- [ ] measure slow queries before and after indexes

## Deferred For Later

- [ ] snapshot fields for booking history UI
- [ ] denormalized booking counters on `User`
- [ ] archival strategy for very old bookings

## Phase 7: Infra And Product Enhancements

- [ ] add image optimization strategy
- [ ] add CDN-backed image delivery
- [ ] add background jobs for email and notifications
- [ ] add rate limiting
- [ ] add load balancer when multiple backend instances exist
- [ ] add URL shortener later

## Suggested Immediate Execution Order

Start with these concrete files first:

1. `Backend/models/booking.js`
2. `Backend/controllers/booking.js`
3. `Backend/routes/booking.js`
4. `Backend/app.js`
5. `Backend/utils/cache.js`
6. `Backend/controllers/listing.js`

Then move to:

1. `Frontend/src/pages/Cart.jsx`
2. `Frontend/src/context/CartContext.jsx`
3. `Frontend/src/pages/ListingDetails.jsx`

## Definition Of Done For The First Milestone

The first milestone is complete when:

- a user can create a booking from the current frontend flow
- overlapping bookings for the same listing are rejected safely
- listing availability updates correctly
- listing cache invalidation happens on booking changes
- sessions are stored in Redis instead of Mongo
