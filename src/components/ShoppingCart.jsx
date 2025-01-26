import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createOrder } from '@/lib/firebase'

export function ShoppingCart({ cart, setCart }) {
  const [isOpen, setIsOpen] = useState(false)

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    setCart(prevCart => prevCart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ))
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)

  const handleCheckout = async () => {
    try {
      await createOrder(cart, totalPrice)
      setCart([])
      setIsOpen(false)
      alert('Order placed successfully!')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4">
        Cart ({cart.length})
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Shopping Cart</DialogTitle>
          </DialogHeader>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>{item.name}</span>
              <div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="w-16 mr-2 p-1 border rounded"
                />
                <Button variant="destructive" onClick={() => removeFromCart(item.id)}>Remove</Button>
              </div>
            </div>
          ))}
          <div className="font-bold mt-4">Total: ${totalPrice.toFixed(2)}</div>
          <DialogFooter>
            <Button onClick={handleCheckout}>Checkout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

