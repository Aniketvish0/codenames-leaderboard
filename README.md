# Codenames Leaderboard

A web application to track Codenames game results and team performance with a spy-themed design inspired by codenames.game.

## Features

- 🎯 **Game Tracking**: Record games with red and blue teams, spymasters, and winners
- 📊 **Player Statistics**: Track wins, losses, win rates, and spymaster performance
- 🏆 **Leaderboard**: Ranked by wins and win percentage
- 🔐 **Admin Authentication**: Simple password-based admin access
- 🎨 **Codenames Theme**: Spy-themed design with red and blue team colors
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js for authentication
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives with shadcn/ui styling

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

## Usage

### Authentication

1. Visit the application URL
2. You'll be redirected to the sign-in page
3. Enter the admin password (default: `admin123`)
4. You'll be redirected to the leaderboard

### Managing Players

1. Go to the "Manage Players" tab
2. Add players using the input field
3. Remove players using the trash icon (note: this will also remove their game history)

### Recording Games

1. Go to the "New Game" tab
2. Add players to both red and blue teams
3. Select a spymaster for each team from the team members
4. Optionally add game notes
5. Click the winning team button to record the game

### Viewing Statistics

The "Leaderboard" tab shows:
- Player rankings by wins and win percentage
- Individual player statistics including spymaster performance
- Recent game history with team compositions

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

### Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   └── page.tsx      # Main application
├── components/       # Reusable UI components
├── lib/
│   ├── db.ts         # Database connection
│   ├── schema.ts     # Database schema
│   └── utils.ts      # Utility functions
└── drizzle/          # Database migrations
```

## Customization

### Theme Colors

The application uses CSS custom properties for theming. You can modify colors in `app/globals.css`:

- `--red-team`: Red team color
- `--blue-team`: Blue team color
- Other theme variables for backgrounds, borders, etc.

### Admin Password

Change the `ADMIN_PASSWORD` environment variable to use a different admin password.

## License

This project is open source and available under the MIT License. 