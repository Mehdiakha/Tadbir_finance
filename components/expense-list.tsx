"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { ExpenseForm } from "./expense-form"

interface Expense {
  id: string
  amount: number
  category: string
  date: string
  notes?: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: () => void
}

export function ExpenseList({ expenses, onUpdate }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" })
      onUpdate()
    } catch (error) {
      console.error("Error deleting expense:", error)
    }
  }

  const handleEdit = async (id: string, data: any) => {
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      setEditingId(null)
      onUpdate()
    } catch (error) {
      console.error("Error updating expense:", error)
    }
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No expenses recorded yet. Add your first expense above!
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          {editingId === expense.id ? (
            <CardContent className="p-6">
              <ExpenseForm initialData={expense} isEditing onSubmit={(data) => handleEdit(expense.id, data)} />
              <Button variant="outline" onClick={() => setEditingId(null)} className="mt-4">
                Cancel
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold">${expense.amount.toFixed(2)}</span>
                    <Badge variant="secondary">{expense.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{new Date(expense.date).toLocaleDateString()}</p>
                  {expense.notes && <p className="text-sm">{expense.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(expense.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
