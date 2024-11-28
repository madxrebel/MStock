"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  date: Timestamp;
}

export default function DashboardPage() {
  const [totalUnpacked, setTotalUnpacked] = useState(0);
  const [totalPacked, setTotalPacked] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) 
    {
      console.log("not authenticated!");
      return;
    }

    const q = query(collection(db, "products"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let unpacked = 0;
      let packed = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        unpacked += data.unpackedStock ?? 0;
        packed += data.packedStock ?? 0;
      });
      setTotalUnpacked(unpacked);
      setTotalPacked(packed);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc"),
      limit(5)
    );
    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (querySnapshot) => {
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setRecentTransactions(transactions);
        console.log(recentTransactions)
      }
    );

    return () => {
      unsubscribe();
      unsubscribeTransactions();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar>
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback>
            {user.displayName?.[0] || user.email?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user.displayName || user.email}
          </h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Unpacked Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnpacked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packed Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacked}</div>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Recent Transactions</h2>
      {recentTransactions.length === 0 ? (
        <p className="text-gray-500">No transactions to display</p>
      ) : (
        <ul>
          {recentTransactions.map((transaction) => (
            <li key={transaction.id} className="mb-2">
              {transaction.type} - {transaction.quantity} units on{" "}
              {transaction.date.toDate().toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
