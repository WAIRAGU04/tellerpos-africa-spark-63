
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { OTPVerificationProps } from "@/types/dashboard";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerify,
  onCancel,
  isOpen,
}) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(300); // 5 minutes in seconds
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && otpSent && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, remainingTime, otpSent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendOTP = () => {
    // In a real implementation, this would call an API to send the OTP
    toast.info(`OTP sent to ${email}. (For demo: OTP is 123456)`);
    setOtpSent(true);
    setRemainingTime(300);
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    
    // For demo purposes, we'll accept any 6-digit OTP. 
    // In production, you would validate this against what was sent.
    setTimeout(() => {
      // For demo, let's just accept "123456" as valid
      if (otp === "123456") {
        toast.success("OTP verified successfully");
        onVerify();
      } else {
        toast.error("Invalid OTP. Please try again");
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Security Verification</DialogTitle>
          <DialogDescription>
            A one-time password has been sent to your email address.
            Enter the 6-digit code to verify your identity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {!otpSent ? (
            <Button onClick={handleSendOTP} className="w-full">
              Send OTP to {email}
            </Button>
          ) : (
            <>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              <div className="text-sm text-muted-foreground">
                {remainingTime > 0 ? (
                  <p>Time remaining: {formatTime(remainingTime)}</p>
                ) : (
                  <p>OTP expired. <Button variant="link" onClick={handleSendOTP} className="p-0">Resend OTP</Button></p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={!otpSent || isVerifying || otp.length !== 6 || remainingTime <= 0}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
