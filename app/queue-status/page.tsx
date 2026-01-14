"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, Activity, ArrowLeft, Bell, MapPin } from "lucide-react"

export default function QueueStatusPage() {
  const [position, setPosition] = useState(5)
  const [waitTime, setWaitTime] = useState(25)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => Math.max(1, prev - Math.random() > 0.7 ? 1 : 0))
      setWaitTime((prev) => Math.max(5, prev - Math.random() > 0.7 ? 2 : 0))
      setProgress((prev) => Math.min(100, prev + 2))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-primary/5 to-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">QFlow</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <Badge className="gradient-bg mb-4">Live Status</Badge>
          <h1 className="mb-4 text-4xl font-bold">
            Your Queue <span className="gradient-text">Status</span>
          </h1>
          <p className="text-lg text-muted-foreground">Real-time updates on your position and wait time</p>
        </div>

        <div className="space-y-6">
          {/* Current Position Card */}
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Current Position</h2>
                <Badge variant="outline" className="text-sm">
                  <Activity className="mr-1 h-3 w-3" />
                  Live Updates
                </Badge>
              </div>
              <div className="mb-6 text-center">
                <div className="mb-2 text-7xl font-bold gradient-text">#{position}</div>
                <div className="text-muted-foreground">in the queue</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Queue Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Wait Time Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Estimated Wait Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-4xl font-bold">{waitTime} mins</div>
                <p className="text-sm text-muted-foreground">Based on current service rate and queue length</p>
              </CardContent>
            </Card>

            {/* People Ahead Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  People Ahead
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-4xl font-bold">{position - 1}</div>
                <p className="text-sm text-muted-foreground">
                  {position === 1 ? "You're next! Please be ready" : "customers before your turn"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>Your booking information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Healthcare Clinic - Downtown</div>
                  <div className="text-sm text-muted-foreground">123 Medical Street, Suite 100</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Scheduled Time</div>
                  <div className="text-sm text-muted-foreground">Today, 2:30 PM - General Consultation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Notifications Enabled</div>
                  <div className="text-sm text-muted-foreground">You'll receive SMS when it's your turn</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1 bg-transparent">
              Cancel Appointment
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Reschedule
            </Button>
            <Button className="gradient-bg flex-1">
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
