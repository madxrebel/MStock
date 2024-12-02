// app/inventory/page.jsx
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setItems(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchItems();
  }, []);

  const addItem = async () => {
    await addDoc(collection(db, "inventory"), { name: newItem });
    setNewItem("");
  };

  return (
    <div>
      <h1>Inventory</h1>
      <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add new item" />
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
