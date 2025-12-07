// Service functions to save/retrieve analysis data from Supabase

import { supabase } from "@/integrations/supabase/client";
import {
    VoiceAnalysisInsert,
    TextAnalysisInsert,
    ImageAnalysisInsert,
    mapSeverityLevel,
    SymptomWithConfidence,
    DiseaseWithConfidence
} from "./analysisTypes";

// Helper to get patient profile info
async function getPatientInfo(): Promise<{ id: string; name: string; email: string } | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Get profile for name
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", user.id)
            .single();

        const firstName = profile?.first_name || '';
        const lastName = profile?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Patient';

        return {
            id: user.id,
            name: fullName,
            email: user.email || ''
        };
    } catch (error) {
        console.error("Error getting patient info:", error);
        return null;
    }
}

// Format symptoms for storage
function formatSymptoms(symptoms: any[], symptomsWithConfidence?: any[]): SymptomWithConfidence[] {
    if (symptomsWithConfidence && symptomsWithConfidence.length > 0) {
        return symptomsWithConfidence.map((s: any) => ({
            symptom: s.symptom || s.name || s,
            confidence: s.confidence || 0.85,
            source: s.source || 'model'
        }));
    }
    return symptoms.map((s: any) => ({
        symptom: typeof s === 'string' ? s : s.name || s.symptom || String(s),
        confidence: 0.85,
        source: 'model' as const
    }));
}

// Format diseases for storage  
function formatDiseases(diseases: any[]): DiseaseWithConfidence[] {
    if (!diseases || diseases.length === 0) return [];
    return diseases.map((d: any) => ({
        name: d.name || d,
        confidence: d.confidence || 0.5,
        description: d.description || ''
    }));
}

// =====================
// VOICE ANALYSIS
// =====================
export async function saveVoiceAnalysis(
    spokenText: string,
    apiResponse: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const patient = await getPatientInfo();
        if (!patient) {
            return { success: false, error: "User not authenticated" };
        }

        const data: VoiceAnalysisInsert = {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_email: patient.email,
            spoken_text: spokenText,
            detected_symptoms: formatSymptoms(apiResponse.symptoms || [], apiResponse.symptoms_with_confidence),
            possible_diseases: formatDiseases(apiResponse.diseases || []),
            severity_level: mapSeverityLevel(apiResponse.severity || 'moderate'),
            ai_recommendations: (apiResponse.recommendations || []).join('\n'),
            confidence_score: apiResponse.confidence || undefined,
            language: 'en',
            analysis_model_version: 'v1.0'
        };

        const { error } = await supabase
            .from("voice_analyses")
            .insert(data as any);

        if (error) {
            console.error("Error saving voice analysis:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in saveVoiceAnalysis:", error);
        return { success: false, error: String(error) };
    }
}

// =====================
// TEXT ANALYSIS
// =====================
export async function saveTextAnalysis(
    inputText: string,
    apiResponse: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const patient = await getPatientInfo();
        if (!patient) {
            return { success: false, error: "User not authenticated" };
        }

        const data: TextAnalysisInsert = {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_email: patient.email,
            input_text: inputText,
            word_count: inputText.split(/\s+/).length,
            detected_symptoms: formatSymptoms(apiResponse.symptoms || [], apiResponse.symptoms_with_confidence),
            possible_diseases: formatDiseases(apiResponse.diseases || []),
            severity_level: mapSeverityLevel(apiResponse.severity || 'moderate'),
            ai_recommendations: (apiResponse.recommendations || []).join('\n'),
            confidence_score: apiResponse.confidence || undefined,
            follow_up_questions: apiResponse.follow_up_questions || [],
            related_body_parts: apiResponse.body_parts || [],
            analysis_model_version: 'v1.0'
        };

        const { error } = await supabase
            .from("text_analyses")
            .insert(data as any);

        if (error) {
            console.error("Error saving text analysis:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in saveTextAnalysis:", error);
        return { success: false, error: String(error) };
    }
}

// =====================
// IMAGE ANALYSIS
// =====================
export async function saveImageAnalysis(
    imageFile: File,
    apiResponse: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const patient = await getPatientInfo();
        if (!patient) {
            return { success: false, error: "User not authenticated" };
        }

        // Upload image to Supabase Storage
        let imageUrl = '';
        try {
            const fileName = `${patient.id}/${Date.now()}_${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('analysis-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error("Image upload error:", uploadError);
                // Continue without image URL if upload fails
                imageUrl = `local:${imageFile.name}`;
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('analysis-images')
                    .getPublicUrl(fileName);
                imageUrl = publicUrl;
            }
        } catch (uploadErr) {
            console.error("Image upload exception:", uploadErr);
            imageUrl = `local:${imageFile.name}`;
        }

        const data: ImageAnalysisInsert = {
            patient_id: patient.id,
            patient_name: patient.name,
            patient_email: patient.email,
            image_url: imageUrl,
            image_type: 'skin',
            body_part: apiResponse.body_part || 'skin',
            image_description: `Analyzed image: ${imageFile.name}`,
            detected_conditions: formatDiseases(apiResponse.diseases || []),
            possible_diseases: formatDiseases(apiResponse.diseases || []),
            severity_level: mapSeverityLevel(apiResponse.severity || 'moderate'),
            ai_recommendations: (apiResponse.recommendations || apiResponse.care_tips || []).join('\n'),
            confidence_score: apiResponse.confidence || undefined,
            analysis_model_version: 'v1.0'
        };

        const { error } = await supabase
            .from("image_analyses")
            .insert(data as any);

        if (error) {
            console.error("Error saving image analysis:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in saveImageAnalysis:", error);
        return { success: false, error: String(error) };
    }
}

// =====================
// FETCH ANALYSIS HISTORY
// =====================
export async function getPatientAnalysisHistory(limit: number = 20) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { voice: [], text: [], image: [] };

        const [voiceResult, textResult, imageResult] = await Promise.all([
            supabase
                .from("voice_analyses")
                .select("*")
                .eq("patient_id", user.id)
                .order("created_at", { ascending: false })
                .limit(limit),
            supabase
                .from("text_analyses")
                .select("*")
                .eq("patient_id", user.id)
                .order("created_at", { ascending: false })
                .limit(limit),
            supabase
                .from("image_analyses")
                .select("*")
                .eq("patient_id", user.id)
                .order("created_at", { ascending: false })
                .limit(limit)
        ]);

        return {
            voice: voiceResult.data || [],
            text: textResult.data || [],
            image: imageResult.data || []
        };
    } catch (error) {
        console.error("Error fetching analysis history:", error);
        return { voice: [], text: [], image: [] };
    }
}
