```
-- =============================================
-- Utworzenie bazy danych
-- =============================================
CREATE DATABASE school_voting_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pl_PL.UTF-8'
    LC_CTYPE = 'pl_PL.UTF-8'
    TEMPLATE template0;

-- Połącz się z nową bazą
\c school_voting_db

-- =============================================
-- ENUM: user_role
-- =============================================
CREATE TYPE user_role AS ENUM (
    'student',
    'admin'
);

-- =============================================
-- Tabela: users
-- =============================================
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

-- =============================================
-- Tabela: elections
-- =============================================
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

-- =============================================
-- Tabela: posts
-- =============================================
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

-- =============================================
-- Tabela: votes
-- =============================================
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- =============================================
-- Indeksy
-- =============================================
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_posts_election_id ON posts(election_id);
CREATE INDEX idx_posts_is_visible ON posts(is_visible);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX idx_posts_feed ON posts(election_id, is_visible, created_at DESC);
CREATE INDEX idx_votes_post_id_created_at ON votes(post_id, created_at DESC);
CREATE INDEX idx_posts_visible_only ON posts(election_id, created_at DESC) WHERE is_visible = true;

```
