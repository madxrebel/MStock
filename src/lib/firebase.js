import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs, addDoc, QuerySnapshot } from 'firebase/firestore'

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics only on the client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, googleProvider, analytics };

export async function getSupplierData(id) {
  const docRef = doc(db, 'suppliers', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }

  return null;
}

export async function getSupplierStats(supplierId) {
  // Implement the logic to calculate and return supplier stats
  // This is a placeholder implementation
  return {
    totalRevenue: 100000,
    totalOrders: 1000,
    totalCustomers: 500,
    activeProducts: 100
  }
}

export async function getRecentOrders(supplierId) {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getRecentTransactions(supplierId) {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('supplierId', '==', supplierId),
    orderBy('date', 'desc'),
    limit(5)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getTopProducts(supplierId) {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('supplierId', '==', supplierId),
    orderBy('soldQuantity', 'desc'),
    limit(5)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getCustomers(supplierId) {
  const customersRef = collection(db, 'customers');
  const q = query(
    customersRef,
    where('supplierId', '==', supplierId),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getRecentCustomers(supplierId) {
  const customersRef = collection(db, 'customers');
  const q = query(
    customersRef,
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function addCustomer(supplierId, customerData) {
  const customersRef = collection(db, 'customers')
  await addDoc(customersRef, {
    ...customerData,
    supplierId,
    createdAt: new Date()
  })
}

export async function getRevenueData(supplierId) {
  const ordersRef = collection(db, 'orders');
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const q = query(
    ordersRef,
    where('supplierId', '==', supplierId),
    where('createdAt', '>=', sixMonthsAgo),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const monthlyRevenue = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

    if (!monthlyRevenue[monthYear]) {
      monthlyRevenue[monthYear] = 0;
    }
    monthlyRevenue[monthYear] += data.total;
  });

  return Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue }));
}

export async function getOrders(supplierId) {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getInventory(supplierId) {
  // Step 1: Fetch the supplier document using supplierId
  const supplierRef = doc(db, 'suppliers', supplierId);
  const supplierSnap = await getDoc(supplierRef);
  console.log(supplierId)
  // Check if the supplier document exists
  if (!supplierSnap.exists()) {
    throw new Error(`Supplier with ID ${supplierId} does not exist`);
  }

  // Extract the createdBy field from the supplier document
  const { createdBy } = supplierSnap.data();
  console.log("createdBy: ",createdBy)

  // Step 2: Use the createdBy value to query the products collection
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('createdBy', '==', createdBy)
    // orderBy('name', 'asc')
  );

  // Fetch the products
  const querySnapshot = await getDocs(q);

  // Return the products as an array of objects
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProducts() {
  const productsRef = collection(db, 'products');
  const q = query(productsRef, orderBy('productName', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function createOrder(cartItems, totalAmount) {
  const ordersRef = collection(db, 'orders');
  const newOrder = {
    items: cartItems,
    totalAmount,
    status: 'pending',
    createdAt: new Date(),
  };
  await addDoc(ordersRef, newOrder);
}

