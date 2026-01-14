"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Users, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BookAppointmentPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    toast({
      title: "Appointment Booked!",
      description: "You'll receive a confirmation SMS shortly.",
    })
  }

  if (isSubmitted) {
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
          </div>
        </header>
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">Appointment Confirmed!</h2>
              <p className="mb-6 text-muted-foreground">
                Your appointment has been successfully booked. You'll receive a confirmation SMS with your queue number
                shortly.
              </p>
              <div className="mb-8 rounded-lg bg-secondary p-6">
                <div className="mb-2 text-sm text-muted-foreground">Your Queue Number</div>
                <div className="mb-4 text-5xl font-bold gradient-text">#47</div>
                <div className="text-sm text-muted-foreground">Estimated Wait Time: 25 minutes</div>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="gradient-bg">
                  <Link href="/queue-status">Track Your Position</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
          <h1 className="mb-4 text-4xl font-bold">
            Book Your <span className="gradient-text">Appointment</span>
          </h1>
          <p className="text-lg text-muted-foreground">Choose your preferred date, time, and service</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Please provide your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type *</Label>
                  <Select required>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                      <SelectItem value="checkup">Health Checkup</SelectItem>
                      <SelectItem value="dental">Dental Care</SelectItem>
                      <SelectItem value="haircut">Haircut & Styling</SelectItem>
                      <SelectItem value="massage">Massage Therapy</SelectItem>
                      <SelectItem value="other">Other Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific requirements or concerns..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Choose your preferred appointment date</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Time Slot</CardTitle>
                  <CardDescription>Available time slots for selected date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant="outline"
                        className="hover:border-primary hover:bg-primary/10 bg-transparent"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button type="submit" size="lg" className="gradient-bg w-full max-w-md text-base">
              Confirm Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
