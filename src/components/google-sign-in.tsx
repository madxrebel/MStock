import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

export function GoogleSignIn() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  return (
    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
      <FcGoogle className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  )
}

