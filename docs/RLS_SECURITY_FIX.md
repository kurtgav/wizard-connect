# RLS Security Fix - Admin Access

## Issue
The Row Level Security (RLS) policies for `public.campaigns` and `public.admin_allowlist` referenced `auth.user().user_metadata` to check admin status. This is a **critical security vulnerability** because:

- `user_metadata` is editable by end users
- Any user could modify their own `user_metadata` to grant themselves admin privileges
- This violates the principle of least privilege

## Solution
Created migration `007_fix_admin_rls_security.sql` that implements a secure admin management system:

### 1. New `admin_users` Table
```sql
CREATE TABLE public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);
```

**Benefits:**
- Admin status is stored in a separate table, not in user_metadata
- Only existing admins can modify this table (enforced by RLS)
- Complete audit trail with `created_at` and `created_by`

### 2. Secure RLS Policies
**Before (INSECURE):**
```sql
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
```

**After (SECURE):**
```sql
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    )
)
```

### 3. Backend Implementation

#### New Middleware: `AdminMiddleware`
Located at `backend/internal/interface/http/middleware/admin.go`

- Validates admin status for each request
- Provides defense in depth alongside RLS policies
- Returns 403 Forbidden for unauthorized access attempts

#### New Repository: `AdminRepository`
Located at `backend/internal/infrastructure/database/admin_repository.go`

- `IsAdmin(ctx, userID)`: Check if user is admin
- `AddAdmin(ctx, email)`: Add new admin (securely)
- `RemoveAdmin(ctx, email)`: Remove admin (securely)
- `ListAdmins(ctx)`: List all admins

#### New Controller: `AdminController`
Located at `backend/internal/interface/http/controllers/admin_controller.go`

- `ListAdmins()`: GET /api/v1/admin/admins
- `AddAdmin()`: POST /api/v1/admin/admins/add
- `RemoveAdmin()`: POST /api/v1/admin/admins/remove

All admin management endpoints are protected by:
1. Authentication middleware (JWT validation)
2. Admin middleware (admin status check)
3. RLS policies (database-level access control)

### 4. Secure Admin Management Functions

**Add Admin:**
```sql
SELECT public.add_admin('new-admin@example.com');
```

**Remove Admin:**
```sql
SELECT public.remove_admin('admin@example.com');
```

Both functions:
- Can only be called by existing admins (enforced in the function)
- Use `SECURITY DEFINER` to run with elevated privileges safely
- Are logged for audit purposes

### 5. Migration Steps
1. Create `admin_users` table with RLS
2. Migrate existing admins from `admin_allowlist` to `admin_users`
3. Drop insecure trigger and functions
4. Update RLS policies to use `admin_users` table
5. Create secure admin management functions

### 6. Verification
Run these queries to verify the fix:

```sql
-- Check current admins
SELECT * FROM public.admin_users ORDER BY created_at;

-- Verify RLS policies don't reference user_metadata
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename IN ('campaigns', 'admin_allowlist', 'admin_users')
ORDER BY tablename, policyname;
```

## Deployment

### Database
1. **Backup your database** before running migration
2. Run the migration in Supabase SQL Editor:
   ```bash
   # File: backend/supabase/migrations/007_fix_admin_rls_security.sql
   ```
3. Verify the migration succeeded using the verification queries above

### Backend
4. Restart the Go backend service to load new middleware and controllers
5. Test admin endpoints:
   ```bash
   # Get list of admins (requires admin access)
   curl -H "Authorization: Bearer <admin-token>" \
        http://localhost:8080/api/v1/admin/admins

   # Add new admin (requires admin access)
   curl -X POST -H "Authorization: Bearer <admin-token>" \
        -H "Content-Type: application/json" \
        -d '{"email": "new-admin@example.com"}' \
        http://localhost:8080/api/v1/admin/admins/add
   ```

## API Changes

### New Admin Management Endpoints

All endpoints require:
- Valid JWT token
- Admin status

**GET /api/v1/admin/admins**
- Returns list of all admin emails
- Response: `{"admins": ["admin1@example.com", "admin2@example.com"]}`

**POST /api/v1/admin/admins/add**
- Body: `{"email": "user@example.com"}`
- Adds user as admin
- Response: `{"message": "Admin added successfully", "email": "user@example.com"}`

**POST /api/v1/admin/admins/remove**
- Body: `{"email": "admin@example.com"}`
- Removes admin privileges
- Response: `{"message": "Admin removed successfully", "email": "admin@example.com"}`

### Protected Admin Endpoints
All admin endpoints now use the `RequireAdmin()` middleware:
- `/api/v1/admin/campaigns/*` - Campaign management
- `/api/v1/admin/admins/*` - Admin management

## Impact
- **Security**: Eliminates privilege escalation vulnerability
- **Defense in Depth**: Admin middleware + RLS policies provide multiple layers of protection
- **Audit**: Complete audit trail of admin actions
- **Maintainability**: Clear separation of concerns
- **No Breaking Changes**: Existing admins are migrated automatically
- **Better UX**: Clear 403 errors for unauthorized access attempts

## Testing

1. **Test unauthorized access**:
   ```bash
   curl -X POST -H "Authorization: Bearer <user-token>" \
        -H "Content-Type: application/json" \
        -d '{"email": "malicious@example.com"}' \
        http://localhost:8080/api/v1/admin/admins/add
   ```
   Expected: `403 Forbidden` - "Admin access required"

2. **Test authorized access**:
   ```bash
   curl -X POST -H "Authorization: Bearer <admin-token>" \
        -H "Content-Type: application/json" \
        -d '{"email": "new-admin@example.com"}' \
        http://localhost:8080/api/v1/admin/admins/add
   ```
   Expected: `200 OK` - "Admin added successfully"

3. **Test RLS protection**:
   - Try to modify campaigns as a regular user
   - Database will reject the query due to RLS

## Future Considerations
- Consider adding more audit fields (updated_by, updated_at)
- Could add admin role levels (super_admin, admin, moderator)
- Consider adding approval workflow for new admin additions
- Add rate limiting to admin management endpoints
- Implement admin session logging for security audit trails
