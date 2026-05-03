'use client';
import {
  CheckmarkCircleRegular,
  CircleRegular,
  ErrorCircleRegular,
  ChevronDownRegular,
  ChevronRightRegular
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Re-using types
export interface GeneratedImage {
  image_id: string;
  scene_index: number;
  prompt_used: string;
  file_path?: string;
  base64_data?: string;
  /** When base64_data is raw (not a full data: URL), e.g. image/png from Gemini / OpenRouter */
  mime_type?: string;
  success: boolean;
  error_message?: string;
}

export interface StoryCanvas {
  current_version: number;
  paragraphs: Array<{
    content: string;
    paragraph_type: string;
    version: number;
  }>;
  history: any[];
}

export interface WorkflowState {
  currentStage: string;
  activeWriters: string[];
  canvas: StoryCanvas | null;
  generatedImages: GeneratedImage[];
  draftDiagram: string;
  metrics: {
    quality_score: number;
    revision_count: number;
  };
  agentOutputs: {
    [key: string]: {
      title: string;
      content: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
    };
  };
}

const STORY_STEPS = [
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'planning', label: 'Perencanaan' },
  { id: 'research', label: 'Riset Konten' },
  { id: 'writing', label: 'Penulisan Cerita' },
  { id: 'critique', label: 'Evaluasi' },
  { id: 'hitl_plan', label: 'Tinjau rencana' },
  { id: 'hitl_critique', label: 'Persetujuan evaluasi' },
  { id: 'qa', label: 'Jawaban langsung' },
  { id: 'finalize', label: 'Finalisasi' },
];

export default function InlineWorkflowTracker({ state, externalAction }: { state: WorkflowState, externalAction?: React.ReactNode }) {
  // We only track STORY steps for this inline view as requested
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [isProcessExpanded, setIsProcessExpanded] = useState(true);

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  // Determine header text
  let headerTitle = "Proses Pembuatan Cerita";
  if (state.currentStage === 'finalize' && state.agentOutputs.finalize?.status === 'completed') {
    // Use the title extracted in page.tsx (stored in finalize.title)
    if (state.agentOutputs.finalize.title && state.agentOutputs.finalize.title !== 'Finalisasi') {
      headerTitle = state.agentOutputs.finalize.title;
    } else {
      headerTitle = "Cerita Selesai";
    }
  }

  return (
    <div className="w-full">
      {/* Header with Global Collapse - Increased padding */}
      <div
        className="px-6 py-4 border-b border-white/20 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsProcessExpanded(!isProcessExpanded)}
      >
        <span className="text-base font-semibold text-white">{headerTitle}</span>
        <div className="flex items-center gap-2">
          {(state.currentStage !== 'idle' && state.currentStage !== 'finalize') && (
            <div className="w-3.5 h-3.5 border-[1.5px] border-white/80 border-t-transparent rounded-full animate-spin ml-2" />
          )}
          {isProcessExpanded ? <ChevronDownRegular className="w-5 h-5 text-white/70" /> : <ChevronRightRegular className="w-5 h-5 text-white/70" />}
        </div>

        {/* External Action (e.g., Canvas Toggle) - Rendered here to align with header */}
        {externalAction && (
          <div className="ml-auto flex items-center border-l border-white/20 pl-3" onClick={(e) => e.stopPropagation()}>
            {externalAction}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isProcessExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-white/10">
              {STORY_STEPS.map((step) => {
                const stepData = state.agentOutputs[step.id];
                // Only show step if it has been encountered (has entry in agentOutputs)
                if (!stepData) return null;
                const status = stepData.status || 'pending';
                const isActive = status === 'running';
                const isCompleted = status === 'completed';
                const isFailed = status === 'failed';
                const hasContent = !!stepData.content;
                const isExpanded = expandedStep === step.id;

                return (
                  <div key={step.id} className="bg-transparent">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStep(step.id);
                      }}
                      disabled={!hasContent}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left ${!hasContent ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckmarkCircleRegular className="w-5 h-5 text-green-300" />
                        ) : isFailed ? (
                          <ErrorCircleRegular className="w-5 h-5 text-red-300" />
                        ) : isActive ? (
                          <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin ml-0.5" />
                        ) : (
                          <CircleRegular className="w-5 h-5 text-white/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-white/50'}`}>
                          {step.label}
                        </p>
                      </div>

                      {hasContent && (
                        <div className="text-white/50">
                          {isExpanded ? <ChevronDownRegular className="w-4 h-4" /> : <ChevronRightRegular className="w-4 h-4" />}
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && hasContent && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-black/20"
                        >
                          <div className="px-4 py-2 text-xs text-white/90 font-mono whitespace-pre-wrap border-t border-white/10 mx-4 mb-2 rounded-md">
                            {stepData.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
