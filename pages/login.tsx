import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Login - ReelFindr</title>
      </Head>
      <div>
        <Card className="flex !w-1/2 mx-auto mt-10 p-10 gap-10">
        <CardHeader>
          <CardTitle>{flow === "signIn" ? "Login to your account" : "Create an account"}</CardTitle>
          <CardDescription>
            {flow === "signIn" ? "Enter your email below to login to your account" : "Enter your email below to create an account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              const formData = new FormData(event.currentTarget);
              formData.set("flow", flow);

              try {
                await signIn("password", formData);
                
                if (flow === "signUp") {
                  toast.success("Account created successfully!");
                } else {
                  toast.success("Login successful!");
                }
                
                router.push("/");
              } catch (error: any) {
                  toast.error("Incorrect email or password.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {flow === "signUp" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground ml-2" aria-label="Password requirements" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Must be at least 8 characters</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Logging in..." : flow === "signIn" ? "Sign in" : "Sign up"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {flow === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="underline underline-offset-4 hover:underline"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

export default SignInForm;
