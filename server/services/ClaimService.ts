import type { DatabaseStorage } from "../storage";
import { sendEmail } from "../utils/email";

export class ClaimService {
  constructor(private storage: DatabaseStorage) {}

  async submitClaim(input: any, userId: number) {
    const claim = await this.storage.createClaim({
      ...input,
      userId,
    });

    const admin = await this.storage.getUserByUsername("admin");
    if (admin) {
      await this.storage.createNotification({
        userId: admin.id,
        title: "New Claim Submitted",
        message: `Claim ID: ${claim.id}`,
      });
    }

    await this.storage.createNotification({
      userId,
      title: "Claim Submitted",
      message: `Claim ID: ${claim.id}`,
    });

    return claim;
  }

  async getAllClaim(userId: number, userRole:string){

    if (userRole === "admin") {
    return this.storage.getAllClaims();
    }
     
    return this.storage.getClaimsByUser(userId);

  }

  async getClaimById(claimId: number, userRole:string, userId: number){

    const claim = await this.storage.getClaim(claimId)

    if (!claim)return null;

    if (userRole !== "admin" && claim.userId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    return claim
  }

  async updateClaimStatus(claimId: number, adminId: number, validatedData: any){

    const claim = await this.storage.getClaim(claimId)

    if (!claim) return null;

    const updatedClaim = await this.storage.updateClaimStatus(claimId, validatedData, adminId)

    const student = await this.storage.getUser(claim.userId);

    if (student) {
        // Notify the student about the claim status update
        await this.storage.createNotification({
            userId: student.id,
            title: `Claim ${validatedData.status.charAt(0).toUpperCase() + validatedData.status.slice(1)}`,
            message: `Your claim for ${claim.claimType} has been ${validatedData.status}.`
        });
        
        // Send email notification
        await sendEmail(
            student.email,
            `MARA Claim ${validatedData.status.charAt(0).toUpperCase() + validatedData.status.slice(1)}`,
            `Dear ${student.fullName},\n\nYour claim for ${claim.claimType} (€${claim.amount}) has been ${validatedData.status}.${validatedData.reviewComment ? `\n\nReviewer comments: ${validatedData.reviewComment}` : ""}\n\nBest regards,\nMARA Admin Team`
        );
    }

    return updatedClaim
  }
}
