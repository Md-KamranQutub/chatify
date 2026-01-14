import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

const sendOtpToPhoneNumber = async (phoneNumber) => {
    try {
        if(!phoneNumber) {
            throw new Error("Phone number is required");
        }
        const response = await client.verify.v2.verificationAttempts(serviceSid).verifications.create({
            to: phoneNumber,
            channel: 'sms',
        });
        console.log("OTP sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
};

const verifyOtp = async (phoneNumber, otp) => {
    try {
        if(!phoneNumber || !otp) {
            throw new Error("Phone number and OTP are required");
        }
        const response = await client.verify.v2.verificationChecks(serviceSid).verifications.create({
            to: phoneNumber,
            code: otp,
        });
        console.log("OTP verified successfully:", response);
        return response;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw new Error("Failed to verify OTP");
    }
};

export default { sendOtpToPhoneNumber, verifyOtp };