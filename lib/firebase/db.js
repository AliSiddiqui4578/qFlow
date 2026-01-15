import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// USER OPERATIONS
// ============================================

export const createUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const getUser = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

export const updateUser = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BUSINESS OPERATIONS
// ============================================

export const createBusiness = async (businessData) => {
  try {
    const docRef = await addDoc(collection(db, 'businesses'), {
      ...businessData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating business:', error);
    return { success: false, error: error.message };
  }
};

export const getBusiness = async (businessId) => {
  try {
    const docSnap = await getDoc(doc(db, 'businesses', businessId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Business not found' };
  } catch (error) {
    console.error('Error getting business:', error);
    return { success: false, error: error.message };
  }
};

export const getAllBusinesses = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'businesses'));
    const businesses = [];
    querySnapshot.forEach((doc) => {
      businesses.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: businesses };
  } catch (error) {
    console.error('Error getting businesses:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// QUEUE OPERATIONS
// ============================================

export const createQueue = async (queueData) => {
  try {
    const docRef = await addDoc(collection(db, 'queues'), {
      ...queueData,
      currentNumber: 0,
      status: 'active',
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating queue:', error);
    return { success: false, error: error.message };
  }
};

export const getQueue = async (queueId) => {
  try {
    const docSnap = await getDoc(doc(db, 'queues', queueId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Queue not found' };
  } catch (error) {
    console.error('Error getting queue:', error);
    return { success: false, error: error.message };
  }
};

export const updateQueue = async (queueId, updates) => {
  try {
    await updateDoc(doc(db, 'queues', queueId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating queue:', error);
    return { success: false, error: error.message };
  }
};

export const getActiveQueueByBusiness = async (businessId) => {
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
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { success: true, data: { id: doc.id, ...doc.data() } };
    }
    return { success: false, error: 'No active queue found' };
  } catch (error) {
    console.error('Error getting active queue:', error);
    return { success: false, error: error.message };
  }
};

// Real-time queue listener
export const subscribeToQueue = (queueId, callback) => {
  return onSnapshot(doc(db, 'queues', queueId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// ============================================
// APPOINTMENT OPERATIONS
// ============================================

export const createAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      status: 'waiting',
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: error.message };
  }
};

export const getAppointment = async (appointmentId) => {
  try {
    const docSnap = await getDoc(doc(db, 'appointments', appointmentId));
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Appointment not found' };
  } catch (error) {
    console.error('Error getting appointment:', error);
    return { success: false, error: error.message };
  }
};

export const updateAppointment = async (appointmentId, updates) => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error: error.message };
  }
};

export const getUserAppointments = async (userId) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: appointments };
  } catch (error) {
    console.error('Error getting user appointments:', error);
    return { success: false, error: error.message };
  }
};

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

// Real-time appointments listener
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

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      read: false,
      sentAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('sentAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};