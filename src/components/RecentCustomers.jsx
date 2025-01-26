import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentCustomers } from '@/lib/firebase'

export function RecentCustomers({ supplierId }) {
  const [recentCustomers, setRecentCustomers] = useState([])

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      const customers = await getRecentCustomers(supplierId)
      setRecentCustomers(customers)
    }
    fetchRecentCustomers()
  }, [supplierId])

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
        <CardDescription>
          You have {recentCustomers.length} new customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

