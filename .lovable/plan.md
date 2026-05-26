Implement a robust abuse detection and blocking system for the invitation system, focusing on preventing self-invitation via device/IP fingerprinting.

### Database Changes (Migration)
- **Profiles Table**: Add `abuse_blocked` (boolean, default false) and ensure `role` column exists (or use existing `user_roles` system).
- **New Table `device_logs`**: Track `user_id`, `fingerprint`, and `ip_address` for every access.
- **New Table `blocked_devices`**: Store fingerprints and IPs that have been flagged for abuse.
- **Update `validate_invite_code` RPC**: 
    - Accept `fingerprint` and `ip_address` as parameters.
    - Before validating, check if the code owner has ever used the same fingerprint or IP as the current user.
    - If a match is found, mark both accounts (owner and current user) as `abuse_blocked` and log the device in `blocked_devices`.
- **Admin RPCs**: Add functions for admins to view and lift blocks.

### Frontend Implementation
- **Fingerprint Capture**: Integrate `@fingerprintjs/fingerprintjs` to generate a unique device ID.
- **Blocking Guard**:
    - Update `AuthProvider` to fetch `abuse_blocked` status.
    - Update `ProtectedRoute` to redirect blocked users (or those on blocked devices) to a new `/bloqueado` page.
- **Block Screen (`/bloqueado`)**:
    - Full-screen "Error 2 - Abuso de convites".
    - WhatsApp support link.
    - Bypass all other routes.
- **Admin Dashboard (`/admin/bloqueios`)**:
    - List blocked users and devices.
    - Provide an "Unlock" button that clears the flags and logs.

### Technical Steps
1. **Migration**: Create tables and update `validate_invite_code`.
2. **Library**: Add `@fingerprintjs/fingerprintjs`.
3. **API Utility**: Create a helper to get client IP and fingerprint.
4. **Auth Context**: Sync the new `abuse_blocked` state.
5. **UI**: Create the Blocked page and Admin Management page.
