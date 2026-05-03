'use client';
import {
  CheckmarkCircleRegular,
  CircleRegular,
  ErrorCircleRegular,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';

// Types matching Skripsi structure
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
  diagramTitle?: string;
  storyTitle?: string;
  finalStory?: string; // Markdown content of the story
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

const QA_STEPS = [
  { id: 'analyzing', label: 'Analisis Pertanyaan' },
  { id: 'searching', label: 'Pencarian Dokumen (RAG)' },
  { id: 'generating', label: 'Penyusunan Jawaban' },
];

export default function WorkflowTracker({ state, mode = 'STORY' }: { state: WorkflowState; mode?: 'STORY' | 'QA' }) {
  const steps = mode === 'STORY' ? STORY_STEPS : QA_STEPS;

  return (
    <div className="h-full flex flex-col p-6 bg-white rounded-r-[18px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#3674B5]">Workflow Status</h2>
        <p className="text-sm text-gray-500">Memproses permintaanmu...</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="relative pl-4 space-y-8">
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-gray-100 -z-10" />

            {steps.map((step) => {
              const stepData = state.agentOutputs[step.id];
              // Only show step if it has been encountered (has entry in agentOutputs)
              if (!stepData) return null;
              const status = stepData.status || 'pending';
              const isActive = status === 'running';
              const isCompleted = status === 'completed';
              const isFailed = status === 'failed';

              return (
                <div key={step.id} className="flex gap-4 items-start group">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 transition-colors ${isCompleted
                      ? 'bg-[#E8FAF0] text-[#17C964]'
                      : isFailed
                        ? 'bg-red-50 text-red-500'
                        : isActive
                          ? 'bg-[#E6F1FE] text-[#3674B5]'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckmarkCircleRegular className="w-6 h-6" />
                    ) : isFailed ? (
                      <ErrorCircleRegular className="w-6 h-6" />
                    ) : isActive ? (
                      <div className="w-6 h-6 border-2 border-[#3674B5] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CircleRegular className="w-6 h-6" />
                    )}
                  </div>
                  <div className="pt-1 flex-1">
                    <h3
                      className={`font-semibold text-base ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                    >
                      {step.label}
                    </h3>
                    {stepData?.content && (isActive || isCompleted) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100"
                      >
                        <div className="line-clamp-3 whitespace-pre-wrap">
                          {stepData.content}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
