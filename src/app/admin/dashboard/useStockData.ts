"use client"

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // Adjust import path
import { collection, getDocs } from "firebase/firestore";

export const useStockData = () => {
  const [highStock, setHighStock] = useState(0);
  const [lowStock, setLowStock] = useState(0);

  useEffect(() => {
    const fetchStockData = async () => {
      const productsSnapshot = await getDocs(collection(db, "products"));
      let highCount = 0;
      let lowCount = 0;

      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.packedStock > 150) highCount++;
        else lowCount++;
      });

      setHighStock(highCount);
      setLowStock(lowCount);
    };

    fetchStockData();
  }, []);

  return { highStock, lowStock };
};
