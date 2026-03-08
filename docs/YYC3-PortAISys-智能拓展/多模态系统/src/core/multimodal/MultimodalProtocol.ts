/**
 * @file docs/YYC3-PortAISys-智能拓展/多模态系统/src/core/multimodal/MultimodalProtocol.ts
 * @description Multimodal Protocol 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,core
 */

export type InputModality = 'voice' | 'gesture' | 'touch' | 'keyboard' | 'mouse' | 'pen' | 'gaze'

export interface InputEvent {
    id: string
    modality: InputModality
    type: string
    timestamp: number
    confidence: number
    data: any
    source?: string
    priority?: number
}

export interface FusedInput {
    id: string
    timestamp: number
    modalities: InputModality[]
    confidence: number
    intent: string
    parameters: Record<string, any>
    rawEvents: InputEvent[]
    context: any
}

export interface ModalityConfig {
    enabled: boolean
    priority: number
    confidenceThreshold: number
    timeout: number
    weight: number
}

export interface MultimodalConfig {
    modalities: Record<InputModality, ModalityConfig>
    fusionStrategy: 'weighted' | 'voting' | 'hierarchical' | 'contextual'
    timeout: number
    requireConfirmation: boolean
    enableLearning: boolean
    maxHistorySize: number
}

export interface ContextState {
    user: {
        id?: string
        preferences: Record<string, any>
        behavior: {
            modalityPreference: Record<InputModality, number>
            averageConfidence: Record<InputModality, number>
            successRate: Record<InputModality, number>
        }
    }
    environment: {
        deviceType: 'mobile' | 'tablet' | 'desktop' | 'mixed'
        inputCapabilities: InputModality[]
        screenSize: { width: number; height: number }
        network: 'online' | 'offline' | 'slow'
    }
    session: {
        startTime: number
        modalityUsage: Record<InputModality, number>
        currentTask?: string
        recentIntents: string[]
    }
}

export interface FusionRule {
    id: string
    name: string
    condition: (events: InputEvent[], context: ContextState) => boolean
    action: (events: InputEvent[], context: ContextState) => FusedInput
    priority: number
}