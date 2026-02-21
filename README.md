---

# 🗄️ Database Setup — School Voting App (PostgreSQL)

This guide shows how to create and configure a PostgreSQL database for the school community voting application (PERN stack).

---

## 📋 Requirements

* PostgreSQL 13+
* Permission to create databases
* `psql` or any SQL client

---

# 🚀 Step 1 — Create the Database

```sql
CREATE DATABASE school_voting_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pl_PL.UTF-8'
    LC_CTYPE = 'pl_PL.UTF-8'
    TEMPLATE template0;
```

After creating the database, connect to it:

```sql
\c school_voting_db
```

---

# 🧩 Step 2 — ENUM Type for User Roles

We use ENUM instead of VARCHAR to ensure data consistency.

```sql
CREATE TYPE user_role AS ENUM (
    'student',
    'admin'
);
```

---

# 👤 Step 3 — `users` Table

Stores user accounts, roles, and verification data.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
        CHECK (email ~ '^[a-zA-Z0-9._%+-]+@zgierz\.edu\.pl$'),
    password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(128),
    verification_expires TIMESTAMPTZ,
    reset_token VARCHAR(128),
    reset_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 🔐 Important

* only school emails are allowed
* passwords should be hashed (e.g., bcrypt)
* admins are also allowed to vote

---

# 🗳️ Step 4 — `elections` Table

Defines voting events.

```sql
CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date > start_date)
);
```

---

# 🖼️ Step 5 — `posts` Table

Posts (candidates) submitted by users.

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    election_id INTEGER NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

# ❤️ Step 6 — `votes` Table

Implements the like/unlike voting system.

```sql
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);
```

### ✅ Rules

* a user can vote only once per post
* unlike = delete the record
* voting is anonymous at the UI level

---

# ⚡ Step 7 — Indexes (Performance)

Indexes are critical for fast feed loading and vote counting.

```sql
-- votes
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);

-- posts
CREATE INDEX idx_posts_election_id ON posts(election_id);
CREATE INDEX idx_posts_is_visible ON posts(is_visible);

-- elections
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);

-- 🔥 feed optimization
CREATE INDEX idx_posts_feed 
ON posts(election_id, is_visible, created_at DESC);

-- 🔥 vote counting optimization
CREATE INDEX idx_votes_post_id_created_at 
ON votes(post_id, created_at DESC);

-- 🔥 partial index for visible posts
CREATE INDEX idx_posts_visible_only 
ON posts(election_id, created_at DESC) 
WHERE is_visible = true;
```

---

# 🧠 Database Relationships

```
users      1 ──── N posts
users      1 ──── N votes
elections  1 ──── N posts
posts      1 ──── N votes
```

---

# ✅ Done!

After completing these steps, your database is:

* 🚀 optimized for React feed performance
* 🔐 secure
* 📈 ready for higher traffic
* 🧱 aligned with the PERN stack

---

## 🔮 Possible Future Improvements

* materialized vote counter
* election status column
* soft delete for users
* cursor-based pagination

---
