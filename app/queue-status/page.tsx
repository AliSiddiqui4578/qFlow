"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, TrendingUp, ArrowRight, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getTodayQueue,
  joinQueue,
  getUserActiveAppointment,
  subscribeToQueue,
  subscribeToQueueAppointments
} from "@/lib/firebase/queue-operations"

export default function QueueStatusPage() {
  const { user, userData, loading, signOut } = useAuth()
  const router = useRouter()

  const [queue, setQueue] = useState(null)
  const [myAppointment, setMyAppointment] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [queueLoading, setQueueLoading] = useState(true)
  const [joinLoading, setJoinLoading] = useState(false)
  const [error, setError] = useState("")
  const [serviceType, setServiceType] = useState("General Consultation")

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Load queue and check if user already has an appointment
  useEffect(() => {
    if (user && userData) {
      loadQueueData()
    }
  }, [user, userData])

  // Subscribe to real-time updates
  useEffect(() => {
    if (queue?.id) {
      const unsubscribeQueue = subscribeToQueue(queue.id, (updatedQueue) => {
        setQueue(updatedQueue)
      })

      const unsubscribeAppointments = subscribeToQueueAppointments(queue.id, (updatedAppointments) => {
        setAppointments(updatedAppointments)
        
        // Update user's appointment if it exists
        const userApt = updatedAppointments.find(apt => apt.userId === user.uid)
        if (userApt) {
          setMyAppointment(userApt)
        }
      })

      return () => {
        unsubscribeQueue()
        unsubscribeAppointments()
      }
    }
  }, [queue?.id, user?.uid])

  const loadQueueData = async () => {
    setQueueLoading(true)

    // Get today's queue
    const businessId = "demo-business-001"
    const queueResult = await getTodayQueue(businessId)

    if (queueResult.success) {
      setQueue({ id: queueResult.id, ...queueResult.data })

      // Check if user already has an active appointment
      const appointmentResult = await getUserActiveAppointment(user.uid)
      if (appointmentResult.success) {
        setMyAppointment(appointmentResult.data)
      }
    } else {
      setError("No active queue available today. Please contact the admin.")
    }

    setQueueLoading(false)
  }

  const handleJoinQueue = async () => {
    if (!queue?.id || !user || !userData) return

    setJoinLoading(true)
    setError("")

    const result = await joinQueue(
      queue.id,
      user.uid,
      userData.name || user.email?.split('@')[0] || 'Customer',
      serviceType
    )

    if (result.success) {
      setMyAppointment({
        id: result.id,
        tokenNumber: result.tokenNumber,
        estimatedWaitTime: result.estimatedWaitTime,
        status: 'waiting',
        userId: user.uid,
        userName: userData.name,
        serviceType
      })
    } else {
      setError(result.error || "Failed to join queue")
    }

    setJoinLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (loading || queueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-primary/5 to-background">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const myPosition = myAppointment 
    ? appointments.filter(apt => apt.status === 'waiting' && apt.tokenNumber < myAppointment.tokenNumber).length + 1
    : null

  const peopleAhead = myPosition ? myPosition - 1 : 0

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
            <span className="text-sm text-muted-foreground">
              {userData?.name || user.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {!myAppointment ? (
          // Join Queue View
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Join the <span className="gradient-text">Queue</span>
              </h1>
              <p className="text-muted-foreground">
                Get your token and track your position in real-time
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Queue Information</CardTitle>
                <CardDescription>Current queue status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">People in Queue</span>
                  <span className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'waiting').length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Estimated Wait</span>
                  <span className="text-2xl font-bold">{(queue?.avgServiceTime || 15) * appointments.filter(apt => apt.status === 'waiting').length} min</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <select
                    id="service-type"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  >
                    <option value="General Consultation">General Consultation</option>
                    <option value="Health Checkup">Health Checkup</option>
                    <option value="Dental Care">Dental Care</option>
                    <option value="Haircut & Styling">Haircut & Styling</option>
                    <option value="Massage Therapy">Massage Therapy</option>
                  </select>
                </div>

                <Button
                  onClick={handleJoinQueue}
                  disabled={joinLoading}
                  className="w-full gradient-bg"
                >
                  {joinLoading ? "Joining..." : "Join Queue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Queue Status View
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                Your <span className="gradient-text">Queue Status</span>
              </h1>
              <p className="text-muted-foreground">Live updates on your position</p>
            </div>

            {/* Token Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <Badge className="mx-auto mb-2 gradient-bg">
                  {myAppointment.status === 'in-service' ? 'In Service' : 'Waiting'}
                </Badge>
                <CardTitle className="text-4xl">Token #{myAppointment.tokenNumber}</CardTitle>
                <CardDescription>{myAppointment.serviceType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{myPosition || '-'}</div>
                    <div className="text-xs text-muted-foreground">Your Position</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{peopleAhead}</div>
                    <div className="text-xs text-muted-foreground">Ahead of You</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {myAppointment.estimatedWaitTime || 15} min
                    </div>
                    <div className="text-xs text-muted-foreground">Est. Wait</div>
                  </div>
                </div>

                {myAppointment.status === 'in-service' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="font-semibold text-green-800">🎉 Your turn! Please proceed to the counter.</p>
                  </div>
                )}

                {myAppointment.status === 'waiting' && myPosition === 1 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="font-semibold text-yellow-800">⚠️ You're next! Please stay nearby.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Queue Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Queue Progress
                </CardTitle>
                <CardDescription>Current queue status - {queue?.currentNumber || 0} tokens issued</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {appointments
                    .filter(apt => apt.status !== 'completed')
                    .slice(0, 5)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          appointment.id === myAppointment.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                            #{appointment.tokenNumber}
                          </div>
                          <span className="text-sm font-medium">
                            {appointment.id === myAppointment.id ? 'You' : `Token ${appointment.tokenNumber}`}
                          </span>
                        </div>
                        <Badge variant={appointment.status === 'in-service' ? 'default' : 'outline'}>
                          {appointment.status === 'in-service' ? 'In Service' : 'Waiting'}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}