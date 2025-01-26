import { Button } from "@/components/ui/button"

export function DashboardHeader({ supplierName, onAddCustomer }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{supplierName} Dashboard</h1>
      <Button onClick={onAddCustomer}>Add Customer</Button>
    </div>
  )
}
