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
  Cell
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Activity, MapPin } from "lucide-react";

export default function Results() {
  const { data, isLoading, error } = useGetSurveyResults({
    query: {
      queryKey: getGetSurveyResultsQueryKey()
    }
  });

  const PRIMARY_COLOR = "hsl(271, 68%, 55%)";
  const SECONDARY_COLOR = "hsl(271, 30%, 80%)";

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl md:col-span-2" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
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
            <CardDescription>We couldn't fetch the survey data at this time.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pb-8">
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { total_responses, frequency_counts, hobby_counts, top_states } = data;

  // Sort hobby counts descending for better horizontal bar chart display
  const sortedHobbies = [...hobby_counts].sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8 lg:p-12 relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-[0%] right-[0%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[0%] left-[0%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto z-10 relative space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Survey
              </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Survey Results</h1>
            <p className="text-muted-foreground mt-2">Aggregated data from all undergraduate respondents.</p>
          </div>
          <div className="bg-primary/10 text-primary px-6 py-4 rounded-xl flex items-center gap-4">
            <div className="p-2 bg-background rounded-lg shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Responses</p>
              <p className="text-3xl font-bold leading-none">{total_responses}</p>
            </div>
          </div>
        </div>

        {total_responses === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border border-dashed">
            <h3 className="text-xl font-medium mb-2">No responses yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to fill out the survey.</p>
            <Button asChild>
              <Link href="/">Take Survey</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* Hobbies Chart */}
            <Card className="lg:col-span-2 shadow-md border-primary/10 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle>Popular Hobbies</CardTitle>
                </div>
                <CardDescription>Most frequently reported activities among students</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedHobbies}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="hobby" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 600 }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={32}>
                        {sortedHobbies.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? PRIMARY_COLOR : SECONDARY_COLOR} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Frequency Chart */}
            <Card className="shadow-md border-primary/10 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <CardTitle>Engagement Frequency</CardTitle>
                </div>
                <CardDescription>How often students practice their hobbies</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={frequency_counts}
                      margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="frequency" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Tooltip 
                        cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill={PRIMARY_COLOR} radius={[6, 6, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* States Chart */}
            <Card className="shadow-md border-primary/10 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Top States</CardTitle>
                </div>
                <CardDescription>Geographic distribution of respondents</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top_states}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="state" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill={SECONDARY_COLOR} radius={[0, 4, 4, 0]} maxBarSize={24}>
                        {top_states.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? PRIMARY_COLOR : SECONDARY_COLOR} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
