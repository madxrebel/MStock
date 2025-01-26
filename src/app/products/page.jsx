'use client'

import { useState, useEffect } from 'react'
import { getProducts } from '@/lib/firebase'
import { ProductCard } from '@/components/ProductCard'
import { ShoppingCart } from '@/components/ShoppingCart'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
    }
    fetchProducts()
  }, [])

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
      <ShoppingCart cart={cart} setCart={setCart} />
    </div>
  )
}

