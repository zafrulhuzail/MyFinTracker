import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ClaimForm from "@/components/claim/ClaimForm";

export default function NewClaim() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="New Claim" />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
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
      

    </div>
  );
}
