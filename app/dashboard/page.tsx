"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, TrendingUp, Calendar, Activity, LogOut, Power, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { 
  createTodayQueue, 
  getTodayQueue, 
  callNextCustomer, 
  completeService,
  subscribeToQueueAppointments,
  subscribeToQueue,
  closeQueue,
  updateAvgServiceTime,
  getBusinessFeedbacks
} from "@/lib/firebase/queue-operations"

export default function DashboardPage() {
  const { user, userData, loading, signOut } = useAuth()
  const router = useRouter()
  
  const [queue, setQueue] = useState(null)
  const [queueLoading, setQueueLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [newTimeValue, setNewTimeValue] = useState("15")
  const [feedbacks, setFeedbacks] = useState([])
  const [averageRating, setAverageRating] = useState("0")

  // Fetch all lifetime feedbacks
  useEffect(() => {
    if (user?.uid) {
      loadFeedbacks(user.uid)
    }
  }, [user?.uid])

  const loadFeedbacks = async (businessId) => {
    const res = await getBusinessFeedbacks(businessId);
    if (res.success) {
      setFeedbacks(res.data);
      setAverageRating(res.averageRating);
    }
  }

  useEffect(() => {
    if (queue?.avgServiceTime) {
      setNewTimeValue(queue.avgServiceTime.toString())
    }
  }, [queue?.avgServiceTime])

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Initialize or get today's queue
  useEffect(() => {
    if (user && userData) {
      initializeQueue()
    }
  }, [user, userData])

  // Subscribe to real-time queue updates
  useEffect(() => {
    if (queue?.id) {
      const unsubscribeQueue = subscribeToQueue(queue.id, (updatedQueue) => {
        setQueue(updatedQueue)
      })

      const unsubscribeAppointments = subscribeToQueueAppointments(queue.id, (updatedAppointments) => {
        setAppointments(updatedAppointments)
      })

      return () => {
        unsubscribeQueue()
        unsubscribeAppointments()
      }
    }
  }, [queue?.id])

  const initializeQueue = async () => {
    setQueueLoading(true)
    
    const businessId = user?.uid;
    if (!businessId) return;
    
    // Try to get existing queue
    let result = await getTodayQueue(businessId)
    
    if (result.success) {
      setQueue({ id: result.id, ...result.data })
    } else {
      setQueue(null)
    }
    
    setQueueLoading(false)
  }

  const handleOpenQueue = async () => {
    setActionLoading(true)
    setError("")
    
    const businessId = user?.uid;
    const businessName = userData?.businessName || userData?.name || "Business";
    
    const result = await createTodayQueue(businessId, businessName);
    if (result.success) {
      await initializeQueue();
    } else {
      setError(result.error || "Failed to open queue");
    }
    setActionLoading(false)
  }

  const handleCloseQueue = async () => {
    if (!queue?.id) return;
    setActionLoading(true)
    setError("")
    
    const result = await closeQueue(queue.id);
    if (result.success) {
      setQueue(null);
      setAppointments([]);
    } else {
      setError(result.error || "Failed to close queue");
    }
    setActionLoading(false)
  }

  const handleSaveTime = async () => {
    if (!queue?.id) return;
    setActionLoading(true)
    setError("")
    
    const result = await updateAvgServiceTime(queue.id, newTimeValue);
    if (!result.success) {
      setError(result.error || "Failed to update service time");
    }
    setActionLoading(false)
  }

  const handleCallNext = async () => {
    if (!queue?.id) return
    
    setActionLoading(true)
    setError("")
    
    const result = await callNextCustomer(queue.id)
    
    if (!result.success) {
      setError(result.error || "Failed to call next customer")
    }
    
    setActionLoading(false)
  }

  const handleCompleteService = async () => {
    if (!queue?.id) return
    
    const inServiceAppointment = appointments.find(apt => apt.status === 'in-service')
    
    if (!inServiceAppointment) {
      setError("No customer currently in service")
      return
    }
    
    setActionLoading(true)
    setError("")
    
    const result = await completeService(inServiceAppointment.id, queue.id)
    
    if (!result.success) {
      setError(result.error || "Failed to complete service")
    }
    
    setActionLoading(false)
  }

  // Show loading state
  if (loading || queueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-primary/5 to-background">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const waitingAppointments = appointments.filter(apt => apt.status === 'waiting')
  const inServiceAppointment = appointments.find(apt => apt.status === 'in-service')
  const completedToday = appointments.filter(apt => apt.status === 'completed').length

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
            <Button variant="ghost">{userData?.name || user.email?.split('@')[0] || 'Profile'}</Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome Back, <span className="gradient-text">{userData?.name || user.email?.split('@')[0] || 'Admin'}</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your queue today</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active in Queue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{waitingAppointments.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Currently waiting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Token</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {inServiceAppointment ? `#${inServiceAppointment.tokenNumber}` : 'None'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {inServiceAppointment ? 'In service' : 'No active service'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Served Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedToday}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Completed services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{queue?.currentNumber || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">Issued today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customer Avg</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageRating}</div>
              <p className="mt-1 text-xs text-muted-foreground">Lifetime rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="queue">Live Queue</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                {!queue ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    Your queue is currently closed. Open the queue to start receiving customers.
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No customers in queue yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .filter(apt => apt.status !== 'completed')
                      .map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                              #{appointment.tokenNumber}
                            </div>
                            <div>
                              <div className="font-medium">{appointment.userName || 'Customer'}</div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.serviceType || 'General Service'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {appointment.estimatedWaitTime || 15} min
                              </div>
                              <div className="text-xs text-muted-foreground">Est. wait</div>
                            </div>
                            <Badge
                              variant={
                                appointment.status === "in-service"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {appointment.status === 'in-service' ? 'In Service' : 'Waiting'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Today</CardTitle>
                <CardDescription>Services completed today</CardDescription>
              </CardHeader>
              <CardContent>
                {completedToday === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed services yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .filter(apt => apt.status === 'completed')
                      .map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <div className="font-medium">{appointment.userName || 'Customer'}</div>
                            <div className="text-sm text-muted-foreground">
                              Token #{appointment.tokenNumber} • {appointment.serviceType || 'Service'}
                            </div>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  Customer Feedbacks
                </CardTitle>
                <CardDescription>What people are saying about their service</CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    No customer feedback received yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb) => (
                      <div key={fb.id} className="p-4 rounded-lg border border-border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${fb.rating >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground stroke-1"}`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fb.createdAt?.seconds ? new Date(fb.createdAt.seconds * 1000).toLocaleDateString() : ""}
                          </div>
                        </div>
                        {fb.comment ? (
                          <p className="text-sm italic text-foreground mt-2">"{fb.comment}"</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic mt-2">No comment provided.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your queue</CardDescription>
            </CardHeader>
            <CardContent>
              {queue ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Button 
                      className="gradient-bg h-auto flex-col gap-2 py-6"
                      onClick={handleCallNext}
                      disabled={actionLoading || waitingAppointments.length === 0}
                    >
                      <Users className="h-6 w-6" />
                      <span>Call Next Customer</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col gap-2 py-6 bg-transparent"
                      onClick={handleCompleteService}
                      disabled={actionLoading || !inServiceAppointment}
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Complete Service</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col gap-2 py-6 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 bg-transparent"
                      onClick={handleCloseQueue}
                      disabled={actionLoading}
                    >
                      <Power className="h-6 w-6" />
                      <span>Close Queue</span>
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-sm">Average Service Time</h4>
                      <p className="text-xs text-muted-foreground">Adjust this to update the estimated wait time for your customers.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Input 
                         type="number" 
                         className="w-20" 
                         value={newTimeValue} 
                         onChange={(e) => setNewTimeValue(e.target.value)}
                         min={1} 
                       />
                       <span className="text-sm text-muted-foreground whitespace-nowrap">min / person</span>
                       <Button variant="secondary" size="sm" onClick={handleSaveTime} disabled={actionLoading}>Update</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button 
                    className="gradient-bg h-auto flex-col gap-2 py-6 px-12 w-full max-w-sm"
                    onClick={handleOpenQueue}
                    disabled={actionLoading}
                  >
                    <Power className="h-6 w-6" />
                    <span className="text-lg">Open Queue for Today</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}