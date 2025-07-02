# Codenames Leaderboard

A web application to track Codenames game results and team performance with a spy-themed design inspired by codenames.game.

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codenames_leaderboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin Authentication
ADMIN_PASSWORD="admin123"
```

### 3. Database Setup

Make sure you have PostgreSQL running and create a database named `codenames_leaderboard`.

Generate and run database migrations:

```bash
# Generate migration files
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

The application uses three main tables:

- **Players**: Stores player information
- **Games**: Stores game results with spymasters and winning team
- **Game Participants**: Links players to games with team assignments

## API Endpoints

- `GET /api/players` - Get all players
- `POST /api/players` - Create a new player
- `DELETE /api/players?id={id}` - Delete a player
- `GET /api/games` - Get all games with participants
- `POST /api/games` - Create a new game
- `GET /api/stats` - Get player statistics and recent games

## Development

### Database Commands

```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio

# Generate new migrations after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push
```
