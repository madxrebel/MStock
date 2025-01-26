import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import { getTopProducts } from '@/lib/firebase'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function TopProductsChart({ supplierId }) {
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    const fetchTopProducts = async () => {
      const data = await getTopProducts(supplierId)
      setTopProducts(data)
    }
    fetchTopProducts()
  }, [supplierId])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={topProducts}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {topProducts.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

