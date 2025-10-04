import bcrypt from 'bcrypt';

// hash OTP
export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}
