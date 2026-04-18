# Booking And Messaging Design

## Goal

Add a production-friendly booking model to LODGR that prevents double booking, supports a "booked till" UI state, and leaves room for host-guest messaging tied to listings and bookings.

This design is based on the current repo:

- listings already exist in `Backend/models/listing.js`
- auth is session-based with Passport
- cart items already carry `checkInDate`, `checkOutDate`, `nights`, and pricing in `Frontend/src/pages/Cart.jsx`
- there is no booking model yet
- there is no messaging model yet

## Proposed Backend Structure

Add these files:

- `Backend/models/booking.js`
- `Backend/models/conversation.js`
- `Backend/models/message.js`
- `Backend/controllers/booking.js`
- `Backend/controllers/message.js`
- `Backend/routes/booking.js`
- `Backend/routes/message.js`

Optional later:

- `Backend/utils/availability.js`
- `Backend/utils/cacheKeys.js`

## Booking Model

Use a dedicated `Booking` collection as the source of truth.

Suggested fields:

```js
{
  listing: ObjectId,        // ref Listing
  guest: ObjectId,          // ref User
  host: ObjectId,           // ref User, copied from listing.owner
  checkInDate: Date,
  checkOutDate: Date,
  nights: Number,
  pricePerNight: Number,
  subtotal: Number,
  fees: Number,
  taxes: Number,
  totalPrice: Number,
  status: String,           // pending | confirmed | cancelled | expired
  paymentStatus: String,    // unpaid | pending | paid | refunded
  bookingCode: String,      // human-friendly code for UI
  cancelledAt: Date,
  cancellationReason: String
}
```

Recommended rules:

- `checkOutDate` must be later than `checkInDate`
- only `confirmed` bookings block availability
- `pending` can be introduced later if you add payment holds
- `host` should be copied at booking creation time for simpler queries

## Listing Model Changes

Do not store booking truth directly on the listing.

Keep bookings in the `Booking` collection, and only add derived summary fields to listing if you want faster reads:

```js
{
  bookedTill: Date,
  bookingStatus: String,    // available | booked
  activeBookingCount: Number
}
```

These fields are optional denormalized helpers. They should be updated from booking events, not treated as the source of truth.

## Booking Availability Logic

The overlap rule should be:

```txt
requestedCheckIn < existingCheckOut
AND
requestedCheckOut > existingCheckIn
```

A booking request must:

1. start a DB transaction
2. query the `Booking` collection for overlapping `confirmed` bookings for the same listing
3. reject if overlap exists
4. create the new booking if none exists
5. update derived listing booking summary if you keep one
6. commit the transaction
7. invalidate cache for availability and listing detail

Important:

- cache can help display likely availability
- only the DB transaction decides final booking success

## Booking API Design

Suggested routes:

- `GET /api/bookings/me`
- `GET /api/bookings/host`
- `GET /api/bookings/:id`
- `POST /api/bookings`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/listings/:id/availability?checkIn=...&checkOut=...`

Suggested request shape for `POST /api/bookings`:

```json
{
  "listingId": "listingObjectId",
  "checkInDate": "2026-05-01",
  "checkOutDate": "2026-05-04"
}
```

Suggested response:

```json
{
  "message": "Booking confirmed",
  "booking": {
    "_id": "bookingObjectId",
    "listing": "listingObjectId",
    "guest": "userObjectId",
    "host": "hostObjectId",
    "checkInDate": "2026-05-01T00:00:00.000Z",
    "checkOutDate": "2026-05-04T00:00:00.000Z",
    "nights": 3,
    "totalPrice": 12000,
    "status": "confirmed"
  }
}
```

## Booking Controller Responsibilities

`booking.js` should handle:

- validating dates
- loading listing and host
- calculating nights and pricing
- overlap checking in a transaction
- creating booking
- updating denormalized listing booking fields
- invalidating related cache keys

Recommended controller functions:

- `createBooking`
- `getMyBookings`
- `getHostBookings`
- `getBookingById`
- `cancelBooking`
- `getListingAvailability`

## Booking Authorization Rules

- only logged-in users can create bookings
- listing owner cannot book their own listing unless you explicitly want to allow it
- guest can view their own booking
- host can view bookings for listings they own
- only guest or host should be allowed to cancel according to your product rules

## Frontend Booking Flow

Current cart flow already provides a good starting point.

Suggested flow:

1. user adds listing with selected dates to cart
2. cart page shows date range and total
3. checkout calls `POST /api/bookings`
4. backend confirms or rejects based on transaction-safe overlap check
5. frontend clears the cart item on success
6. listing page shows updated booked state

Optional improvement:

- skip cart for single listing checkout and allow direct booking from listing detail page

## Messaging Model

Keep messaging separate from booking, but let it optionally reference a booking.

### Conversation

Suggested fields:

```js
{
  listing: ObjectId,        // ref Listing
  booking: ObjectId,        // optional ref Booking
  participants: [ObjectId], // guest and host
  lastMessageAt: Date,
  lastMessagePreview: String,
  createdBy: ObjectId
}
```

### Message

Suggested fields:

```js
{
  conversation: ObjectId,   // ref Conversation
  sender: ObjectId,         // ref User
  body: String,
  readBy: [ObjectId],
  messageType: String,      // text | system
  createdAt: Date
}
```

## Messaging Product Rules

- only listing host and guest can participate
- pre-booking inquiry can exist with `booking = null`
- once a booking is confirmed, messages can remain attached to the same conversation or move to a booking-linked conversation
- system messages can be inserted on key events, for example:
  - "Booking confirmed"
  - "Booking cancelled"

## Messaging API Design

Suggested routes:

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `PATCH /api/conversations/:id/read`

Suggested `POST /api/conversations` request:

```json
{
  "listingId": "listingObjectId"
}
```

Backend behavior:

- if a host-guest conversation already exists for that listing, return it
- otherwise create a new one

## Recommended Indexes

### Booking indexes

- `{ listing: 1, checkInDate: 1, checkOutDate: 1, status: 1 }`
- `{ guest: 1, createdAt: -1 }`
- `{ host: 1, createdAt: -1 }`

### Conversation indexes

- `{ participants: 1, lastMessageAt: -1 }`
- `{ listing: 1, booking: 1 }`

### Message indexes

- `{ conversation: 1, createdAt: 1 }`

## Build Order For This Design

1. add `Booking` model
2. add booking routes and controller
3. add booking overlap validation and transaction handling
4. add listing derived booking summary fields if desired
5. add conversation and message models
6. add messaging routes and controller
7. add real-time delivery later with WebSockets

## Why This Fits LODGR

This design keeps the system correct first:

- bookings are authoritative
- listing booked state is derived
- messaging is cleanly separated
- the frontend cart can evolve into checkout without needing a rewrite
