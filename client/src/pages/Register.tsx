import RegisterForm from "@/components/auth/RegisterForm";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Registration form */}
      <div className="flex-1 flex flex-col p-8">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MARA Claim System</h1>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
            <RegisterForm />
          </div>
        </div>
      </div>
      
      {/* Right side - Info section */}
      <div className="hidden lg:flex flex-1 bg-primary text-white">
        <div className="flex flex-col justify-center p-12 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-6">Join the MARA Community</h2>
          <p className="text-lg mb-8">
            Register to access the MARA Student Allowance Claim System and manage your educational funding with ease.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Simple Submission Process</h3>
                <p>Submit and track your claims with just a few clicks</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Academic Records Management</h3>
                <p>Keep all your academic achievements in one place</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Secure & Convenient</h3>
                <p>Access your information anytime, anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
