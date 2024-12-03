"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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

type Supplier = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number; // Per unit price
};

type SelectedItem = {
  id: string;
  name: string;
  price: number; // Per unit price
  unitAmount: number;
  sold: number;
  returned: number;
};

export default function NewTransactionPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [unitAmount, setUnitAmount] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate total transaction price dynamically
  const totalTransactionPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.unitAmount,
    0
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSuppliers = query(collection(db, "suppliers"));
    const unsubscribeSuppliers = onSnapshot(fetchSuppliers, (snapshot) => {
      const suppliersArray: Supplier[] = [];
      snapshot.forEach((doc) => {
        suppliersArray.push({ id: doc.id, ...doc.data() } as Supplier);
      });
      setSuppliers(suppliersArray);
    });

    const fetchProducts = query(collection(db, "products"));
    const unsubscribeProducts = onSnapshot(fetchProducts, (snapshot) => {
      const productsArray: Product[] = [];
      snapshot.forEach((doc) => {
        productsArray.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsArray);
    });

    return () => {
      unsubscribeSuppliers();
      unsubscribeProducts();
    };
  }, []);

  const addItemToTransaction = () => {
    if (!selectedProduct || unitAmount <= 0) return;
    const newItem: SelectedItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price, // Store per-unit price
      unitAmount,
      sold: 0,
      returned: 0,
    };
    setSelectedItems([...selectedItems, newItem]);
    setSelectedProduct(null);
    setUnitAmount(1);
  };

  const handleTransaction = async () => {
    if (!selectedSupplier || selectedItems.length === 0 || !currentUser) {
      alert("Please select a supplier, add items, and ensure you're logged in.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        supplierId: selectedSupplier,
        items: selectedItems,
        totalTransactionPrice,
        userRef: currentUser,
        timestamp: new Date(),
      });
      setSelectedSupplier(null);
      setSelectedItems([]);
      alert("Transaction successful.");
    } catch (error) {
      console.error("Error during transaction:", error);
      alert("Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const cancelTransaction = () => {
    setSelectedSupplier(null);
    setSelectedItems([]);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">New Transaction</h1>
      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="mb-5">
        <Label htmlFor="supplier">Select Supplier</Label>
        <Input
          id="supplier"
          list="suppliers"
          onChange={(e) => setSelectedSupplier(e.target.value)}
          value={selectedSupplier || ""}
          placeholder="Search supplier by ID"
        />
        <datalist id="suppliers">
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </datalist>
      </div>

      {selectedSupplier && (
        <>
          <div className="mb-5">
            <Label htmlFor="product">Select Product</Label>
            <Input
              id="product"
              list="products"
              onChange={(e) =>
                setSelectedProduct(
                  products.find((product) => product.id === e.target.value) || null
                )
              }
              placeholder="Search product by ID"
            />
            <datalist id="products">
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </datalist>
          </div>

          {selectedProduct && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Unit Amount</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Unit Amount</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="unitAmount">Number of Items</Label>
                  <Input
                    id="unitAmount"
                    type="number"
                    value={unitAmount}
                    onChange={(e) => setUnitAmount(Number(e.target.value))}
                  />
                </div>
                <Button onClick={addItemToTransaction}>Add to List</Button>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {selectedItems.length > 0 && (
        <Table className="mt-5">
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Total Units</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unitAmount}</TableCell>
                <TableCell>{item.sold}</TableCell>
                <TableCell>{item.returned}</TableCell>
                <TableCell>{item.price.toLocaleString("en-PK")} PKR</TableCell>
                <TableCell>
                  {(item.price * item.unitAmount).toLocaleString("en-PK")} PKR
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalTransactionPrice > 0 && (
        <div className="mt-5">
          <p className="text-lg font-semibold">
            Total Transaction Price: {totalTransactionPrice.toLocaleString("en-PK")} PKR
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-5">
        <Button onClick={handleTransaction} disabled={loading}>
          {loading ? "Processing..." : "Make Transaction"}
        </Button>
        <Button variant="outline" onClick={cancelTransaction} disabled={loading}>
          Cancel Transaction
        </Button>
      </div>
    </div>
  );
}
