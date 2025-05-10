
import { useState } from "react";
import { ShiftFormValues } from "@/types/shift";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StartShiftFormProps {
  onStartShift: (values: ShiftFormValues) => void;
}

const StartShiftForm = ({ onStartShift }: StartShiftFormProps) => {
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (openingBalance < 0) {
      toast({
        title: "Invalid opening balance",
        description: "Opening balance cannot be negative",
        variant: "destructive"
      });
      return;
    }
    
    onStartShift({ openingBalance });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-tellerpos-dark-accent/20">
        <CardTitle>Start New Shift</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening Cash Balance</Label>
              <Input
                id="openingBalance"
                type="number"
                placeholder="Enter opening balance"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                required
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Enter the amount of cash in the drawer at the start of your shift
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="submit">Start Shift</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StartShiftForm;
