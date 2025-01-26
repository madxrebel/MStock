import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'

export function DashboardStats({ stats }) {
  console.log("stats ",stats)
  const { totalRevenue, totalOrders, totalCustomers, activeProducts } = stats

  const statCards = [
    { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { title: "Orders", value: totalOrders.toLocaleString(), icon: ShoppingCart },
    { title: "Customers", value: totalCustomers.toLocaleString(), icon: Users },
    { title: "Active Products", value: activeProducts.toLocaleString(), icon: Package },
  ]

  return (
    <>
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

