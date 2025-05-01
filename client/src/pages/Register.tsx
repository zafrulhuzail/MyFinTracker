import RegisterForm from "@/components/auth/RegisterForm";
import AppHeader from "@/components/layout/AppHeader";

export default function Register() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppHeader title="Register" />
      
      <div className="flex-1 p-6 flex items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  );
}
