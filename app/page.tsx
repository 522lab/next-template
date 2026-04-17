import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          next-template
        </h1>
        <p className="text-lg text-muted-foreground">
          A production-ready Next.js 15 PWA starter with Supabase, Tailwind,
          shadcn/ui, PostHog, and Stripe.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>
            Sign in with a magic link to explore the template.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin">Admin dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
