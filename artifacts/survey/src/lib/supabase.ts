import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SurveyRow = {
  id: string;
  travel_frequency: string;
  state: string;
  frequency: string;
  hobbies: string[];
  other_hobby: string | null;
  free_time_hours: string;
  stress_level: string;
  favorite_food: string;
  created_at: string;
};
