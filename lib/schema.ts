import { pgTable, serial, varchar, timestamp, integer, text, uuid, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Players table 
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Games table 
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  redTeamSpymaster: uuid('red_team_spymaster').references(() => players.id).notNull(),
  blueTeamSpymaster: uuid('blue_team_spymaster').references(() => players.id).notNull(),
  winningTeam: varchar('winning_team', { length: 10 }).notNull(),
  playedAt: timestamp('played_at').defaultNow().notNull(),
})

// Game participants table 
export const gameParticipants = pgTable('game_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }).notNull(),
  playerId: uuid('player_id').references(() => players.id).notNull(),
  team: varchar('team', { length: 10 }).notNull(),
  isSpymaster: boolean('is_spymaster').default(false).notNull(),
})

// Define relations
export const playersRelations = relations(players, ({ many }) => ({
  gameParticipants: many(gameParticipants),
  redSpymasterGames: many(games, { relationName: 'redSpymaster' }),
  blueSpymasterGames: many(games, { relationName: 'blueSpymaster' }),
}))

export const gamesRelations = relations(games, ({ one, many }) => ({
  redSpymaster: one(players, {
    fields: [games.redTeamSpymaster],
    references: [players.id],
    relationName: 'redSpymaster',
  }),
  blueSpymaster: one(players, {
    fields: [games.blueTeamSpymaster],
    references: [players.id],
    relationName: 'blueSpymaster',
  }),
  participants: many(gameParticipants),
}))

export const gameParticipantsRelations = relations(gameParticipants, ({ one }) => ({
  game: one(games, {
    fields: [gameParticipants.gameId],
    references: [games.id],
  }),
  player: one(players, {
    fields: [gameParticipants.playerId],
    references: [players.id],
  }),
}))

// Type exports for use in the application
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
export type GameParticipant = typeof gameParticipants.$inferSelect
export type NewGameParticipant = typeof gameParticipants.$inferInsert 