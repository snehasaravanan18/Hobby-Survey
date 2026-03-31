import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  major: text("major").notNull(),
  state: text("state").notNull(),
  frequency: text("frequency").notNull(),
  hobbies: text("hobbies").array().notNull(),
  other_hobby: text("other_hobby"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(
  surveyResponsesTable,
).omit({ id: true, created_at: true });

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
