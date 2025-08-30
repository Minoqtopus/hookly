"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/domains/auth";
import { useState } from "react";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and subscription settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password here. After saving, you'll be logged out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Password</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your billing and subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
            <div>
              <p className="font-semibold">
                {user?.plan === 'trial' ? 'Trial Plan' : 
                 user?.plan === 'starter' ? 'Starter Plan' :
                 user?.plan === 'pro' ? 'Pro Plan' : 'Trial Plan'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.plan === 'trial' 
                  ? `Trial ends ${user?.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString() : 'soon'}`
                  : 'Subscription active'
                }
              </p>
            </div>
            <Button variant="outline">
              {user?.plan === 'trial' ? 'Upgrade Plan' : 'Manage Subscription'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}