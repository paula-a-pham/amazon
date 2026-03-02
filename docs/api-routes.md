# API Routes

All routes are prefixed with `/api/v1/`.

## Auth — `/api/v1/auth`

### POST /register

Create a new user account.

- **Auth:** No
- **Body:** `{ name, email, password }`
- **Success:** `201` — user + access token
- **Errors:** `400` validation, `409` email taken

### POST /login

Sign in with email and password.

- **Auth:** No
- **Body:** `{ email, password }`
- **Success:** `200` — user + access token
- **Errors:** `400` validation, `401` invalid credentials

### POST /refresh

Refresh the access token.

- **Auth:** No (refresh token via httpOnly cookie)
- **Success:** `200` — new access token (rotates refresh cookie)
- **Errors:** `401` invalid/expired refresh token

### POST /logout

Sign out and clear refresh token.

- **Auth:** Yes
- **Success:** `200`
- **Errors:** `401` not authenticated
