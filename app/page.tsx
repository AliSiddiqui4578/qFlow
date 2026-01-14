import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Bell, Users, ArrowRight, Smartphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">QFlow</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How it Works
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="gradient-bg">
              <Link href="/book-appointment">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 via-primary/5 to-background" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <Badge variant="secondary" className="mb-6 w-fit text-xs font-medium uppercase tracking-wider">
                Smart Queue Management
              </Badge>
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                <span className="text-balance">QFlow: </span>
                <span className="gradient-text text-balance">Next-Gen</span>
                <span className="text-balance"> Queue Management</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Streamline your service experience with online appointments, live queue tracking, and real-time
                estimated wait time notifications. Perfect for healthcare clinics, salons, and service centers.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="gradient-bg text-base">
                  <Link href="/book-appointment">
                    Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                  <Link href="/queue-status">View Queue Status</Link>
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-8">
                <div>
                  <div className="text-3xl font-bold">5K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50%</div>
                  <div className="text-sm text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
                <Card className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Live Queue Status</h3>
                      <Badge className="gradient-bg">Live</Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-accent/10 p-4">
                        <div className="mb-2 text-sm text-muted-foreground">Current Position</div>
                        <div className="text-4xl font-bold">#3</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-secondary p-4">
                          <Clock className="mb-2 h-5 w-5 text-primary" />
                          <div className="text-xs text-muted-foreground">Est. Wait Time</div>
                          <div className="text-xl font-semibold">15 mins</div>
                        </div>
                        <div className="rounded-lg bg-secondary p-4">
                          <Users className="mb-2 h-5 w-5 text-primary" />
                          <div className="text-xs text-muted-foreground">Ahead of You</div>
                          <div className="text-xl font-semibold">2 people</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Queue Progress</span>
                          <span className="font-medium">67%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div className="gradient-bg h-full w-2/3 rounded-full transition-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4 text-xs font-medium uppercase tracking-wider">
              Features
            </Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Everything You Need for <span className="gradient-text">Efficient</span> Queue Management
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features designed to enhance your service experience and reduce wait times
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Calendar,
                title: "Online Booking",
                description: "Schedule appointments in advance and skip the physical queue entirely",
              },
              {
                icon: Clock,
                title: "Live Queue Status",
                description: "Real-time updates on your position and estimated wait time",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description: "Get notified when it's almost your turn via SMS or app push",
              },
              {
                icon: Smartphone,
                title: "Virtual Waiting",
                description: "Wait from anywhere - home, car, or nearby cafe with peace of mind",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4 text-xs font-medium uppercase tracking-wider">
              How It Works
            </Badge>
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Book Your Spot",
                description: "Choose your preferred time slot and service type through our easy-to-use booking system",
              },
              {
                step: "02",
                title: "Track in Real-Time",
                description: "Monitor your queue position and estimated wait time from your phone or computer",
              },
              {
                step: "03",
                title: "Get Notified",
                description: "Receive timely notifications when it's your turn to be served",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="mb-4 text-6xl font-bold text-primary/10">{item.step}</div>
                <h3 className="mb-2 text-2xl font-semibold">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="absolute -right-4 top-12 hidden h-0.5 w-8 bg-gradient-to-r from-primary to-accent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="container mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5" />
            <CardContent className="relative p-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                Ready to Transform Your <span className="gradient-text">Queue Experience?</span>
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of satisfied customers who have eliminated waiting room frustration
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild className="gradient-bg text-base">
                  <Link href="/book-appointment">Book Your First Appointment</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">QFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">Next-generation queue management for modern businesses</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/book-appointment" className="hover:text-foreground">
                    Book Now
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2026 QFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
