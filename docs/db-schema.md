# Database Schema Reference

> This document is updated incrementally as features are implemented.

## Overview

- **Database**: PostgreSQL 18
- **ORM**: Prisma
- **Primary Keys**: UUID
- **Timestamps**: All models include `id`, `createdAt`, `updatedAt`

## Enums

### Role

| Value      | Description              |
| ---------- | ------------------------ |
| `CUSTOMER` | Default role for buyers  |
| `SELLER`   | Seller dashboard access  |
| `ADMIN`    | Full admin access        |

## Models

### Category

Stores product categories with optional hierarchy (self-referential). Maps to `categories` table.

| Column      | Type         | Constraints                              |
| ----------- | ------------ | ---------------------------------------- |
| `id`        | UUID         | PK, auto-generated                       |
| `name`      | VARCHAR(100) | NOT NULL                                 |
| `slug`      | VARCHAR(120) | NOT NULL, UNIQUE                         |
| `image`     | VARCHAR(500) | nullable                                 |
| `parent_id` | UUID         | nullable, FK → `categories.id` (SET NULL)|
| `created_at`| TIMESTAMP    | NOT NULL, default `now()`                |
| `updated_at`| TIMESTAMP    | NOT NULL, auto-updated                   |

**Relations:**
- Belongs to `Category` (self, via `parent_id`, optional)
- Has many `Category` (children)
- Has many `Product`

**Indexes:**
- `parent_id` — for efficient hierarchy queries

### Product

Stores product listings. Maps to `products` table.

| Column            | Type          | Constraints                              |
| ----------------- | ------------- | ---------------------------------------- |
| `id`              | UUID          | PK, auto-generated                       |
| `name`            | VARCHAR(255)  | NOT NULL                                 |
| `slug`            | VARCHAR(280)  | NOT NULL, UNIQUE                         |
| `description`     | TEXT          | NOT NULL                                 |
| `price`           | DECIMAL(10,2) | NOT NULL                                 |
| `compare_at_price`| DECIMAL(10,2) | nullable                                 |
| `stock`           | INT           | NOT NULL, default `0`                    |
| `rating_avg`      | DECIMAL(2,1)  | NOT NULL, default `0`                    |
| `rating_count`    | INT           | NOT NULL, default `0`                    |
| `is_active`       | BOOLEAN       | NOT NULL, default `true`                 |
| `seller_id`       | UUID          | NOT NULL, FK → `users.id` (CASCADE)      |
| `category_id`     | UUID          | NOT NULL, FK → `categories.id` (CASCADE) |
| `created_at`      | TIMESTAMP     | NOT NULL, default `now()`                |
| `updated_at`      | TIMESTAMP     | NOT NULL, auto-updated                   |

**Relations:**
- Belongs to `User` (seller, via `seller_id`)
- Belongs to `Category` (via `category_id`)
- Has many `ProductImage`

**Indexes:**
- `price` — for price range filtering
- `rating_avg` — for rating sorting/filtering
- `created_at` — for newest sorting
- `seller_id` — for seller product lookups
- `category_id` — for category product lookups

### ProductImage

Stores product images with display ordering. Maps to `product_images` table.

| Column         | Type         | Constraints                             |
| -------------- | ------------ | --------------------------------------- |
| `id`           | UUID         | PK, auto-generated                      |
| `url`          | VARCHAR(500) | NOT NULL                                |
| `alt`          | VARCHAR(255) | NOT NULL                                |
| `display_order`| INT          | NOT NULL, default `0`                   |
| `product_id`   | UUID         | NOT NULL, FK → `products.id` (CASCADE)  |
| `created_at`   | TIMESTAMP    | NOT NULL, default `now()`               |
| `updated_at`   | TIMESTAMP    | NOT NULL, auto-updated                  |

**Relations:**
- Belongs to `Product` (via `product_id`)

**Indexes:**
- `product_id` — for efficient image lookups by product

### User

Stores user account information. Maps to `users` table.

| Column        | Type         | Constraints                     |
| ------------- | ------------ | ------------------------------- |
| `id`          | UUID         | PK, auto-generated             |
| `name`        | VARCHAR(100) | NOT NULL                        |
| `email`       | VARCHAR(255) | NOT NULL, UNIQUE                |
| `password_hash` | VARCHAR(255) | NOT NULL                      |
| `role`        | Role enum    | NOT NULL, default `CUSTOMER`    |
| `created_at`  | TIMESTAMP    | NOT NULL, default `now()`       |
| `updated_at`  | TIMESTAMP    | NOT NULL, auto-updated          |

**Relations:**
- Has many `RefreshToken`

### RefreshToken

Stores refresh tokens for JWT rotation. Supports multiple sessions per user and individual token revocation. Maps to `refresh_tokens` table.

| Column       | Type      | Constraints                     |
| ------------ | --------- | ------------------------------- |
| `id`         | UUID      | PK, auto-generated             |
| `user_id`    | UUID      | NOT NULL, FK → `users.id` (CASCADE) |
| `expires_at` | TIMESTAMP | NOT NULL                        |
| `created_at` | TIMESTAMP | NOT NULL, default `now()`       |
| `updated_at` | TIMESTAMP | NOT NULL, auto-updated          |

**Relations:**
- Belongs to `User` (via `user_id`)

**Indexes:**
- `user_id` — for efficient lookup by user

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐
│    User      │       │  RefreshToken     │
├──────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)          │
│ name         │  │    │ user_id (FK)     │──┐
│ email (UQ)   │  └───<│ expires_at       │  │
│ password_hash│       │ created_at       │  │
│ role         │       │ updated_at       │  │
│ created_at   │       └──────────────────┘  │
│ updated_at   │                              │
└──────┬───────┘──────────────────────────────┘
       │ 1:N (seller)
       ▼
┌──────────────────┐       ┌──────────────────┐
│    Product       │       │  ProductImage    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │
│ name             │  │    │ url              │
│ slug (UQ)        │  └───<│ alt              │
│ description      │       │ display_order    │
│ price            │       │ product_id (FK)  │
│ compare_at_price │       │ created_at       │
│ stock            │       │ updated_at       │
│ rating_avg       │       └──────────────────┘
│ rating_count     │
│ is_active        │
│ seller_id (FK)   │
│ category_id (FK) │───┐
│ created_at       │   │
│ updated_at       │   │
└──────────────────┘   │
                       ▼
┌──────────────────┐
│   Category       │
├──────────────────┤
│ id (PK)          │──┐
│ name             │  │ self-ref (parent/children)
│ slug (UQ)        │  │
│ image            │  │
│ parent_id (FK)   │──┘
│ created_at       │
│ updated_at       │
└──────────────────┘
```
