"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { withAuth } from "@/components/with-auth"
import { BarChart } from "@tremor/react"

type Transaction = {
  id: string
  productId: string
  type: "packing" | "supply" | "return"
  quantity: number
  date: Timestamp
}

type Product = {
  id: string
  name: string
}

type ChartData = {
  name: string
  packing: number
  supply: number
  return: number
}

function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily")
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const transactionsQuery = query(collection(db, "transactions"))
    const unsubscribeTransactions = onSnapshot(transactionsQuery, (querySnapshot) => {
      const transactionsArray: Transaction[] = []
      querySnapshot.forEach((doc) => {
        transactionsArray.push({ id: doc.id, ...doc.data() } as Transaction)
      })
      setTransactions(transactionsArray)
    })

    const productsQuery = query(collection(db, "products"))
    const unsubscribeProducts = onSnapshot(productsQuery, (querySnapshot) => {
      const productsArray: Product[] = []
      querySnapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, name: doc.data().name })
      })
      setProducts(productsArray)
    })

    return () => {
      unsubscribeTransactions()
      unsubscribeProducts()
    }
  }, [])

  useEffect(() => {
    const generateChartData = () => {
      const now = new Date()
      const filteredTransactions = transactions.filter((t) => {
        const transactionDate = t.date.toDate()
        if (timeRange === "daily") {
          return transactionDate.getDate() === now.getDate() &&
                 transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear()
        } else if (timeRange === "weekly") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        } else if (timeRange === "monthly") {
          return transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear()
        }
      })

      const data: { [key: string]: ChartData } = {}
      filteredTransactions.forEach((t) => {
        const product = products.find((p) => p.id === t.productId)
        if (product) {
          if (!data[product.name]) {
            data[product.name] = { name: product.name, packing: 0, supply: 0, return: 0 }
          }
          data[product.name][t.type] += t.quantity
        }
      })

      setChartData(Object.values(data))
    }

    generateChartData()
  }, [transactions, products, timeRange])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Reports</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={timeRange} onValueChange={(value: "daily" | "weekly" | "monthly") => setTimeRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <BarChart
            className="h-80"
            data={chartData}
            index="name"
            categories={["packing", "supply", "return"]}
            colors={["blue", "green", "yellow"]}
            yAxisWidth={48}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(ReportsPage, { requiredRole: "admin" })

