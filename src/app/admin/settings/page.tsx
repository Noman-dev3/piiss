'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Manage your website's global settings here. This feature is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More settings management options will be available here soon.</p>
        </CardContent>
      </Card>
    </>
  );
}

export default withAuth(SettingsPage);
