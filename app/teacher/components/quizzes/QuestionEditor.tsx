// app/components/quizzes/QuestionEditor.tsx
"use client";

import { useState } from "react";
import {
  Trash2,
  Copy,
  ChevronDown,
  Image as ImageIcon,
  Code,
  Link as LinkIcon,
  GripVertical,
} from "lucide-react";
import { Question } from "@/app/types/quiz";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTypeChange = (type: Question['type']) => {
    const updates: Partial<Question> = { type };
    
    if (type === 'multiple') {
      updates.options = ["", "", "", ""];
      updates.correctAnswer = 0;
    } else if (type === 'truefalse') {
      updates.options = undefined;
      updates.correctAnswer = true;
    } else if (type === 'short') {
      updates.options = undefined;
      updates.correctAnswer = "";
    } else if (type === 'essay') {
      updates.options = undefined;
      updates.correctAnswer = undefined;
    }
    
    onUpdate(updates);
  };

  const addOption = () => {
    if (question.options) {
      onUpdate({ options: [...question.options, ""] });
    }
  };

  const removeOption = (optionIndex: number) => {
    if (question.options && question.options.length > 2) {
      const newOptions = [...question.options];
      newOptions.splice(optionIndex, 1);
      
      // Adjust correct answer if needed
      let newCorrectAnswer = question.correctAnswer;
      if (typeof newCorrectAnswer === 'number' && newCorrectAnswer >= optionIndex) {
        newCorrectAnswer = Math.max(0, newCorrectAnswer - 1);
      }
      
      onUpdate({ 
        options: newOptions,
        correctAnswer: newCorrectAnswer 
      });
    }
  };

  const updateOption = (optionIndex: number, value: string) => {
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      onUpdate({ options: newOptions });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex gap-2">
              <select
                value={question.type}
                onChange={(e) => handleTypeChange(e.target.value as Question['type'])}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium"
              >
                <option value="multiple">Multiple Choice</option>
                <option value="truefalse">True/False</option>
                <option value="short">Short Answer</option>
                <option value="essay">Essay</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: Math.max(1, parseInt(e.target.value) || 10) })}
                  min="1"
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-center text-sm"
                />
                <span className="text-sm text-gray-600">points</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDuplicate}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Duplicate question"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg"
            title="Delete question"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <textarea
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter your question here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Question Options */}
      {question.type === 'multiple' && question.options && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Options</span>
            <button
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add option
            </button>
          </div>
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-3">
              <input
                type="radio"
                checked={question.correctAnswer === optIndex}
                onChange={() => onUpdate({ correctAnswer: optIndex })}
                className="w-4 h-4 text-blue-600"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {question.options!.length > 2 && (
                <button
                  onClick={() => removeOption(optIndex)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {question.type === 'truefalse' && (
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={question.correctAnswer === true}
              onChange={() => onUpdate({ correctAnswer: true })}
              className="w-5 h-5 text-blue-600"
            />
            <span className="font-medium text-gray-900">True</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              checked={question.correctAnswer === false}
              onChange={() => onUpdate({ correctAnswer: false })}
              className="w-5 h-5 text-blue-600"
            />
            <span className="font-medium text-gray-900">False</span>
          </label>
        </div>
      )}

      {question.type === 'short' && (
        <div className="mb-6">
          <input
            type="text"
            value={question.correctAnswer as string || ""}
            onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
            placeholder="Expected answer (case insensitive)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Advanced Options */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced options
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (shown after quiz)
            </label>
            <textarea
              value={question.explanation || ""}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <ImageIcon className="w-4 h-4" />
              Add image
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Code className="w-4 h-4" />
              Add code block
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <LinkIcon className="w-4 h-4" />
              Add link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}