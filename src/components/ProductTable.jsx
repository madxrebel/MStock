import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ProductTable({ products, deleteProduct }) {
  return (
    <div>

        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unpacked Stock</TableHead>
                <TableHead>Packed Stock</TableHead>
                <TableHead>Packed Size</TableHead>
                <TableHead>Price</TableHead>
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
                <TableCell>{product.packedSize}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                    <Button
                    variant="destructive"
                    onClick={() => deleteProduct(product.id)}
                    >
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
