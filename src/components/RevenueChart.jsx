import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getRevenueData } from '@/lib/firebase'

export function RevenueChart({ supplierId }) {
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    const fetchRevenueData = async () => {
      const data = await getRevenueData(supplierId)
      setRevenueData(data)
    }
    fetchRevenueData()
  }, [supplierId])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

