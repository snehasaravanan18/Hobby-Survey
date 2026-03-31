import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { useSubmitSurvey, getGetSurveyResultsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { US_STATES, HOBBIES, HOBBY_FREQUENCIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, Loader2, ArrowRight, BarChart3, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  major: z.string().min(1, "Major is required").max(100),
  state: z.string().min(1, "Please select a state"),
  frequency: z.string().min(1, "Please select a frequency"),
  hobbies: z.array(z.string()).min(1, "Please select at least one hobby"),
  other_hobby: z.string().optional()
}).refine(data => {
  if (data.hobbies.includes("Other") && (!data.other_hobby || data.other_hobby.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify your other hobby",
  path: ["other_hobby"]
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const queryClient = useQueryClient();
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      major: "",
      state: "",
      frequency: "",
      hobbies: [],
      other_hobby: ""
    }
  });

  const submitMutation = useSubmitSurvey({
    mutation: {
      onSuccess: (data, variables) => {
        // Invalidate results query so it refetches next time
        queryClient.invalidateQueries({ queryKey: getGetSurveyResultsQueryKey() });
        setSubmittedData(variables.data);
      }
    }
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate({ data: values });
  };

  const showOtherHobbyInput = form.watch("hobbies").includes("Other");

  if (submittedData) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_40%)]" />
        <Card className="w-full max-w-lg z-10 animate-in fade-in zoom-in duration-500 shadow-xl border-primary/20">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Survey Submitted</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for sharing your interests and lifestyle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Your Responses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Major</p>
                  <p className="font-medium">{submittedData.major}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">State</p>
                  <p className="font-medium">{submittedData.state}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hobby Frequency</p>
                  <p className="font-medium">{submittedData.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hobbies</p>
                  <p className="font-medium">
                    {submittedData.hobbies.map(h => h === "Other" ? submittedData.other_hobby : h).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-4 flex justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
              <Link href="/results" className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span>View Results</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full p-4 md:p-8 lg:p-12 relative overflow-hidden bg-background flex flex-col items-center">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-2xl z-10 flex flex-col mt-4 md:mt-10 mb-20">
        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
            <BookOpenCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Student Hobby Survey
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Help us understand how undergraduates balance academics, lifestyle, and personal interests.
          </p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                {/* Question 1: Major */}
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-base font-semibold">1. What is your major?</FormLabel>
                        <FormDescription>Your primary field of undergraduate study.</FormDescription>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Business Analytics" 
                          className="h-12 text-base transition-shadow focus-visible:ring-primary/30" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-px w-full bg-border/50" />

                {/* Question 2: State */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-base font-semibold">2. Which state are you studying in?</FormLabel>
                        <FormDescription>Select the US state where your university is located.</FormDescription>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-px w-full bg-border/50" />

                {/* Question 3: Frequency */}
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-base font-semibold">3. How often do you engage in your hobbies?</FormLabel>
                      </div>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-3"
                        >
                          {HOBBY_FREQUENCIES.map((freq) => (
                            <FormItem key={freq} className="flex items-center space-x-3 space-y-0 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30">
                              <FormControl>
                                <RadioGroupItem value={freq} />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer flex-1">
                                {freq}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-px w-full bg-border/50" />

                {/* Question 4: Hobbies */}
                <FormField
                  control={form.control}
                  name="hobbies"
                  render={() => (
                    <FormItem className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <FormLabel className="text-base font-semibold">4. What are your primary hobbies?</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {HOBBIES.map((hobby) => (
                          <FormField
                            key={hobby}
                            control={form.control}
                            name="hobbies"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={hobby}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer has-[:checked]:bg-primary/5 has-[:checked]:border-primary/30"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(hobby)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, hobby])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== hobby
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-medium cursor-pointer flex-1">
                                    {hobby}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Other Hobby Input */}
                {showOtherHobbyInput && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <FormField
                      control={form.control}
                      name="other_hobby"
                      render={({ field }) => (
                        <FormItem className="space-y-3 bg-muted/30 p-5 rounded-xl border border-border/50">
                          <FormLabel className="text-sm font-semibold">Please specify your other hobby</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Photography, Cooking, Music" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-base font-medium mt-6 group"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Survey
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
