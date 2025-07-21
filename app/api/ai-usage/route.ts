import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isPremium: true,
      aiMessagesUsed: true,
      aiMessagesResetDate: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Reset monthly usage if it's a new month
  const now = new Date()
  const resetDate = new Date(user.aiMessagesResetDate)
  const isNewMonth = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()

  if (isNewMonth) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        aiMessagesUsed: 0,
        aiMessagesResetDate: now,
      },
    })
    user.aiMessagesUsed = 0
  }

  const limit = user.isPremium ? -1 : 20 // -1 means unlimited
  const remaining = user.isPremium ? -1 : Math.max(0, limit - user.aiMessagesUsed)

  return NextResponse.json({
    isPremium: user.isPremium,
    used: user.aiMessagesUsed,
    limit,
    remaining,
    canSendMessage: user.isPremium || user.aiMessagesUsed < 20,
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Increment AI message usage
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      aiMessagesUsed: {
        increment: 1,
      },
    },
  })

  return NextResponse.json({ success: true })
}
