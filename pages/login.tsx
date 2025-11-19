import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";

function SignInForm() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const router = useRouter();
  const createProfile = useMutation(api.userProfiles.createOnSignUp);

  // Create profile once auth is ready after sign up
  useEffect(() => {
    if (isAuthenticated && pendingUsername) {
      createProfile({ username: pendingUsername })
        .then(() => {
          toast.success("Account created successfully!");
          setPendingUsername(null);
        })
        .catch((error: any) => {
          if (error?.message?.includes("already taken")) {
            toast.error("Username is already taken. Please choose another.");
          } else {
            // Profile will be created automatically when needed
            toast.success("Account created! You can set your username on your profile page.");
          }
          setPendingUsername(null);
        });
    }
  }, [isAuthenticated, pendingUsername, createProfile]);

  return (
    <div>
      <Card className="flex !w-1/2 mx-auto mt-10 p-10 gap-10">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                
                // If sign up, store username to create profile once auth is ready
                if (flow === "signUp") {
                  const username = formData.get("username") as string;
                  if (!username) {
                    toast.error("Username is required");
                    setSubmitting(false);
                    return;
                  }
                  // Store username - useEffect will handle profile creation once auth is ready
                  setPendingUsername(username);
                } else {
                  toast.success("Login successful!");
                }
                
                router.push("/");
              } catch (error: any) {
                  toast.error("Incorrect email or password.");
                  setPendingUsername(null); // Clear pending username on error
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
              {flow === "signUp" && (
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    required
                    minLength={3}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {flow === "signUp" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Must be at least 8 characters</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
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
          <div className="flex items-center justify-center my-3">
            <hr className="my-4 grow border-gray-200" />
            <span className="mx-4 text-secondary">or</span>
            <hr className="my-4 grow border-gray-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignInForm;
