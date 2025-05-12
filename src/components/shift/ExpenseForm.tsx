import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Expense } from "@/types/shift";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id" | "timestamp">) => void;
}

const ExpenseForm = ({ onAddExpense }: ExpenseFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onAddExpense) {
      const expense = {
        description: description.trim(),
        amount,
        date: new Date().toISOString().split('T')[0], // Add today's date
        category: 'Miscellaneous', // Add default category
        paymentMethod: 'cash' // Add default payment method
      };
      onAddExpense(expense);
      setDescription("");
      setAmount(0);
      toast({
        title: "Expense added",
        description: "The expense has been recorded successfully"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="bg-tellerpos-dark-accent/20">
        <CardTitle>Record Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter expense description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              min={1}
              step="any"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">Add Expense</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExpenseForm;
