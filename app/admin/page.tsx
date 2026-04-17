import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: profileCount }, { count: eventCount30d }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('app_events')
      .select('*', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          High-level metrics across the studio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total profiles</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {profileCount ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All registered users in this project.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Events (last 30 days)</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {eventCount30d ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tracked via <code>track()</code> in <code>lib/analytics.ts</code>.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
