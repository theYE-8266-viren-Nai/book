'use server'

import VoiceSession from "@/database/models/voice-session.model";
import { connectToDatabase } from "@/database/mongoose";
import { StartSessionResult } from "@/types"
import { getCurrentBillingPeriodStart } from "../subscription-constants";

export const startVoiceSession = async (clerkId : string , bookId : string) : Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.create({
            clerkId , bookId , startedAt : new Date() ,
            billingPeriodStart : getCurrentBillingPeriodStart(),
            durationSeconds : 0
        })
        return {
            success : true ,
            sessionId : session._id.toString(),

        }
    } catch (e) {
        console.error('Error starting voice session' , e);
        return {success : false , error : "Failed to start voice session"}
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number) => {
    try {
        await connectToDatabase();

        const session = await VoiceSession.findByIdAndUpdate(
            sessionId,
            {
                endedAt: new Date(),
                durationSeconds: durationSeconds
            },
            { new: true }
        );

        if (!session) {
            return { success: false };
        }

        return { success: true };
    } catch (e) {
        console.error('Error ending voice session', e);
        return { success: false };
    }
}