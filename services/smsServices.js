
import twilio from "twilio";

const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

export const sendOTPVerification = async (phone,verificationOTP) => {

    await client.messages.create({
        body: `Your verification code is ${verificationOTP}`,
        from: process.env.TWILIO_PHONE_NO,
        to: phone
    })

}