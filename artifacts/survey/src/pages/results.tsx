import { useGetSurveyResults, getGetSurveyResultsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Activity, MapPin, Clock, Brain, Plane } from "lucide-react";

const PRIMARY = "hsl(271, 68%, 55%)";
const PRIMARY_LIGHT = "hsl(271, 50%, 75%)";
const PRIMARY_LIGHTER = "hsl(271, 35%, 88%)";

const TOOLTIP_STYLE = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
  fontSize: 13,
};

const LABEL_STYLE = {
  fill: "hsl(var(--foreground))",
  fontSize: 12,
  fontWeight: 600,
};

function ChartCard({
  title,
  description,
  icon,
  children,
  fullWidth = false,
  height = 300,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  height?: number;
}) {
  return (
    <Card
      className={`shadow-md border-primary/10 overflow-hidden${fullWidth ? " lg:col-span-2" : ""}`}
    >
      <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Results() {
  const { data, isLoading, error } = useGetSurveyResults({
    query: { queryKey: getGetSurveyResultsQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center border-destructive/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Results</CardTitle>
            <CardDescription>
              We could not fetch the survey data at this time.
            </CardDescription>
          </CardHeader>
          <div className="pb-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const {
    total_responses,
    travel_frequency_counts,
    frequency_counts,
    hobby_counts,
    top_states,
    free_time_counts,
    stress_counts,
  } = data;

  const sortedHobbies = [...hobby_counts].sort((a, b) => b.count - a.count);

  const stressOrder = ["Low", "Moderate", "High"];
  const sortedStress = [...stress_counts].sort(
    (a, b) => stressOrder.indexOf(a.stress_level) - stressOrder.indexOf(b.stress_level)
  );
  const stressColors: Record<string, string> = {
    Low: "hsl(142, 60%, 50%)",
    Moderate: "hsl(38, 90%, 55%)",
    High: "hsl(0, 72%, 55%)",
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8 lg:p-12 relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[30%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        {/* Header */}
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-3 mb-4 text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Survey
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Survey Results</h1>
          <p className="text-muted-foreground mt-1">
            Aggregated data from all undergraduate respondents.
          </p>
        </div>

        {/* Total Responses Banner */}
        <div
          className="flex items-center gap-5 bg-primary/10 border border-primary/20 rounded-2xl px-6 py-5"
          data-testid="stat-total-responses"
        >
          <div className="p-3 bg-primary/15 rounded-xl">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary/80">
              Total Responses
            </p>
            <p className="text-4xl font-bold text-primary leading-none mt-1">{total_responses}</p>
          </div>
        </div>

        {total_responses === 0 ? (
          <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-2">No responses yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to fill out the survey.</p>
            <Button asChild>
              <Link href="/">Take Survey</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

            {/* Travel Frequency — full width */}
            <ChartCard
              fullWidth
              title="Travel Frequency"
              description="How often students travel"
              icon={<Plane className="w-5 h-5" />}
              height={280}
            >
              <BarChart
                data={travel_frequency_counts}
                margin={{ top: 24, right: 16, left: -16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="travel_frequency"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={64}>
                  <LabelList dataKey="count" position="top" style={LABEL_STYLE} />
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Popular Hobbies — full width, horizontal bar, sorted descending */}
            <ChartCard
              fullWidth
              title="Popular Hobbies"
              description="Most frequently selected hobbies, sorted descending"
              icon={<Activity className="w-5 h-5" />}
              height={320}
            >
              <BarChart
                data={sortedHobbies}
                layout="vertical"
                margin={{ top: 4, right: 60, left: 12, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={true}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  dataKey="hobby"
                  type="category"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={30}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={LABEL_STYLE}
                  />
                  {sortedHobbies.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? PRIMARY : i === 1 ? PRIMARY_LIGHT : PRIMARY_LIGHTER}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Hobby Engagement Frequency */}
            <ChartCard
              title="Hobby Engagement Frequency"
              description="How often students practice their hobbies"
              icon={<Activity className="w-5 h-5" />}
              height={300}
            >
              <BarChart
                data={frequency_counts}
                margin={{ top: 24, right: 16, left: -16, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="frequency"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={56}>
                  <LabelList dataKey="count" position="top" style={LABEL_STYLE} />
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Stress Level */}
            <ChartCard
              title="Stress Level"
              description="Self-reported academic stress levels"
              icon={<Brain className="w-5 h-5" />}
              height={300}
            >
              <BarChart
                data={sortedStress}
                margin={{ top: 24, right: 16, left: -16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="stress_level"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  <LabelList dataKey="count" position="top" style={LABEL_STYLE} />
                  {sortedStress.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={stressColors[entry.stress_level] ?? PRIMARY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Daily Free Time */}
            <ChartCard
              title="Daily Free Time"
              description="Hours of free time students have per day"
              icon={<Clock className="w-5 h-5" />}
              height={300}
            >
              <BarChart
                data={free_time_counts}
                margin={{ top: 24, right: 16, left: -16, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="free_time_hours"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" fill={PRIMARY_LIGHT} radius={[6, 6, 0, 0]} maxBarSize={56}>
                  <LabelList dataKey="count" position="top" style={LABEL_STYLE} />
                </Bar>
              </BarChart>
            </ChartCard>

            {/* Top 10 States — full width, horizontal bar */}
            <ChartCard
              fullWidth
              title="Top 10 States"
              description="Geographic distribution of respondents by US state"
              icon={<MapPin className="w-5 h-5" />}
              height={380}
            >
              <BarChart
                data={top_states}
                layout="vertical"
                margin={{ top: 4, right: 60, left: 16, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  vertical={true}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  dataKey="state"
                  type="category"
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [v, "Responses"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={26}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={LABEL_STYLE}
                  />
                  {top_states.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? PRIMARY : i <= 2 ? PRIMARY_LIGHT : PRIMARY_LIGHTER}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>

          </div>
        )}
      </div>
    </div>
  );
}
