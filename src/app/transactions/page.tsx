"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Transaction = {
  id: string
  productId: string
  type: "packing" | "supply" | "return"
  quantity: number
  date: Timestamp
  recipient?: string
}

type Product = {
  id: string
  name: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, "id" | "date">>({
    productId: "",
    type: "packing",
    quantity: 0,
    recipient: "",
  })

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

  const addTransaction = async () => {
    await addDoc(collection(db, "transactions"), {
      ...newTransaction,
      date: Timestamp.now(),
    })
    setNewTransaction({ productId: "", type: "packing", quantity: 0, recipient: "" })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Transaction Log</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-5">Add New Transaction</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right">
                Product
              </Label>
              <Select onValueChange={(value) => setNewTransaction({ ...newTransaction, productId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select onValueChange={(value: "packing" | "supply" | "return") => setNewTransaction({ ...newTransaction, type: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="packing">Packing</SelectItem>
                  <SelectItem value="supply">Supply</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newTransaction.quantity}
                onChange={(e) => setNewTransaction({ ...newTransaction, quantity: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            {newTransaction.type === "supply" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient" className="text-right">
                  Recipient
                </Label>
                <Input
                  id="recipient"
                  value={newTransaction.recipient}
                  onChange={(e) => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <Button onClick={addTransaction}>Add Transaction</Button>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Recipient</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date.toDate().toLocaleString()}</TableCell>
              <TableCell>{products.find((p) => p.id === transaction.productId)?.name}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{transaction.recipient || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

