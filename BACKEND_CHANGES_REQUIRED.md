# Backend Changes Required for JWT Authentication

## Overview
The frontend now uses JWT-based authentication with user ID extraction from the token. All member portal endpoints must be scoped to the authenticated user's `_id`.

---

## 1. Authentication Changes

### Login Endpoint: `POST /api/v1/members/login`

**Current Response (assumed):**
```json
{
  "data": {
    "_id": "...",
    "membershipId": "...",
    "repName": "...",
    ...
  }
}
```

**Required Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "membershipId": "...",
    "repName": "...",
    ...
  }
}
```

**JWT Payload Must Include:**
```json
{
  "_id": "user_object_id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware: JWT Verification
Create a middleware to verify JWT on protected routes:

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id; // Attach user ID to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
```

---

## 2. API Endpoint Changes

All endpoints below must be protected with `authMiddleware` and filter data by `req.userId`.

### Subscriptions

**Endpoint:** `GET /api/v1/subscriptions/get-subscription/:userId`

**Change:** Replace `:userId` param with `req.userId` from JWT:
```javascript
router.get('/get-subscription', authMiddleware, async (req, res) => {
  const subscription = await Subscription.findOne({ userId: req.userId });
  res.json({ data: subscription });
});
```

---

### Documents

**1. Get Documents**
- **Old:** `GET /api/v1/member/documents/get-documents/:membershipId`
- **New:** `GET /api/v1/member/documents/get-documents-by-user/:userId`

```javascript
router.get('/get-documents-by-user', authMiddleware, async (req, res) => {
  const documents = await Document.find({ userId: req.userId });
  res.json({ data: documents });
});
```

**2. Create Document**
- **Old:** Expects `membershipId` in body
- **New:** Use `req.userId` from JWT

```javascript
router.post('/create-document', authMiddleware, upload.array('files'), async (req, res) => {
  const document = await Document.create({
    ...req.body,
    userId: req.userId, // From JWT, not body
    files: req.files.map(f => f.path)
  });
  res.json({ data: document });
});
```

**3. Delete Document**
- **Old:** `DELETE /api/v1/member/documents/delete-document/:id?membershipId=...`
- **New:** `DELETE /api/v1/member/documents/delete-document/:id?userId=...`

```javascript
router.delete('/delete-document/:id', authMiddleware, async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
  if (!document) return res.status(404).json({ message: 'Document not found' });
  
  await document.deleteOne();
  res.json({ message: 'Document deleted' });
});
```

---

### Ad Bookings

**1. Get Bookings**
- **Old:** `GET /api/v1/ad-bookings/get-all` (returns all bookings)
- **New:** `GET /api/v1/ad-bookings/get-by-user/:userId`

```javascript
router.get('/get-by-user', authMiddleware, async (req, res) => {
  const bookings = await AdBooking.find({ userId: req.userId });
  res.json({ data: bookings });
});
```

**2. Create Booking**
- **Old:** No user association
- **New:** Attach `userId` from JWT

```javascript
router.post('/create', authMiddleware, async (req, res) => {
  const booking = await AdBooking.create({
    ...req.body,
    userId: req.userId // From JWT
  });
  res.json({ data: booking });
});
```

---

### Help Desk / Tickets

**1. Get Tickets**
- **Old:** `GET /api/v1/tickets/get-tickets` (returns all tickets)
- **New:** `GET /api/v1/tickets/get-tickets-by-user/:userId`

```javascript
router.get('/get-tickets-by-user', authMiddleware, async (req, res) => {
  const tickets = await Ticket.find({ userId: req.userId });
  res.json(tickets);
});
```

**2. Create Ticket**
- **Old:** No user association
- **New:** Attach `userId` from JWT

```javascript
router.post('/create-ticket', authMiddleware, upload.array('files'), async (req, res) => {
  const ticket = await Ticket.create({
    ...req.body,
    userId: req.userId, // From JWT
    attachments: req.files?.map(f => f.path) || []
  });
  res.json({ data: ticket });
});
```

**3. Get Single Ticket**
```javascript
router.get('/get-ticket/:id', authMiddleware, async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.userId });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  res.json(ticket);
});
```

**4. Add Message to Ticket**
```javascript
router.post('/add-message/:ticketId', authMiddleware, upload.array('files'), async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.ticketId, userId: req.userId });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  
  ticket.messages.push({
    sender: req.body.sender,
    text: req.body.text,
    attachments: req.files?.map(f => f.path) || []
  });
  await ticket.save();
  res.json(ticket);
});
```

---

## 3. Database Schema Updates

### Add `userId` field to all member-scoped collections:

**Subscriptions:**
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  membershipId: String,
  // ... other fields
}
```

**Documents:**
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  membershipId: String, // Keep for display purposes
  // ... other fields
}
```

**AdBookings:**
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  company: String,
  // ... other fields
}
```

**Tickets:**
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  ticketId: String,
  subject: String,
  // ... other fields
}
```

---

## 4. Environment Variables

Add to `.env`:
```
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRES_IN=7d
```

---

## 5. Testing Checklist

- [ ] Login returns JWT token in response
- [ ] JWT payload contains `_id` field
- [ ] All protected routes verify JWT and return 401 if invalid
- [ ] Subscriptions endpoint filters by `req.userId`
- [ ] Documents endpoints filter by `req.userId`
- [ ] Ad bookings endpoints filter by `req.userId`
- [ ] Tickets endpoints filter by `req.userId`
- [ ] Socket.io events are scoped to user's tickets only

---

## 6. Migration Script (if existing data)

If you have existing data without `userId`, run this migration:

```javascript
// migration.js
const Member = require('./models/Member');
const Document = require('./models/Document');
const AdBooking = require('./models/AdBooking');
const Ticket = require('./models/Ticket');

async function migrate() {
  // Documents: map membershipId -> userId
  const members = await Member.find({});
  for (const member of members) {
    await Document.updateMany(
      { membershipId: member.membershipId },
      { $set: { userId: member._id } }
    );
    
    // Similar for other collections...
  }
  
  console.log('Migration complete');
}

migrate();
```

---

## Summary

**Frontend changes (already done):**
- ✅ JWT stored in localStorage
- ✅ JWT attached to all requests via axios interceptor
- ✅ User `_id` extracted from JWT payload
- ✅ All member pages use `_id` for API calls
- ✅ Auto-logout on 401 response

**Backend changes (required):**
- ⚠️ Return JWT token on login
- ⚠️ Add JWT verification middleware
- ⚠️ Update all member endpoints to filter by `req.userId`
- ⚠️ Add `userId` field to database schemas
- ⚠️ Migrate existing data (if any)
