"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, MessageCircle, FileText, TrendingUp, Zap, Check, Sparkles } from "lucide-react"

interface PremiumSectionProps {
  aiUsage?: {
    isPremium: boolean
    used: number
    limit: number
    remaining: number
    canSendMessage: boolean
  } | null
  onUpgrade?: () => void
}

export function PremiumSection({ aiUsage, onUpgrade }: PremiumSectionProps) {
  if (aiUsage?.isPremium) {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-800">Premium Active</span>
            <Sparkles className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-yellow-700 mb-4">You're enjoying unlimited AI assistance!</p>
          <div className="flex items-center justify-center gap-4 text-sm text-yellow-600">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Unlimited AI chats</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Advanced reports</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Priority support</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const usagePercentage = aiUsage ? (aiUsage.used / aiUsage.limit) * 100 : 0
  const isNearLimit = usagePercentage >= 80

  return (
    <Card
      className={`relative overflow-hidden ${isNearLimit ? "border-orange-200 bg-gradient-to-br from-orange-50 to-red-50" : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full translate-y-12 -translate-x-12"></div>

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-xl">Unlock Premium AI</CardTitle>
          </div>
          <Badge variant={isNearLimit ? "destructive" : "secondary"} className="text-xs">
            {aiUsage ? `${aiUsage.used}/${aiUsage.limit}` : "0/20"} messages
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {isNearLimit
            ? "You're running low on AI messages! Upgrade for unlimited access."
            : "Get unlimited AI financial insights and advanced analytics."}
        </p>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Usage Progress */}
        {aiUsage && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>AI Messages Used</span>
              <span className={isNearLimit ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                {usagePercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(usagePercentage, 100)}%`,
                  backgroundColor: isNearLimit ? "#ef4444" : "#87ceeb",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-sm">Unlimited Chats</div>
              <div className="text-xs text-muted-foreground">No monthly limits</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Advanced Reports</div>
              <div className="text-xs text-muted-foreground">Detailed analytics</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <div className="font-medium text-sm">Smart Insights</div>
              <div className="text-xs text-muted-foreground">AI predictions</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
            <Zap className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-sm">Priority Support</div>
              <div className="text-xs text-muted-foreground">Faster responses</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-gray-900">29 MAD</span>
              <span className="text-lg text-muted-foreground">/month</span>
              <span className="text-3xl font-bold text-gray-900">or 300 MAD/year</span>
            </div>
            <p className="text-sm text-muted-foreground">Cancel anytime • 30-day money-back guarantee</p>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full h-12 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: "#87ceeb" }}
          >
            <Crown className="h-5 w-5 mr-2" />
            {isNearLimit ? "Upgrade Now" : "Start Premium Trial"}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
