import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ClaimForm from "@/components/claim/ClaimForm";

export default function NewClaim() {
  return (
    <div className="w-full pb-8">
      <div className="px-4 py-6 container mx-auto max-w-4xl">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">New Claim</h2>
          <p className="text-gray-600">Fill in the details to submit a new claim</p>
        </div>
        
        {/* Claim Form */}
        <div className="bg-white rounded-lg shadow p-5">
          <ClaimForm />
        </div>
      </div>
    </div>
  );
}
