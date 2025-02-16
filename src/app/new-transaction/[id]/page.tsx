"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  increment,
  writeBatch
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
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
  productName: string;
  productPrice: number; // Per unit price
  stockMultiplier: number; // Current stock
};

type SelectedItem = {
  id: string;
  productName: string;
  productPrice: number; // Per unit price
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

  const router = useRouter();
  const { id } = useParams(); // Get the dynamic route parameter

  // Calculate total transaction price dynamically
  const totalTransactionPrice = selectedItems.reduce(
    (total, item) => total + item.productPrice * item.unitAmount,
    0
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
        router.push("/login");
        return;
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchSuppliers = query(
      collection(db, "suppliers"),
      where("createdBy", "==", id)
    );
    const unsubscribeSuppliers = onSnapshot(fetchSuppliers, (snapshot) => {
      const suppliersArray: Supplier[] = [];
      snapshot.forEach((doc) => {
        suppliersArray.push({ id: doc.id, ...doc.data() } as Supplier);
      });
      setSuppliers(suppliersArray);
    });

    const fetchProducts = query(
      collection(db, "products"),
      where("createdBy", "==", id)
    );
    const unsubscribeProducts = onSnapshot(fetchProducts, (snapshot) => {
      const productsArray: Product[] = [];
      snapshot.forEach((doc) => {
        const productData = doc.data();
        productsArray.push({
          id: doc.id,
          productName: productData.productName,
          productPrice: productData.productPrice,
          stockMultiplier: productData.stockMultiplier, // Include current stock
        } as Product);
      });
      setProducts(productsArray);
    });

    return () => {
      unsubscribeSuppliers();
      unsubscribeProducts();
    };
  }, [id]);

  const addItemToTransaction = () => {
    if (!selectedProduct || unitAmount <= 0) {
      alert("Please select a product and specify a valid unit amount.");
      return;
    }
  
    // Check if the unit amount exceeds the available stock
    if (unitAmount > selectedProduct.stockMultiplier) {
      alert(`Error: Stock is insufficient. Available stock: ${selectedProduct.stockMultiplier}`);
      return;
    }
  
    // Check if the product is already in the selectedItems list
    const existingItemIndex = selectedItems.findIndex(
      (item) => item.id === selectedProduct.id
    );
  
    if (existingItemIndex !== -1) {
      // Update the unit amount of the existing item
      const updatedItems = [...selectedItems];
      const totalUnits = updatedItems[existingItemIndex].unitAmount + unitAmount;
  
      if (totalUnits > selectedProduct.stockMultiplier) {
        alert(
          `Error: Total requested units exceed available stock. Available stock: ${selectedProduct.stockMultiplier}`
        );
        return;
      }
  
      updatedItems[existingItemIndex].unitAmount = totalUnits;
      setSelectedItems(updatedItems);
    } else {
      // Add the new item to the list
      const newItem: SelectedItem = {
        id: selectedProduct.id,
        productName: selectedProduct.productName,
        productPrice: selectedProduct.productPrice,
        unitAmount,
        sold: 0,
        returned: 0,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  
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
      // Initialize Firestore batch
      const batch = writeBatch(db);
  
      // Add the transaction to the "transactions" collection
      const transactionRef = collection(db, "transactions");
      const newTransactionRef = doc(transactionRef);
  
      batch.set(newTransactionRef, {
        supplierId: selectedSupplier,
        items: selectedItems,
        totalTransactionPrice,
        createdBy: currentUser,
        timestamp: new Date(),
      });
  
      // Update the packedStock for each product in the transaction
      selectedItems.forEach((item) => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, {
          stockMultiplier: increment(-item.unitAmount),
        });
      });
  
      // Commit the batch
      await batch.commit();
  
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
                  {product.productName} (Stock: {product.stockMultiplier})
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
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.unitAmount}</TableCell>
                <TableCell>{item.sold}</TableCell>
                <TableCell>{item.returned}</TableCell>
                <TableCell>{item.productPrice.toLocaleString("en-PK")} PKR</TableCell>
                <TableCell>
                  {(item.productPrice * item.unitAmount).toLocaleString("en-PK")} PKR
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
