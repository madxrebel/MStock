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

type Shopkeeper = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  packedStock: number;
};

type SelectedItem = {
  id: string;
  name: string;
  price: number;
  unitAmount: number;
  sold: number;
  returned: number;
};

export default function ShopkeeperTransactionPage() {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [unitAmount, setUnitAmount] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { id } = useParams();

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
        router.push("/login");
        return;
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchShopkeepers = query(
      collection(db, "shopkeepers"),
      where("createdBy", "==", id)
    );
    const unsubscribeShopkeepers = onSnapshot(fetchShopkeepers, (snapshot) => {
      const shopkeepersArray: Shopkeeper[] = [];
      snapshot.forEach((doc) => {
        shopkeepersArray.push({ id: doc.id, ...doc.data() } as Shopkeeper);
      });
      setShopkeepers(shopkeepersArray);
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
          name: productData.name,
          price: productData.price,
          packedStock: productData.packedStock,
        } as Product);
      });
      setProducts(productsArray);
    });

    return () => {
      unsubscribeShopkeepers();
      unsubscribeProducts();
    };
  }, [id]);

  const addItemToTransaction = () => {
    if (!selectedProduct || unitAmount <= 0) {
      alert("Please select a product and specify a valid unit amount.");
      return;
    }

    if (unitAmount > selectedProduct.packedStock) {
      alert(`Error: Stock is insufficient. Available stock: ${selectedProduct.packedStock}`);
      return;
    }

    const existingItemIndex = selectedItems.findIndex(
      (item) => item.id === selectedProduct.id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      const totalUnits = updatedItems[existingItemIndex].unitAmount + unitAmount;

      if (totalUnits > selectedProduct.packedStock) {
        alert(`Error: Total requested units exceed available stock. Available stock: ${selectedProduct.packedStock}`);
        return;
      }

      updatedItems[existingItemIndex].unitAmount = totalUnits;
      setSelectedItems(updatedItems);
    } else {
      const newItem: SelectedItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
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
    if (!selectedShopkeeper || selectedItems.length === 0 || !currentUser) {
      alert("Please select a shopkeeper, add items, and ensure you're logged in.");
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);

      const transactionRef = collection(db, "transactions");
      const newTransactionRef = doc(transactionRef);

      batch.set(newTransactionRef, {
        shopkeeperId: selectedShopkeeper,
        items: selectedItems,
        totalTransactionPrice,
        createdBy: currentUser,
        timestamp: new Date(),
      });

      selectedItems.forEach((item) => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, {
          packedStock: increment(-item.unitAmount),
        });
      });

      await batch.commit();

      setSelectedShopkeeper(null);
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
    setSelectedShopkeeper(null);
    setSelectedItems([]);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">New Transaction (Shopkeeper)</h1>
      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="mb-5">
        <Label htmlFor="shopkeeper">Select Shopkeeper</Label>
        <Input
          id="shopkeeper"
          list="shopkeepers"
          onChange={(e) => setSelectedShopkeeper(e.target.value)}
          value={selectedShopkeeper || ""}
          placeholder="Search shopkeeper by ID"
        />
        <datalist id="shopkeepers">
          {shopkeepers.map((shopkeeper) => (
            <option key={shopkeeper.id} value={shopkeeper.id}>
              {shopkeeper.name}
            </option>
          ))}
        </datalist>
      </div>

      {selectedShopkeeper && (
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
                  {product.name} (Stock: {product.packedStock})
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
                <TableCell>{item.price}</TableCell>
                <TableCell>{item.price * item.unitAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-5 flex justify-between items-center">
        <h2 className="text-xl">Total Price: ${totalTransactionPrice}</h2>
        <div className="flex gap-4">
          <Button onClick={handleTransaction}>Complete Transaction</Button>
          <Button variant="outline" onClick={cancelTransaction}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
