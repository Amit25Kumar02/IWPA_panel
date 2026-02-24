# S3 Path Fix

## Issue
Team icons are being uploaded with incorrect S3 path:
- ❌ `teams/sports/filename.jpg` (403 Forbidden)
- ✅ `sports/filename.jpg` (Works)

## Backend Fix Required
In your backend API (likely in team upload endpoint), change the S3 upload path from:
```javascript
// Wrong - creates teams/sports/ path
const s3Key = `teams/sports/${timestamp}-${filename}`;

// Correct - use sports/ path only
const s3Key = `sports/${timestamp}-${filename}`;
```

## Files to Check in Backend
1. Team creation/update endpoints
2. File upload middleware
3. S3 upload configuration for teams

The frontend code is correct - the issue is in backend S3 path construction.