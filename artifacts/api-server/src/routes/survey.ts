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

  const { travel_frequency, state, frequency, hobbies, other_hobby, free_time_hours, stress_level, favorite_food } = parsed.data;

  const [response] = await db
    .insert(surveyResponsesTable)
    .values({
      travel_frequency,
      state,
      frequency,
      hobbies,
      other_hobby: other_hobby ?? null,
      free_time_hours,
      stress_level,
      favorite_food,
    })
    .returning();

  res.status(201).json({
    id: response.id,
    travel_frequency: response.travel_frequency,
    state: response.state,
    frequency: response.frequency,
    hobbies: response.hobbies,
    other_hobby: response.other_hobby,
    free_time_hours: response.free_time_hours,
    stress_level: response.stress_level,
    favorite_food: response.favorite_food,
    created_at: response.created_at.toISOString(),
  });
});

router.get("/survey/results", async (req, res): Promise<void> => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(surveyResponsesTable);
  const total_responses = totalResult[0]?.count ?? 0;

  const travelOrder = ["Very often", "Sometimes", "Rarely", "Never"];
  const frequencyOrder = ["Daily", "A few times a week", "Occasionally", "Rarely"];
  const freeTimeOrder = ["Less than 1 hour", "1–2 hours", "3–4 hours", "5+ hours"];

  const travelResult = await db.execute<{ travel_frequency: string; count: number }>(
    sql`SELECT travel_frequency, COUNT(*)::int as count FROM survey_responses GROUP BY travel_frequency`
  );

  const frequencyResult = await db.execute<{ frequency: string; count: number }>(
    sql`SELECT frequency, COUNT(*)::int as count FROM survey_responses GROUP BY frequency`
  );

  const hobbiesResult = await db.execute<{ hobby: string; count: number }>(
    sql`SELECT unnest(hobbies) AS hobby, COUNT(*)::int as count FROM survey_responses GROUP BY hobby ORDER BY count DESC`
  );

  const statesResult = await db.execute<{ state: string; count: number }>(
    sql`SELECT state, COUNT(*)::int as count FROM survey_responses GROUP BY state ORDER BY count DESC LIMIT 10`
  );

  const freeTimeResult = await db.execute<{ free_time_hours: string; count: number }>(
    sql`SELECT free_time_hours, COUNT(*)::int as count FROM survey_responses GROUP BY free_time_hours`
  );

  const stressResult = await db.execute<{ stress_level: string; count: number }>(
    sql`SELECT stress_level, COUNT(*)::int as count FROM survey_responses GROUP BY stress_level ORDER BY count DESC`
  );

  const sortedTravel = [...travelResult.rows].sort(
    (a, b) => travelOrder.indexOf(a.travel_frequency) - travelOrder.indexOf(b.travel_frequency)
  );
  const sortedFrequency = [...frequencyResult.rows].sort(
    (a, b) => frequencyOrder.indexOf(a.frequency) - frequencyOrder.indexOf(b.frequency)
  );
  const sortedFreeTime = [...freeTimeResult.rows].sort(
    (a, b) => freeTimeOrder.indexOf(a.free_time_hours) - freeTimeOrder.indexOf(b.free_time_hours)
  );

  const data = GetSurveyResultsResponse.parse({
    total_responses,
    travel_frequency_counts: sortedTravel,
    frequency_counts: sortedFrequency,
    hobby_counts: hobbiesResult.rows,
    top_states: statesResult.rows,
    free_time_counts: sortedFreeTime,
    stress_counts: stressResult.rows,
  });

  res.json(data);
});

export default router;
