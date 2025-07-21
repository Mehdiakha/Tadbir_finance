import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's financial data
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    })

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: session.user.id },
    })

    // Calculate analytics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const thisMonthExpenses = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        const now = new Date()
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    const categoryBreakdown = expenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const monthlySpending = expenses.reduce(
      (acc, expense) => {
        const month = new Date(expense.date).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Create context for AI report
    const expenseContext = expenses
      .slice(0, 50)
      .map((e) => `${e.date.toISOString().split("T")[0]}: $${e.amount} - ${e.category}`)
      .join("\n")

    const goalsContext = savingsGoals.map((g) => `${g.title}: $${g.currentAmount}/$${g.targetAmount}`).join("\n")

    const categoryContext = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`)
      .join("\n")

    const monthlyContext = Object.entries(monthlySpending)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
      .map(([month, amount]) => `${month}: $${amount.toFixed(2)}`)
      .join("\n")

    // Generate AI report
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a comprehensive personal finance report based on this data:

SUMMARY STATISTICS:
- Total Expenses: $${totalExpenses.toFixed(2)}
- This Month: $${thisMonthExpenses.toFixed(2)}
- Number of Transactions: ${expenses.length}
- Active Savings Goals: ${savingsGoals.length}

SPENDING BY CATEGORY:
${categoryContext}

MONTHLY SPENDING TREND (Last 6 months):
${monthlyContext}

RECENT EXPENSES:
${expenseContext}

SAVINGS GOALS:
${goalsContext}

Please provide:
1. Executive Summary
2. Spending Analysis & Patterns
3. Category Breakdown Insights
4. Monthly Trends Analysis
5. Savings Goals Progress
6. Actionable Recommendations
7. Areas for Improvement

Make it professional, insightful, and actionable. Use bullet points and clear sections.`,
    })

    return NextResponse.json({
      report: text,
      analytics: {
        totalExpenses,
        thisMonthExpenses,
        transactionCount: expenses.length,
        categoryBreakdown,
        monthlySpending,
        savingsGoals: savingsGoals.length,
      },
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
