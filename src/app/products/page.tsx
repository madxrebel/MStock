"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: string
  name: string
  category: string
  unit: string
  unpackedStock: number
  packedStock: number
  packedSize: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    unit: "",
    unpackedStock: 0,
    packedStock: 0,
    packedSize: 0,
  })

  useEffect(() => {
    const q = query(collection(db, "products"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray: Product[] = []
      querySnapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, ...doc.data() } as Product)
      })
      setProducts(productsArray)
    })
    return () => unsubscribe()
  }, [])

  const addProduct = async () => {
    await addDoc(collection(db, "products"), newProduct)
    setNewProduct({ name: "", category: "", unit: "", unpackedStock: 0, packedStock: 0, packedSize: 0 })
  }

  const updateProduct = async (id: string, data: Partial<Product>) => {
    await updateDoc(doc(db, "products", id), data)
  }

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id))
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Product Management</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-5">Add New Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detergents">Detergents</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="sweets">Sweets</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit
              </Label>
              <Input
                id="unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unpackedStock" className="text-right">
                Unpacked Stock
              </Label>
              <Input
                id="unpackedStock"
                type="number"
                value={newProduct.unpackedStock}
                onChange={(e) => setNewProduct({ ...newProduct, unpackedStock: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packedStock" className="text-right">
                Packed Stock
              </Label>
              <Input
                id="packedStock"
                type="number"
                value={newProduct.packedStock}
                onChange={(e) => setNewProduct({ ...newProduct, packedStock: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packedSize" className="text-right">
                Packed Size (g)
              </Label>
              <Input
                id="packedSize"
                type="number"
                value={newProduct.packedSize}
                onChange={(e) => setNewProduct({ ...newProduct, packedSize: Number(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={addProduct}>Add Product</Button>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Unpacked Stock</TableHead>
            <TableHead>Packed Stock</TableHead>
            <TableHead>Packed Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.unit}</TableCell>
              <TableCell>{product.unpackedStock}</TableCell>
              <TableCell>{product.packedStock}</TableCell>
              <TableCell>{product.packedSize}g</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => deleteProduct(product.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

