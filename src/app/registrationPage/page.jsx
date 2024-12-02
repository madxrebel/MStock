"use client"

// AdminRegistration.tsx
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminRegistration() {
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setAdmin({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
      console.log("Admin registered:", user);
      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Failed to register admin. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          Admin Registration
        </h1>
        {!admin ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register with Google
            </button>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700">Welcome, Admin!</h2>
            <p className="text-gray-600">{admin.displayName}</p>
            <p className="text-gray-500 text-sm">{admin.email}</p>
            <img
              src={admin.photoURL}
              alt="Admin Avatar"
              className="mt-4 w-16 h-16 rounded-full mx-auto shadow-md"
            />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
