"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // Ensure `auth` is imported to get the current user
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
  price: number;
};

type SelectedItem = {
  id: string;
  name: string;
  price: number; // Price of the product
  unitAmount: number; // Number of items taken
  total: number; // Total = unitAmount * product price
  sold: number; // Default = 0
  returned: number; // Default = 0
};

export default function NewTransactionPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [unitAmount, setUnitAmount] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<string | null>(null); // Tracks the logged-in user
  const [totalTransactionPrice, setTotalTransactionPrice] = useState<number>(0); // Total price of the transaction

  // Fetch authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid); // Store the user's unique ID
      } else {
        setCurrentUser(null); // Clear user data if logged out
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
      price: unitAmount * selectedProduct.price, // Include price for display
      unitAmount,
      total: unitAmount,
      sold: 0, // Default value
      returned: 0, // Default value
    };
    setSelectedItems([...selectedItems, newItem]);
    setTotalTransactionPrice(
      (prevTotal) => prevTotal + newItem.price
    ); // Update total transaction price
    setSelectedProduct(null); // Reset product selection
    setUnitAmount(1); // Reset unit amount
  };

  const handleTransaction = async () => {
    if (!selectedSupplier || selectedItems.length === 0 || !currentUser) {
      alert("Please select a supplier, add items to the transaction, and ensure you're logged in.");
      return;
    }
    await addDoc(collection(db, "transactions"), {
      supplierId: selectedSupplier,
      items: selectedItems,
      totalTransactionPrice, // Save the total transaction price
      userRef: currentUser, // Reference the logged-in user
      timestamp: new Date(),
    });
    setSelectedSupplier(null);
    setSelectedItems([]);
    setTotalTransactionPrice(0); // Reset total transaction price
    alert("Transaction successful.");
  };

  const cancelTransaction = () => {
    setSelectedSupplier(null);
    setSelectedItems([]);
    setTotalTransactionPrice(0); // Reset total transaction price
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">New Transaction</h1>
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
              <TableHead>Total</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.total}</TableCell>
                <TableCell>{item.sold}</TableCell>
                <TableCell>{item.returned}</TableCell>
                <TableCell>{item.price}</TableCell>
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
        <Button onClick={handleTransaction}>Make Transaction</Button>
        <Button variant="outline" onClick={cancelTransaction}>
          Cancel Transaction
        </Button>
      </div>
    </div>
  );
}
