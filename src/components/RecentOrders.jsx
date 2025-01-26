import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentOrders } from '@/lib/firebase'

export function RecentOrders({ supplierId }) {
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      const orders = await getRecentOrders(supplierId)
      setRecentOrders(orders)
    }
    fetchRecentOrders()
  }, [supplierId])

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
          You made {recentOrders.length} sales recently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-auto font-medium">${order.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

