import LoginForm from "@/components/auth/LoginForm";
import AppHeader from "@/components/layout/AppHeader";

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppHeader title="Login" />
      
      <div className="flex-1 p-6 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
