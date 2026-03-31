import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, surveyResponsesTable } from "@workspace/db";
import { SubmitSurveyBody, GetSurveyResultsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/survey/submit", async (req, res): Promise<void> => {
  const parsed = SubmitSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { major, state, frequency, hobbies, other_hobby } = parsed.data;

  const [response] = await db
    .insert(surveyResponsesTable)
    .values({
      major,
      state,
      frequency,
      hobbies,
      other_hobby: other_hobby ?? null,
    })
    .returning();

  res.status(201).json({
    id: response.id,
    major: response.major,
    state: response.state,
    frequency: response.frequency,
    hobbies: response.hobbies,
    other_hobby: response.other_hobby,
    created_at: response.created_at.toISOString(),
  });
});

router.get("/survey/results", async (req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(surveyResponsesTable);
  const total_responses = totalResult[0]?.count ?? 0;

  const frequencyResult = await db.execute<{ frequency: string; count: number }>(
    sql`
      SELECT frequency, COUNT(*)::int as count
      FROM survey_responses
      GROUP BY frequency
      ORDER BY count DESC
    `
  );

  const hobbiesResult = await db.execute<{ hobby: string; count: number }>(
    sql`
      SELECT unnest(hobbies) AS hobby, COUNT(*)::int as count
      FROM survey_responses
      GROUP BY hobby
      ORDER BY count DESC
    `
  );

  const statesResult = await db.execute<{ state: string; count: number }>(
    sql`
      SELECT state, COUNT(*)::int as count
      FROM survey_responses
      GROUP BY state
      ORDER BY count DESC
      LIMIT 10
    `
  );

  const data = GetSurveyResultsResponse.parse({
    total_responses,
    frequency_counts: frequencyResult.rows,
    hobby_counts: hobbiesResult.rows,
    top_states: statesResult.rows,
  });

  res.json(data);
});

export default router;
