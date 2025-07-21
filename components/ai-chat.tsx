"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, FileText, Crown, MessageCircle, ArrowLeft, Trash2, X, Download } from "lucide-react"
import { PremiumUpgrade } from "./premium-upgrade"

interface AIUsage {
  isPremium: boolean
  used: number
  limit: number
  remaining: number
  canSendMessage: boolean
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [lastReport, setLastReport] = useState<string | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    onError: (error) => {
      if (error.message.includes("limit exceeded")) {
        setShowUpgrade(true)
        fetchAIUsage()
      }
    },
    onFinish: () => {
      fetchAIUsage()
    },
  })

  const fetchAIUsage = async () => {
    try {
      const response = await fetch("/api/ai-usage")
      const data = await response.json()
      setAiUsage(data)
    } catch (error) {
      console.error("Error fetching AI usage:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAIUsage()
    }
  }, [isOpen])

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        const reportContent = `# 📊 Your Personal Finance Report\n\n${data.report}`
        setLastReport(reportContent)

        // Add the report as a message in the chat
        const reportMessage = {
          id: Date.now().toString(),
          role: "assistant" as const,
          content: reportContent,
        }
        setMessages([...messages, reportMessage])
      } else {
        alert("Failed to generate report: " + data.error)
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Error generating report")
    } finally {
      setGeneratingReport(false)
    }
  }

  const downloadReportAsPDF = () => {
    if (!lastReport) return

    // Create a simple HTML version of the report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Personal Finance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #87ceeb; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 30px; }
            h3 { color: #666; }
            p { margin: 10px 0; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 5px 0; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Personal Finance Report</h1>
            <p class="date">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${lastReport.replace(/\n/g, "<br>").replace(/# /g, "<h1>").replace(/## /g, "<h2>").replace(/### /g, "<h3>")}
        </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-report-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearMessages = () => {
    setMessages([])
    setLastReport(null)
  }

  const suggestedQuestions = [
    "How much did I spend on food this month?",
    "What's my biggest spending category?",
    "Categorize my recent expenses",
    "Give me a spending summary",
    "How can I save more money?",
    "Analyze my spending patterns",
  ]

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
          style={{ backgroundColor: "#87ceeb" }}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  if (showUpgrade && aiUsage && !aiUsage.canSendMessage) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80">
        <PremiumUpgrade
          currentUsage={aiUsage.used}
          limit={aiUsage.limit}
          onUpgrade={() => {
            alert("Premium upgrade coming soon!")
            setShowUpgrade(false)
          }}
        />
        <Button variant="outline" onClick={() => setShowUpgrade(false)} className="w-full mt-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 h-[600px] shadow-lg flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              {aiUsage?.isPremium && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {lastReport && (
                <Button variant="ghost" size="sm" onClick={downloadReportAsPDF} title="Download report">
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearMessages} title="Clear messages">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {aiUsage && !aiUsage.isPremium && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AI Messages</span>
                <span className="font-medium">
                  {aiUsage.used}/{aiUsage.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(aiUsage.used / aiUsage.limit) * 100}%`,
                    backgroundColor: aiUsage.used >= aiUsage.limit * 0.8 ? "#ef4444" : "#87ceeb",
                  }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{aiUsage.remaining} remaining</span>
                <Button variant="outline" size="sm" onClick={() => setShowUpgrade(true)} className="h-6 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={generateReport}
                      disabled={generatingReport}
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      style={{ borderColor: "#87ceeb", color: "#87ceeb" }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {generatingReport ? "Generating..." : "Generate Report"}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">Ask me about your finances:</p>
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 text-xs bg-transparent"
                      onClick={() => {
                        handleInputChange({ target: { value: question } } as any)
                      }}
                      disabled={!aiUsage?.canSendMessage}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="flex-shrink-0">
                      {message.role === "user" ? (
                        <User className="h-6 w-6 p-1 bg-primary text-primary-foreground rounded-full" />
                      ) : (
                        <Bot className="h-6 w-6 p-1 bg-secondary text-secondary-foreground rounded-full" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm whitespace-pre-wrap ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <Bot className="h-6 w-6 p-1 bg-secondary text-secondary-foreground rounded-full" />
                  <div className="bg-secondary rounded-lg p-3 text-sm">Thinking...</div>
                </div>
              )}

              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error.message}</div>}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder={
                  aiUsage?.canSendMessage ? "Ask about your finances..." : "Upgrade to premium to continue chatting..."
                }
                disabled={isLoading || !aiUsage?.canSendMessage}
                className="min-h-[50px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim() || !aiUsage?.canSendMessage}
                className="self-end"
                style={{ backgroundColor: "#87ceeb" }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {!aiUsage?.canSendMessage && (
              <div className="text-xs text-center text-muted-foreground mt-2">
                <MessageCircle className="h-3 w-3 inline mr-1" />
                Monthly limit reached. Upgrade for unlimited access.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
