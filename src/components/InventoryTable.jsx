import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getInventory } from '@/lib/firebase'

export function InventoryTable({ supplierId }) {
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    const fetchInventory = async () => {
      const inventoryData = await getInventory(supplierId)
      // console.log(supplierId)
      console.log("inventoryDataa: ", inventoryData)
      setInventory(inventoryData)
    }
    fetchInventory()
  }, [supplierId])

  console.log("inventory: ", inventory)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>A list of all products in inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.productPrice.toFixed(2)}</TableCell>
                <TableCell>{product.stockMultiplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

