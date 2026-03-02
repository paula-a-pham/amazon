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
│    User      │       │  RefreshToken    │
├──────────────┤       ├──────────────────┤
│ id (PK)      │──┐    │ id (PK)          │
│ name         │  │    │ user_id (FK)     │──┐
│ email (UQ)   │  └───<│ expires_at       │  │
│ password_hash│       │ created_at       │  │
│ role         │       │ updated_at       │  │
│ created_at   │       └──────────────────┘  │
│ updated_at   │                             │
└──────────────┘─────────────────────────────┘
```
