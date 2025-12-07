// TypeScript types for analysis tables

export interface SymptomWithConfidence {
    symptom: string;
    confidence: number;
    source?: 'model' | 'rule';
}

export interface DiseaseWithConfidence {
    name: string;
    confidence: number;
    description?: string;
}

// Voice Analysis Types
export interface VoiceAnalysisInsert {
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    spoken_text: string;
    audio_duration_seconds?: number;
    audio_file_url?: string;
    detected_symptoms: SymptomWithConfidence[];
    possible_diseases: DiseaseWithConfidence[];
    severity_level: 'low' | 'moderate' | 'high' | 'critical';
    ai_recommendations?: string;
    confidence_score?: number;
    language?: string;
    analysis_model_version?: string;
}

export interface VoiceAnalysis extends VoiceAnalysisInsert {
    id: string;
    created_at: string;
    updated_at: string;
}

// Text Analysis Types
export interface TextAnalysisInsert {
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    input_text: string;
    word_count?: number;
    detected_symptoms: SymptomWithConfidence[];
    possible_diseases: DiseaseWithConfidence[];
    severity_level: 'low' | 'moderate' | 'high' | 'critical';
    ai_recommendations?: string;
    confidence_score?: number;
    follow_up_questions?: string[];
    related_body_parts?: string[];
    analysis_model_version?: string;
}

export interface TextAnalysis extends TextAnalysisInsert {
    id: string;
    created_at: string;
    updated_at: string;
}

// Image Analysis Types
export interface ImageAnalysisInsert {
    patient_id: string;
    patient_name: string;
    patient_email?: string;
    image_url: string;
    image_type?: 'skin' | 'xray' | 'mri' | 'ct_scan' | 'eye' | 'other';
    body_part?: string;
    image_description?: string;
    detected_conditions: DiseaseWithConfidence[];
    possible_diseases: DiseaseWithConfidence[];
    severity_level: 'low' | 'moderate' | 'high' | 'critical';
    ai_recommendations?: string;
    confidence_score?: number;
    affected_area_percentage?: number;
    bounding_boxes?: object;
    analysis_model_version?: string;
}

export interface ImageAnalysis extends ImageAnalysisInsert {
    id: string;
    created_at: string;
    updated_at: string;
}

// Analysis History (combined view)
export interface AnalysisHistoryItem {
    id: string;
    patient_id: string;
    patient_name: string;
    analysis_type: 'voice' | 'text' | 'image';
    analysis_id: string;
    summary?: string;
    primary_diagnosis?: string;
    severity_level: 'low' | 'moderate' | 'high' | 'critical';
    reviewed_by_doctor?: string;
    doctor_notes?: string;
    is_reviewed: boolean;
    reviewed_at?: string;
    created_at: string;
}

// Helper type for severity mapping
export function mapSeverityLevel(severity: string): 'low' | 'moderate' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'moderate' | 'high' | 'critical'> = {
        'mild': 'low',
        'low': 'low',
        'moderate': 'moderate',
        'urgent': 'high',
        'high': 'high',
        'emergency': 'critical',
        'critical': 'critical',
        'severe': 'critical'
    };
    return severityMap[severity.toLowerCase()] || 'moderate';
}
