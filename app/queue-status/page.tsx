"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, TrendingUp, ArrowRight, LogOut, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  getTodayQueue,
  joinQueue,
  getUserActiveAppointment,
  subscribeToQueue,
  subscribeToQueueAppointments,
  getAdminBusinesses,
  submitFeedback
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
  
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  
  const [businesses, setBusinesses] = useState([])
  const [selectedType, setSelectedType] = useState('salon')
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [availableBusinesses, setAvailableBusinesses] = useState([])

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Load initial data
  useEffect(() => {
    if (user && userData) {
      loadInitialData()
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
        const userApt = updatedAppointments.find(apt => apt.userId === user?.uid)
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

  const loadInitialData = async () => {
    setQueueLoading(true)

    // 1. Check if user already has an active appointment
    const appointmentResult = await getUserActiveAppointment(user.uid)
    if (appointmentResult.success) {
      setMyAppointment(appointmentResult.data)
      setQueue({ id: appointmentResult.data.queueId })
      setQueueLoading(false)
      return
    }

    // 2. Load available businesses
    const businessesResult = await getAdminBusinesses()
    if (businessesResult.success) {
      setBusinesses(businessesResult.data)
      updateAvailableBusinesses('salon', businessesResult.data)
    }

    setQueueLoading(false)
  }

  const updateAvailableBusinesses = (type, allBusinesses = businesses) => {
    const filtered = allBusinesses.filter(b => b.businessType === type)
    setAvailableBusinesses(filtered)
    if (filtered.length > 0) {
      handleBusinessChange(filtered[0].id)
    } else {
      setSelectedBusinessId('')
      setQueue(null)
      setAppointments([])
    }
  }

  const handleTypeChange = (type) => {
    setSelectedType(type)
    updateAvailableBusinesses(type)
  }

  const handleBusinessChange = async (businessId) => {
    setSelectedBusinessId(businessId)
    if (!businessId) return
    
    // Check if that business has an active queue today
    const queueResult = await getTodayQueue(businessId)
    if (queueResult.success) {
      setQueue({ id: queueResult.id, ...queueResult.data })
      setError("")
    } else {
      setQueue(null)
      setAppointments([])
    }
  }

  const handleJoinQueue = async () => {
    if (!queue?.id || !user || !userData || !selectedBusinessId) return

    setJoinLoading(true)
    setError("")

    const result = await joinQueue(
      queue.id,
      user.uid,
      userData.name || user.email?.split('@')[0] || 'Customer',
      'Standard' // Using a default since serviceType is removed
    )

    if (result.success) {
      setMyAppointment({
        id: result.id,
        tokenNumber: result.tokenNumber,
        estimatedWaitTime: result.estimatedWaitTime,
        status: 'waiting',
        userId: user.uid,
        userName: userData.name,
        serviceType: 'Standard'
      })
    } else {
      setError(result.error || "Failed to join queue")
    }

    setJoinLoading(false)
  }

  const handleSubmitFeedback = async () => {
    if (!queue?.businessId || !myAppointment) return;
    
    setFeedbackLoading(true);
    await submitFeedback(
      queue.businessId,
      user.uid,
      myAppointment.id,
      rating,
      comment
    );
    
    setMyAppointment(null);
    setRating(0);
    setComment("");
    setFeedbackLoading(false);
  };

  const handleSkipFeedback = () => {
    setMyAppointment(null);
    setRating(0);
    setComment("");
  };

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
                <CardTitle>Find a Business</CardTitle>
                <CardDescription>Select a business to join their queue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-type">Business Type</Label>
                    <select
                      id="business-type"
                      value={selectedType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                      <option value="salon">Salon</option>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-name">Select Business</Label>
                    <select
                      id="business-name"
                      value={selectedBusinessId}
                      onChange={(e) => handleBusinessChange(e.target.value)}
                      className={`w-full px-3 py-2 border border-input rounded-lg ${availableBusinesses.length > 0 ? 'bg-background text-primary' : 'bg-muted text-muted-foreground'}`}
                      disabled={availableBusinesses.length === 0}
                    >
                      {availableBusinesses.length === 0 && <option value="">No businesses found</option>}
                      {availableBusinesses.map(b => (
                        <option key={b.id} value={b.id}>{b.businessName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {queue ? (
                  <>
                    <div className="pt-4 mt-4 border-t border-border">
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg mb-3">
                        <span className="text-sm font-medium">People in Queue</span>
                        <span className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'waiting').length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <span className="text-sm font-medium">Estimated Wait</span>
                        <span className="text-2xl font-bold">{(queue.avgServiceTime || 15) * appointments.filter(apt => apt.status === 'waiting').length} min</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleJoinQueue}
                      disabled={joinLoading}
                      className="w-full gradient-bg mt-4"
                    >
                      {joinLoading ? "Joining..." : "Join Queue"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="pt-4 mt-4 border-t border-border text-center text-sm font-medium text-muted-foreground p-4 bg-secondary/50 rounded-lg">
                    {selectedBusinessId ? "This business hasn't opened their queue today." : "Please select a business to continue"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : myAppointment.status === 'completed' ? (
          // Feedback view
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Service <span className="gradient-text">Completed</span></h1>
              <p className="text-muted-foreground">How was your experience today?</p>
            </div>
            
            <Card className="max-w-md mx-auto border-2 border-primary/20">
              <CardContent className="pt-6 space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 p-1"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground stroke-1"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label>Optional Comment</Label>
                  <textarea
                    className="w-full min-h-[100px] border border-input rounded-md bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us what you liked or what could be improved..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full gradient-bg h-12 text-lg"
                    disabled={rating === 0 || feedbackLoading}
                    onClick={handleSubmitFeedback}
                  >
                    {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleSkipFeedback}
                    disabled={feedbackLoading}
                  >
                    Skip
                  </Button>
                </div>
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