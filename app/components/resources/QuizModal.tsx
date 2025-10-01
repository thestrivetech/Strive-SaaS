"use client";

import { useState } from "react";
import { X, Play, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Quiz, QuizQuestion, QuizResult } from "@/data/resources/quizzes";

interface QuizModalProps {
  selectedQuiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuizModal({ selectedQuiz, isOpen, onClose }: QuizModalProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizStartTime(Date.now());
    setQuizResult(null);
    setShowQuizResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!selectedQuiz) return;

    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate quiz results
      const correctAnswers = newAnswers.filter(
        (answer, index) => answer === selectedQuiz.questions[index].correctAnswer
      ).length;
      const score = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);
      const timeSpent = Math.round((Date.now() - quizStartTime) / 60000);

      const result: QuizResult = {
        quizId: selectedQuiz.id,
        score,
        correctAnswers,
        totalQuestions: selectedQuiz.questions.length,
        timeSpent: Math.max(1, timeSpent),
        passed: score >= selectedQuiz.passingScore,
        completedAt: new Date().toISOString(),
      };

      setQuizResult(result);
      setShowQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizStartTime(0);
    setQuizResult(null);
    setShowQuizResult(false);
  };

  const closeQuizModal = () => {
    resetQuiz();
    onClose();
  };

  if (!selectedQuiz) return null;

  const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQuizModal()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto modal-scrollbar">
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
          onClick={closeQuizModal}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        {!showQuizResult ? (
          <>
            {currentQuestionIndex === 0 && userAnswers.length === 0 ? (
              /* Quiz Introduction */
              <div className="space-y-6">
                <DialogTitle className="text-2xl font-bold">{selectedQuiz.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedQuiz.description}
                </DialogDescription>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-slate-600">Questions</div>
                    <div className="text-xl font-semibold">{selectedQuiz.questions.length}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-slate-600">Passing Score</div>
                    <div className="text-xl font-semibold">{selectedQuiz.passingScore}%</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-slate-600">Difficulty</div>
                    <div className="text-xl font-semibold">{selectedQuiz.difficulty}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-slate-600">Topic</div>
                    <div className="text-xl font-semibold">{selectedQuiz.topic}</div>
                  </div>
                </div>

                <Button
                  onClick={() => startQuiz(selectedQuiz)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-start-quiz"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </Button>
              </div>
            ) : (
              /* Quiz Questions */
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <DialogTitle className="text-lg font-semibold">
                      Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                    </DialogTitle>
                    <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <DialogDescription className="text-base font-medium text-slate-800">
                  {currentQuestion.question}
                </DialogDescription>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      data-testid={`button-answer-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Quiz Results */
          <>
            <div className="space-y-6">
              <div className="text-center">
                <DialogTitle className={`text-3xl font-bold mb-2 ${
                  quizResult!.passed ? "text-green-600" : "text-red-600"
                }`}>
                  {quizResult!.passed ? "🎉 Congratulations! You Passed!" : "📚 Keep Learning!"}
                </DialogTitle>
                <p className="text-slate-600">
                  You answered {quizResult!.correctAnswers} out of {quizResult!.totalQuestions} questions correctly
                </p>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {quizResult!.score}%
                  </div>
                  <div className="text-sm text-slate-600">Final Score</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {quizResult!.correctAnswers}/{quizResult!.totalQuestions}
                  </div>
                  <div className="text-sm text-slate-600">Correct Answers</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {quizResult!.timeSpent} min
                  </div>
                  <div className="text-sm text-slate-600">Time Spent</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Question Review</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto modal-scrollbar">
                  {selectedQuiz.questions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCorrect ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-2">{question.question}</p>
                            <div className="text-xs space-y-1">
                              <div className={`${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                Your answer: {question.options[userAnswer]}
                              </div>
                              {!isCorrect && (
                                <div className="text-green-600">
                                  Correct answer: {question.options[question.correctAnswer]}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={closeQuizModal}
                  className="flex-1"
                  data-testid="button-close-results"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    resetQuiz();
                    startQuiz(selectedQuiz);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-retake-quiz"
                >
                  Retake Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/contact')}
                  className="flex-1"
                  data-testid="button-get-consulting"
                >
                  Get AI Insights
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}