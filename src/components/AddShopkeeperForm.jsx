"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AddShopkeeperForm() {
  const [shopkeeperId, setShopkeeperId] = useState("");
  const [shopkeeperName, setShopkeeperName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shopkeeperId || !shopkeeperName || !contactNo || !address) {
      alert("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "shopkeepers"), {
        shopkeeperId,
        shopkeeperName,
        contactNo,
        address,
      });
      setShopkeeperId("");
      setShopkeeperName("");
      setContactNo("");
      setAddress("");
      setIsOpen(false);
      alert("Shopkeeper added successfully!");
    } catch (error) {
      console.error("Error adding shopkeeper: ", error);
      alert("Failed to add shopkeeper.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add Shopkeeper</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Shopkeeper</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="shopkeeperId">Shopkeeper ID</Label>
              <Input
                id="shopkeeperId"
                value={shopkeeperId}
                onChange={(e) => setShopkeeperId(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="shopkeeperName">Shopkeeper Name</Label>
              <Input
                id="shopkeeperName"
                value={shopkeeperName}
                onChange={(e) => setShopkeeperName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="contactNo">Contact No</Label>
              <Input
                id="contactNo"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Shopkeeper"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
