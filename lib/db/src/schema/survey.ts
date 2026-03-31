import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  travel_frequency: text("travel_frequency").notNull(),
  state: text("state").notNull(),
  frequency: text("frequency").notNull(),
  hobbies: text("hobbies").array().notNull(),
  other_hobby: text("other_hobby"),
  free_time_hours: text("free_time_hours").notNull(),
  stress_level: text("stress_level").notNull(),
  favorite_food: text("favorite_food").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(
  surveyResponsesTable,
).omit({ id: true, created_at: true });

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
