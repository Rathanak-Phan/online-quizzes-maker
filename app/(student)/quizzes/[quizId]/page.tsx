'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiClock, FiCheckCircle, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface QuizDetails {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  isCompleted: boolean;
  submittedAt?: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  
  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.timeLimit > 0 && !quiz.isCompleted) {
      const totalSeconds = quiz.timeLimit * 60;
      setTimeLeft(totalSeconds);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/student/quizzes/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        
        // Load saved progress
        const savedProgress = localStorage.getItem(`quiz_${quizId}_progress`);
        if (savedProgress) {
          setAnswers(JSON.parse(savedProgress));
        }
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(() => {
    if (quiz) {
      localStorage.setItem(`quiz_${quizId}_progress`, JSON.stringify(answers));
    }
  }, [quizId, answers, quiz]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting || !quiz) return;
    
    try {
      setSubmitting(true);
      
      // Calculate score
      const score = quiz.questions.reduce((total, question, index) => {
        const studentAnswer = answers[index];
        if (studentAnswer === question.correctAnswer) {
          return total + question.points;
        }
        return total;
      }, 0);

      const totalPoints = quiz.questions.reduce((total, question) => total + question.points, 0);

      // Submit to API
      const response = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          score,
          totalPoints,
          timeSpent: (quiz.timeLimit * 60) - timeLeft,
        }),
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem(`quiz_${quizId}_progress`);
        
        // Redirect to results
        router.push(`/student/quiz/${quizId}/results`);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz not found</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (quiz.isCompleted) {
    router.push(`/student/quiz/${quizId}/results`);
    return null;
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Quiz Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="bg-red-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <FiClock className="text-red-600" />
                  <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
                <p className="text-xs text-red-600">Time Remaining</p>
              </div>
              
              {/* Progress */}
              <div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600" />
                  <span className="font-bold">
                    {Object.keys(answers).length}/{totalQuestions}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Answered</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Question {currentQuestion + 1}
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestionData.points} points
              </span>
            </div>
            
            <p className="text-lg mb-8">{currentQuestionData.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <FiArrowLeft />
              Previous
            </button>
            
            <div className="flex items-center gap-4">
              {/* Question Indicators */}
              <div className="hidden md:flex gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[index] !== undefined
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {currentQuestion === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Next
                  <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>⚠️ Don't forget to submit before the timer runs out!</p>
          <p className="mt-1">Your progress is saved automatically as you go.</p>
        </div>
      </div>
    </div>
  );
}