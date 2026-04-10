import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// QUEUE MANAGEMENT
// ============================================

/**
 * Create a new queue for today
 */
export const createTodayQueue = async (businessId, businessName) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if queue already exists for today
    const q = query(
      collection(db, 'queues'),
      where('businessId', '==', businessId),
      where('date', '==', today),
      limit(1)
    );
    
    const existingQueues = await getDocs(q);
    
    if (!existingQueues.empty) {
      const existingQueue = existingQueues.docs[0];
      return { 
        success: true, 
        id: existingQueue.id,
        data: existingQueue.data(),
        message: 'Queue already exists for today'
      };
    }
    
    // Create new queue
    const docRef = await addDoc(collection(db, 'queues'), {
      businessId,
      businessName,
      date: today,
      status: 'active',
      currentNumber: 0,
      totalServed: 0,
      avgServiceTime: 15, // default 15 minutes
      createdAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      id: docRef.id,
      message: 'Queue created successfully'
    };
  } catch (error) {
    console.error('Error creating queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Close an active queue
 */
export const closeQueue = async (queueId) => {
  try {
    await updateDoc(doc(db, 'queues', queueId), {
      status: 'closed'
    });
    return { success: true };
  } catch (error) {
    console.error('Error closing queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update Average Service Time
 */
export const updateAvgServiceTime = async (queueId, newTime) => {
  try {
    await updateDoc(doc(db, 'queues', queueId), {
      avgServiceTime: parseInt(newTime, 10) || 15
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating avg service time:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit Feedback
 */
export const submitFeedback = async (businessId, userId, appointmentId, rating, comment) => {
  try {
    const feedbackRef = await addDoc(collection(db, 'feedbacks'), {
      businessId,
      userId,
      appointmentId,
      rating,
      comment,
      createdAt: serverTimestamp()
    });
    return { success: true, id: feedbackRef.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get Feedback for Business
 */
export const getBusinessFeedbacks = async (businessId) => {
  try {
    const q = query(
      collection(db, 'feedbacks'),
      where('businessId', '==', businessId)
    );
    const querySnapshot = await getDocs(q);
    const feedbacks = [];
    let totalRating = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      feedbacks.push({ 
        id: doc.id, 
        ...data,
        timeMs: data.createdAt ? (data.createdAt.toMillis ? data.createdAt.toMillis() : data.createdAt.seconds * 1000) : 0 
      });
      totalRating += (data.rating || 0);
    });
    
    // Sort descending by created time (newest first)
    feedbacks.sort((a, b) => b.timeMs - a.timeMs);
    
    const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;
    
    return { success: true, data: feedbacks, averageRating };
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all admin businesses
 */
export const getAdminBusinesses = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'admin')
    );
    
    const querySnapshot = await getDocs(q);
    const businesses = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.businessName) {
        businesses.push({ 
          id: doc.id, 
          businessName: data.businessName,
          businessType: data.businessType || 'other'
        });
      }
    });
    
    return { success: true, data: businesses };
  } catch (error) {
    console.error('Error getting businesses:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get active queue for today
 */
export const getTodayQueue = async (businessId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const q = query(
      collection(db, 'queues'),
      where('businessId', '==', businessId),
      where('date', '==', today),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'No active queue found for today' };
    }
    
    const queueDoc = querySnapshot.docs[0];
    return { 
      success: true, 
      id: queueDoc.id,
      data: queueDoc.data()
    };
  } catch (error) {
    console.error('Error getting queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Join queue and get token number
 */
export const joinQueue = async (queueId, userId, userName, serviceType) => {
  try {
    // Get current queue to get next token number
    const queueDoc = await getDoc(doc(db, 'queues', queueId));
    
    if (!queueDoc.exists()) {
      return { success: false, error: 'Queue not found' };
    }
    
    const queueData = queueDoc.data();
    const nextTokenNumber = (queueData.currentNumber || 0) + 1;
    
    // Create appointment/token
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      queueId,
      userId,
      userName,
      serviceType,
      tokenNumber: nextTokenNumber,
      status: 'waiting',
      estimatedWaitTime: queueData.avgServiceTime * nextTokenNumber,
      joinedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    // Update queue's current number
    await updateDoc(doc(db, 'queues', queueId), {
      currentNumber: nextTokenNumber
    });
    
    return { 
      success: true, 
      id: appointmentRef.id,
      tokenNumber: nextTokenNumber,
      estimatedWaitTime: queueData.avgServiceTime * nextTokenNumber
    };
  } catch (error) {
    console.error('Error joining queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Call next customer (Admin function)
 */
export const callNextCustomer = async (queueId) => {
  try {
    // Get next waiting appointment
    const q = query(
      collection(db, 'appointments'),
      where('queueId', '==', queueId),
      where('status', '==', 'waiting'),
      orderBy('tokenNumber', 'asc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'No customers in queue' };
    }
    
    const nextAppointment = querySnapshot.docs[0];
    
    // Update appointment status
    await updateDoc(doc(db, 'appointments', nextAppointment.id), {
      status: 'in-service',
      serviceStartTime: serverTimestamp()
    });
    
    return { 
      success: true, 
      appointmentId: nextAppointment.id,
      data: nextAppointment.data()
    };
  } catch (error) {
    console.error('Error calling next customer:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete service for current customer
 */
export const completeService = async (appointmentId, queueId) => {
  try {
    // Update appointment
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'completed',
      serviceEndTime: serverTimestamp()
    });
    
    // Update queue stats
    await updateDoc(doc(db, 'queues', queueId), {
      totalServed: increment(1)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error completing service:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's active appointment
 */
export const getUserActiveAppointment = async (userId) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      where('status', 'in', ['waiting', 'in-service']),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'No active appointment found' };
    }
    
    const appointment = querySnapshot.docs[0];
    return { 
      success: true, 
      id: appointment.id,
      data: appointment.data()
    };
  } catch (error) {
    console.error('Error getting user appointment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all appointments for a queue
 */
export const getQueueAppointments = async (queueId) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('queueId', '==', queueId),
      orderBy('tokenNumber', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error getting queue appointments:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to queue updates (Real-time)
 */
export const subscribeToQueue = (queueId, callback) => {
  return onSnapshot(doc(db, 'queues', queueId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

/**
 * Subscribe to queue appointments (Real-time)
 */
export const subscribeToQueueAppointments = (queueId, callback) => {
  const q = query(
    collection(db, 'appointments'),
    where('queueId', '==', queueId),
    orderBy('tokenNumber', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    callback(appointments);
  });
};