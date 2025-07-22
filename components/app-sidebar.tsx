"use client"

import type * as React from "react"
import { useSession } from "next-auth/react"
import { BarChart3, CreditCard, DollarSign, Home, Target, Crown, MessageCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface AIUsage {
  isPremium: boolean
  used: number
  limit: number
  remaining: number
  canSendMessage: boolean
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  aiUsage?: AIUsage | null
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  {
    title: "Dashboard",
    value: "dashboard",
    icon: Home,
  },
  {
    title: "Expenses",
    value: "expenses",
    icon: CreditCard,
  },
  {
    title: "Savings Goals",
    value: "goals",
    icon: Target,
  },
  {
    title: "Analytics",
    value: "analytics",
    icon: BarChart3,
  },
]

export function AppSidebar({ aiUsage, activeTab, onTabChange, ...props }: AppSidebarProps) {
  const { data: session } = useSession()
  const usagePercentage = aiUsage ? (aiUsage.used / aiUsage.limit) * 100 : 0

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-semibold text-lg">Tadbir</span>
        </div>
        {session?.user && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{session.user.name}</div>
              {aiUsage?.isPremium && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            {aiUsage && !aiUsage.isPremium && (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">AI Messages</span>
                  <span className="font-medium">
                    {aiUsage.used}/{aiUsage.limit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <div className="text-xs text-muted-foreground">{aiUsage.remaining} messages remaining</div>
              </div>
            )}
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeTab === item.value}
                    onClick={() => onTabChange(item.value)}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat Assistant</span>
                  {aiUsage && !aiUsage.canSendMessage && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Limit Reached
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
