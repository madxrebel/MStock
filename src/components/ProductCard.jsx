import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductCard({ product, addToCart }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.productName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <p className="font-bold mt-2">${product.productPrice.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => addToCart(product)}>Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}

