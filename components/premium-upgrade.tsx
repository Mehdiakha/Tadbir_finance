"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, MessageCircle, FileText, TrendingUp, Zap } from "lucide-react"

interface PremiumUpgradeProps {
  currentUsage?: number
  limit?: number
  onUpgrade?: () => void
}

export function PremiumUpgrade({ currentUsage = 0, limit = 20, onUpgrade }: PremiumUpgradeProps) {
  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-600" />
          <CardTitle className="text-xl text-yellow-800">Upgrade to Premium</CardTitle>
        </div>
        <Badge variant="secondary" className="mx-auto">
          {currentUsage}/{limit} AI messages used this month
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground mb-4">
          You've reached your monthly AI message limit. Upgrade to premium for unlimited access!
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm">Unlimited AI conversations</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm">Advanced analytics reports</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm">Priority AI insights</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-600" />
            <span className="text-sm">Faster response times</span>
          </div>
        </div>

        <div className="text-center pt-4">
          <div className="text-2xl font-bold text-yellow-800 mb-2">29 MAD/month or 300 MAD/year</div>
          <Button onClick={onUpgrade} className="w-full bg-yellow-600 hover:bg-yellow-700">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground">Cancel anytime • 30-day money-back guarantee</div>
      </CardContent>
    </Card>
  )
}
