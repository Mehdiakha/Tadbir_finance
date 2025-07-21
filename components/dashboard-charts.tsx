"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from "lucide-react"

interface Expense {
  id: string
  amount: number
  category: string
  date: string
}

interface DashboardChartsProps {
  expenses: Expense[]
}

const COLORS = ["#87ceeb", "#ff8c94", "#ffaaa5", "#ffd3a5", "#fd9853", "#a8e6cf", "#dcedc1", "#ffd93d"]

export function DashboardCharts({ expenses }: DashboardChartsProps) {
  // Category breakdown
  const categoryData = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Monthly spending trend
  const monthlyData = expenses.reduce(
    (acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare data for charts
  const categoryChartData = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: ((amount / Object.values(categoryData).reduce((sum, val) => sum + val, 0)) * 100).toFixed(1),
    }))

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      amount: Number(amount.toFixed(2)),
      fullMonth: month,
    }))

  // Daily spending for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()

  const dailySpending = last30Days.map((date) => {
    const dayExpenses = expenses.filter((expense) => expense.date.startsWith(date))
    const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: Number(total.toFixed(2)),
    }
  })

  // Recent months comparison
  const sortedMonths = Object.entries(monthlyData).sort(([a], [b]) => b.localeCompare(a))
  const thisMonth = sortedMonths[0]
  const lastMonth = sortedMonths[1]
  const monthlyChange = thisMonth && lastMonth ? ((thisMonth[1] - lastMonth[1]) / lastMonth[1]) * 100 : 0

  const totalSpending = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0)
  const topCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Simple pie chart component using CSS
  const SimplePieChart = ({ data }: { data: typeof categoryChartData }) => {
    let cumulativePercentage = 0

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-64 h-64">
          <svg width="256" height="256" className="transform -rotate-90">
            <circle cx="128" cy="128" r="100" fill="none" stroke="#f3f4f6" strokeWidth="20" />
            {data.map((item, index) => {
              const percentage = Number.parseFloat(item.percentage)
              const strokeDasharray = `${(percentage / 100) * 628} 628`
              const strokeDashoffset = -((cumulativePercentage / 100) * 628)
              cumulativePercentage += percentage

              return (
                <circle
                  key={item.category}
                  cx="128"
                  cy="128"
                  r="100"
                  fill="none"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm font-medium">{item.category}</span>
              <span className="text-sm text-muted-foreground">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Simple bar chart component using CSS
  const SimpleBarChart = ({ data }: { data: typeof monthlyChartData }) => {
    const maxAmount = Math.max(...data.map((d) => d.amount))

    return (
      <div className="space-y-4">
        <div className="flex items-end space-x-2 h-64">
          {data.map((item, index) => {
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 240 : 0
            return (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="text-xs text-muted-foreground mb-2">${item.amount}</div>
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${height}px`,
                    backgroundColor: "#87ceeb",
                    minHeight: item.amount > 0 ? "4px" : "0px",
                  }}
                />
                <div className="text-xs text-muted-foreground mt-2 transform rotate-45 origin-left">{item.month}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Simple area chart component using CSS
  const SimpleAreaChart = ({ data }: { data: typeof dailySpending }) => {
    const maxAmount = Math.max(...data.map((d) => d.amount))

    return (
      <div className="space-y-4">
        <div className="flex items-end space-x-1 h-64 border-b border-l border-gray-200">
          {data.map((item, index) => {
            const height = maxAmount > 0 ? (item.amount / maxAmount) * 240 : 0
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${height}px`,
                    backgroundColor: "#87ceeb",
                    opacity: 0.6,
                    minHeight: item.amount > 0 ? "2px" : "0px",
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="text-xs text-muted-foreground text-center">Daily spending over the last 30 days</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across {Object.keys(categoryData).length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonth ? thisMonth[1].toFixed(2) : "0.00"}</div>
            {monthlyChange !== 0 && (
              <p className={`text-xs flex items-center ${monthlyChange > 0 ? "text-red-600" : "text-green-600"}`}>
                {monthlyChange > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(monthlyChange).toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expenses.length > 0 ? (totalSpending / expenses.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">{expenses.length} transactions total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCategories[0] ? topCategories[0][0] : "None"}</div>
            <p className="text-xs text-muted-foreground">
              ${topCategories[0] ? topCategories[0][1].toFixed(2) : "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <SimplePieChart data={categoryChartData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No expenses to display</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <SimpleBarChart data={monthlyChartData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No monthly data to display</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleAreaChart data={dailySpending} />
        </CardContent>
      </Card>

      {/* Category Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map(([category, amount], index) => {
              const percentage = (amount / totalSpending) * 100
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
            {Object.keys(categoryData).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No expenses to display</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Most Active Category</h4>
              <p className="text-sm text-blue-700">
                {topCategories[0] ? (
                  <>
                    You spend most on <strong>{topCategories[0][0]}</strong> (${topCategories[0][1].toFixed(2)})
                  </>
                ) : (
                  "No spending data available"
                )}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Monthly Trend</h4>
              <p className="text-sm text-green-700">
                {monthlyChange > 0 ? (
                  <>
                    Spending increased by <strong>{monthlyChange.toFixed(1)}%</strong> this month
                  </>
                ) : monthlyChange < 0 ? (
                  <>
                    Spending decreased by <strong>{Math.abs(monthlyChange).toFixed(1)}%</strong> this month
                  </>
                ) : (
                  "No change from last month"
                )}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Transaction Pattern</h4>
              <p className="text-sm text-purple-700">
                Average of <strong>${(totalSpending / Math.max(expenses.length, 1)).toFixed(2)}</strong> per transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
