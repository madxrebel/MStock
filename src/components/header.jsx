"use client";

import { useAuth } from "./auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Header() {
  const { user, loading } = useAuth(); // Assuming AuthProvider provides `user` and `loading`
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          {user ? (
            <div className="flex items-center space-x-4">
              {user.photoURL && (
                <Image
                  src={user.photoURL}
                  alt="User Photo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <Button onClick={handleLogout} variant="outline">
                Log out
              </Button>
            </div>
          ) : (
            <div className="space-x-4">
              <Button onClick={() => router.push("/login")} variant="outline">
                Sign In
              </Button>
              <Button onClick={() => router.push("/signup")} variant="primary">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
