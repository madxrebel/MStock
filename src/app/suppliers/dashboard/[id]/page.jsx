'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { DashboardHeader } from '../../../../components/DashboardHeader'
import { DashboardStats } from '../../../../components/DashboardStats'
import { RevenueChart } from '../../../../components/RevenueChart'
import { TopProductsChart } from '../../../../components/TopProductsChart'
import { RecentOrders } from '../../../../components/RecentOrders'
import { RecentCustomers } from '../../../../components/RecentCustomers'
import { OrdersTable } from '../../../../components/OrdersTable'
import { CustomersTable } from '../../../../components/CustomersTable'
import { InventoryTable } from '../../../../components/InventoryTable'
import { AddCustomerForm } from '../../../../components/AddCustomerForm'
import { getSupplierData, getSupplierStats } from '../../../../lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Dialog, DialogContent } from "../../../../components/ui/dialog"
import { Activity, DollarSign, Users, Package, ShoppingCart, TrendingUp } from 'lucide-react'

export default function SupplierDashboard() {
  const { id } = useParams()
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [supplierData, setSupplierData] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSupplierData(id)
      if (!data) {
        notFound()
      }
      setSupplierData(data)
      const statsData = await getSupplierStats(id)
      setStats(statsData)  
    }
    fetchData()
  }, [id])

  if (!supplierData || !stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <DashboardHeader supplierName={supplierData.name} onAddCustomer={() => setIsAddCustomerOpen(true)} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats stats={stats} />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart supplierId={id} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Your best performing products this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsChart supplierId={id} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <RecentOrders supplierId={id} />
            <RecentCustomers supplierId={id} />
          </div>
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTable supplierId={id} />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTable supplierId={id} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryTable supplierId={id} />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent>
          <AddCustomerForm supplierId={id} onSuccess={() => setIsAddCustomerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}


