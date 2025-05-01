import LoginForm from "@/components/auth/LoginForm";
import { GraduationCap } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2 mb-8">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              <span className="text-primary">MARA</span>
              <span className="text-teal-500">Nexus</span>
              <span className="text-slate-700"> Scholar</span>
            </h1>
          </div>
          <LoginForm />
        </div>
      </div>
      
      {/* Right side - Info section */}
      <div className="hidden lg:flex flex-1 bg-primary text-white">
        <div className="flex flex-col justify-center p-12 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-6">Manage Your Student Allowance Claims</h2>
          <p className="text-lg mb-8">
            Welcome to <span className="font-bold">MARANexus Scholar</span> - your comprehensive platform for submitting, tracking, and managing your educational funding requests and academic progress.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Track Academic Progress</h3>
                <p>Record your grades and academic achievements</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Submit Claims Digitally</h3>
                <p>No more paperwork - submit all your claims online</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Real-time Updates</h3>
                <p>Get instant notifications on your claim status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
