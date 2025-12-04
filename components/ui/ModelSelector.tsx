'use client';

import { AIModel } from '@/types';

interface ModelSelectorProps {
  selected: AIModel;
  onChange: (model: AIModel) => void;
  className?: string;
}

const models: { value: AIModel; label: string; description: string }[] = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Rápido y gratuito',
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'Más preciso y avanzado',
  },
  {
    value: 'gpt-3.5',
    label: 'GPT-3.5 Turbo',
    description: 'Rápido y económico',
  },
  {
    value: 'claude',
    label: 'Claude',
    description: 'Excelente para análisis',
  },
];

export default function ModelSelector({ selected, onChange, className = '' }: ModelSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Modelo de IA
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as AIModel)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900"
      >
        {models.map((model) => (
          <option key={model.value} value={model.value}>
            {model.label} - {model.description}
          </option>
        ))}
      </select>
    </div>
  );
}
