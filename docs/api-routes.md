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

## Products — `/api/v1/products`

### GET /products

List products with filtering, sorting, and pagination.

- **Auth:** No
- **Query params:**
  - `page` (int, default 1) — page number
  - `limit` (int, default 20, max 100) — items per page
  - `search` (string, max 200) — search by name/description (case-insensitive)
  - `categorySlug` (string) — filter by category slug
  - `minPrice` (number) — minimum price filter
  - `maxPrice` (number) — maximum price filter
  - `minRating` (number, 0-5) — minimum average rating
  - `sortBy` (enum: `price_asc`, `price_desc`, `rating`, `newest`, `name_asc`, `name_desc`, default `newest`)
- **Success:** `200` — `{ success: true, data: { products: ProductListItem[], pagination: { page, limit, total, totalPages } } }`
- **Errors:**
  - `400` — validation error

### GET /products/:slug

Get a single product by slug.

- **Auth:** No
- **Params:** `slug` — product slug
- **Success:** `200` — `{ success: true, data: Product }` (includes images and category)
- **Errors:**
  - `400` — validation error
  - `404` — product not found

## Categories — `/api/v1/categories`

### GET /categories

List top-level categories.

- **Auth:** No
- **Query params:**
  - `includeChildren` (enum: `true`/`false`, default `false`) — include child categories
- **Success:** `200` — `{ success: true, data: { categories: Category[] | CategoryWithChildren[] } }`
- **Errors:**
  - `400` — validation error

### GET /categories/:slug

Get a single category by slug.

- **Auth:** No
- **Params:** `slug` — category slug
- **Success:** `200` — `{ success: true, data: Category }`
- **Errors:**
  - `400` — validation error
  - `404` — category not found

### GET /categories/:slug/products

List products for a category (includes subcategory products) with pagination.

- **Auth:** No
- **Params:** `slug` — category slug
- **Query params:**
  - `page` (int, default 1) — page number
  - `limit` (int, default 20, max 100) — items per page
  - `minPrice` (number) — minimum price filter
  - `maxPrice` (number) — maximum price filter
  - `minRating` (number, 0-5) — minimum average rating
  - `sortBy` (enum: `price_asc`, `price_desc`, `rating`, `newest`, `name_asc`, `name_desc`, default `newest`)
- **Success:** `200` — `{ success: true, data: { category: Category, products: ProductListItem[], pagination: { page, limit, total, totalPages } } }`
- **Errors:**
  - `400` — validation error
  - `404` — category not found
