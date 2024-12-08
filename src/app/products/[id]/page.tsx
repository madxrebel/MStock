"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Ensure auth is imported
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unpackedStock: number;
  packedStock: number;
  packedSize: number;
  price: number;
  createdBy: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id" | "createdBy">>({
    name: "",
    category: "",
    unit: "",
    unpackedStock: 0,
    packedStock: 0,
    packedSize: 0,
    price: 0,
  });

  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!id) return; // If UID is not available, skip fetching

    // Fetch products where createdBy equals the current uid
    const q = query(collection(db, "products"), where("createdBy", "==", id));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsArray: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsArray);
    });

    return () => unsubscribe();
  }, [id]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.unit || !newProduct.price) {
      alert("Please fill out all required fields.");
      return;
    }

    // Get the current user's UID
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("User not authenticated.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        createdBy: currentUser.uid, // Add createdBy field
      });
      setNewProduct({
        name: "",
        category: "",
        unit: "",
        unpackedStock: 0,
        packedStock: 0,
        packedSize: 0,
        price: 0,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5 flex justify-between items-center">
        Product Management
        <Button className="mb-5" onClick={() => router.push('/admin/dashboard')}>Back to Dashboard</Button>
      </h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-5">Add New Product</Button>
        </DialogTrigger>
        <DialogContent aria-describedby="product-dialog-description">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <p id="product-dialog-description" className="hidden">
            Please fill out the fields to add a new product.
          </p>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                onValueChange={(value) =>
                  setNewProduct({ ...newProduct, category: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf">Surf</SelectItem>
                  <SelectItem value="masala-sachet">Masala Sachet</SelectItem>
                  <SelectItem value="masala-packet">Masala Packet</SelectItem>
                  <SelectItem value="sweets">Sweets</SelectItem>
                  <SelectItem value="razors">Razors</SelectItem>
                  <SelectItem value="shampoo">Shampoo</SelectItem>
                  <SelectItem value="beauty-products">Beauty Products</SelectItem>
                  <SelectItem value="soap">Soap</SelectItem>
                  <SelectItem value="kitchen-products">Kitchen Products</SelectItem>
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
                onChange={(e) =>
                  setNewProduct({ ...newProduct, unit: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unpackedStock" className="text-right">
                Unpacked Stock
              </Label>
              <Input
                type="number"
                id="unpackedStock"
                value={newProduct.unpackedStock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    unpackedStock: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packedStock" className="text-right">
                Packed Stock
              </Label>
              <Input
                type="number"
                id="packedStock"
                value={newProduct.packedStock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    packedStock: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="packedSize" className="text-right">
                Packed Size
              </Label>
              <Input
                type="number"
                id="packedSize"
                value={newProduct.packedSize}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    packedSize: parseInt(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                type="number"
                id="price"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
                className="col-span-3"
              />
            </div>
            <Button onClick={addProduct} className="mt-4">
              Add Product
            </Button>
          </div>
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
  );
}
