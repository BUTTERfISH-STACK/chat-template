import prisma from "@/lib/prisma";

export async function addOtp(phoneNumber: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  // Delete existing OTPs for this phone number
  await prisma.oTP.deleteMany({
    where: { phoneNumber },
  });

  // Create new OTP
  await prisma.oTP.create({
    data: {
      phoneNumber,
      otp,
      expiresAt,
    },
  });

  console.log(`OTP stored for ${phoneNumber}: ${otp}`);
}

export async function getOtp(phoneNumber: string): Promise<string | null> {
  const otpData = await prisma.oTP.findFirst({
    where: {
      phoneNumber,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpData) {
    console.log(`No OTP found for ${phoneNumber}`);
    return null;
  }

  return otpData.otp;
}

export async function removeOtp(phoneNumber: string): Promise<void> {
  await prisma.oTP.deleteMany({
    where: { phoneNumber },
  });

  console.log(`OTP removed for ${phoneNumber}`);
}
