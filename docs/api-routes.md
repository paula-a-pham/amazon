# API Routes

All routes are prefixed with `/api/v1/`.

## Health — `/api/v1/health`

### GET /health

Check if the server is running.

- **Auth:** No
- **Success:** `200` — `{ success: true, data: { status: "ok" } }`

## Auth — `/api/v1/auth`

### POST /register

Create a new user account.

- **Auth:** No
- **Body:** `{ name: string, email: string, password: string }`
- **Success:** `201` — `{ success: true, data: { user: User, accessToken: string } }` + `Set-Cookie: refresh_token` (httpOnly)
- **Errors:**
  - `400` — validation error
  - `409` — email already taken

### POST /login

Sign in with email and password.

- **Auth:** No
- **Body:** `{ email: string, password: string }`
- **Success:** `200` — `{ success: true, data: { user: User, accessToken: string } }` + `Set-Cookie: refresh_token` (httpOnly)
- **Errors:**
  - `400` — validation error
  - `401` — invalid credentials

### POST /refresh

Refresh the access token using the refresh cookie. Returns user data along with the new access token so the client can restore full auth state.

- **Auth:** No (refresh token via httpOnly cookie)
- **Success:** `200` — `{ success: true, data: { user: User, accessToken: string } }` + rotated `Set-Cookie: refresh_token`
- **Errors:**
  - `401` — missing, invalid, or expired refresh token

### POST /logout

Sign out, revoke all refresh tokens for the user, and clear the refresh cookie.

- **Auth:** Yes (Bearer access token)
- **Success:** `200` — `{ success: true, data: { message: "Logged out successfully" } }` + cleared refresh cookie
- **Errors:**
  - `401` — not authenticated
