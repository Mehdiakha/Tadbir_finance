import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    // Check AI usage limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isPremium: true,
        aiMessagesUsed: true,
        aiMessagesResetDate: true,
      },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    // Reset monthly usage if it's a new month
    const now = new Date()
    const resetDate = new Date(user.aiMessagesResetDate)
    const isNewMonth = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()

    let currentUsage = user.aiMessagesUsed
    if (isNewMonth) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          aiMessagesUsed: 0,
          aiMessagesResetDate: now,
        },
      })
      currentUsage = 0
    }

    // Check if user has exceeded limit
    if (!user.isPremium && currentUsage >= 20) {
      return new Response("AI message limit exceeded. Upgrade to premium for unlimited access.", { status: 429 })
    }

    // Increment usage
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        aiMessagesUsed: {
          increment: 1,
        },
      },
    })

    const { messages } = await request.json()

    // Get user's expenses for context
    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50,
    })

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: session.user.id },
    })

    // Create context for the AI
    const expenseContext = expenses
      .map(
        (e) => `${e.date.toISOString().split("T")[0]}: $${e.amount} - ${e.category} ${e.notes ? `(${e.notes})` : ""}`,
      )
      .join("\n")

    const goalsContext = savingsGoals
      .map(
        (g) =>
          `${g.title}: $${g.currentAmount}/$${g.targetAmount} ${g.targetDate ? `by ${g.targetDate.toISOString().split("T")[0]}` : ""}`,
      )
      .join("\n")

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are a helpful personal finance assistant. You have access to the user's financial data:

RECENT EXPENSES:
${expenseContext}

SAVINGS GOALS:
${goalsContext}

Help the user with:
- Categorizing expenses (suggest categories like Food, Transportation, Entertainment, Shopping, Bills, Healthcare, etc.)
- Analyzing spending patterns
- Providing financial advice
- Answering questions about their expenses and savings

Be concise, helpful, and provide actionable insights. When suggesting expense categories, use common categories that make sense for personal finance tracking.`,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
