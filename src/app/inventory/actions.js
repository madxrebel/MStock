import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export async function addInventoryItem(data) {
  await addDoc(collection(db, "inventory"), data);
}

export async function updateInventoryItem(id, data) {
  await updateDoc(doc(db, "inventory", id), data);
}

export async function deleteInventoryItem(id) {
  await deleteDoc(doc(db, "inventory", id));
}