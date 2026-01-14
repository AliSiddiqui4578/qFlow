"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, TrendingUp, Calendar, Activity } from "lucide-react"

export default function DashboardPage() {
  const [activeQueue, setActiveQueue] = useState(12)

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
          <div className="flex items-center gap-3">
            <Badge variant="outline">Admin Dashboard</Badge>
            <Button variant="ghost">Profile</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome Back, <span className="gradient-text">Admin</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your queue today</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active in Queue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeQueue}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="text-primary">+2</span> from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18 min</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="text-green-600">-5 min</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Served Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">47</div>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="text-primary">+12%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">23</div>
              <p className="mt-1 text-xs text-muted-foreground">8 remaining today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="queue">Live Queue</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Queue Status
                </CardTitle>
                <CardDescription>Currently active customers in queue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      position: 1,
                      name: "Sarah Johnson",
                      service: "General Consultation",
                      time: "5 mins",
                      status: "In Service",
                    },
                    { position: 2, name: "Michael Chen", service: "Health Checkup", time: "12 mins", status: "Next" },
                    { position: 3, name: "Emily Davis", service: "Dental Care", time: "18 mins", status: "Waiting" },
                    {
                      position: 4,
                      name: "James Wilson",
                      service: "Haircut & Styling",
                      time: "25 mins",
                      status: "Waiting",
                    },
                    {
                      position: 5,
                      name: "Amanda Brown",
                      service: "Massage Therapy",
                      time: "32 mins",
                      status: "Waiting",
                    },
                  ].map((customer) => (
                    <div key={customer.position} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          #{customer.position}
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.service}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{customer.time}</div>
                          <div className="text-xs text-muted-foreground">Est. wait</div>
                        </div>
                        <Badge
                          variant={
                            customer.status === "In Service"
                              ? "default"
                              : customer.status === "Next"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
                <CardDescription>Scheduled appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: "09:00 AM", name: "John Smith", service: "General Consultation", status: "Completed" },
                    { time: "10:30 AM", name: "Lisa Anderson", service: "Health Checkup", status: "Completed" },
                    { time: "02:00 PM", name: "Robert Taylor", service: "Dental Care", status: "In Progress" },
                    { time: "03:30 PM", name: "Maria Garcia", service: "Massage Therapy", status: "Upcoming" },
                    { time: "05:00 PM", name: "David Lee", service: "Haircut & Styling", status: "Upcoming" },
                  ].map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-medium">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{appointment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.time} - {appointment.service}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          appointment.status === "Completed"
                            ? "secondary"
                            : appointment.status === "In Progress"
                              ? "default"
                              : "outline"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Customer service history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      date: "Today, 11:45 AM",
                      name: "Patricia Martinez",
                      service: "General Consultation",
                      duration: "15 min",
                    },
                    {
                      date: "Today, 10:30 AM",
                      name: "Christopher White",
                      service: "Health Checkup",
                      duration: "20 min",
                    },
                    { date: "Today, 09:15 AM", name: "Jennifer Thompson", service: "Dental Care", duration: "25 min" },
                    {
                      date: "Yesterday, 5:30 PM",
                      name: "Daniel Harris",
                      service: "Haircut & Styling",
                      duration: "18 min",
                    },
                    {
                      date: "Yesterday, 4:00 PM",
                      name: "Jessica Clark",
                      service: "Massage Therapy",
                      duration: "30 min",
                    },
                  ].map((record, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.service} • {record.date}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{record.duration}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your queue and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Button className="gradient-bg h-auto flex-col gap-2 py-6">
                  <Users className="h-6 w-6" />
                  <span>Call Next Customer</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
                  <Calendar className="h-6 w-6" />
                  <span>Add Walk-in</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
                  <TrendingUp className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
