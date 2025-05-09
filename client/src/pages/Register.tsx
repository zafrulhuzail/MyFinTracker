import RegisterForm from "@/components/auth/RegisterForm";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Register() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
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
              <h1 className="text-2xl font-bold">
                <span className="text-primary">My</span>
                <span className="text-teal-500">Fin</span>
                <span className="text-slate-700">Tracker</span>
              </h1>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: JSX.Element; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-white/20 p-2 rounded-full">{icon}</div>
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}
