"use client";

import { Eye, Download, Clock, User, Calendar, Play, Trophy, Target, BrainCircuit, Wrench, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Resource } from "@/data/resources";
import { Quiz } from "@/data/resources/quizzes";

interface ResourceGridProps {
  resources: Resource[];
  activeFilter: string;
  onResourceClick: (resource: Resource) => void;
  onQuizStart?: (quiz: Quiz) => void;
}

export function ResourceGrid({ resources, activeFilter, onResourceClick, onQuizStart }: ResourceGridProps) {
  // Handle Quizzes
  if (activeFilter === "Quizzes" && onQuizStart) {
    const quizzes = resources as unknown as Quiz[];
    return (
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-blue-900 to-purple-900 h-full flex flex-col"
              onClick={() => onQuizStart(quiz)}
              data-testid={`card-quiz-${quiz.id}`}
            >
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="h-32 md:h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <BrainCircuit className="w-8 h-8 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 opacity-80" />
                    <div className="text-xs md:text-sm font-medium uppercase tracking-wide">
                      {quiz.topic}
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 left-2 md:top-4 md:left-4">
                  <Badge className={`${
                    quiz.difficulty === 'beginner' ? 'bg-green-500' :
                    quiz.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                  } text-white border-0 capitalize text-xs px-2 py-1`}>
                    {quiz.difficulty}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 md:p-6 text-white flex flex-col flex-grow">
                <h4 className="text-base md:text-xl font-bold mb-2 md:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 text-center md:text-left">
                  {quiz.title}
                </h4>

                <p className="text-slate-300 mb-3 md:mb-4 text-xs md:text-sm leading-relaxed line-clamp-3 flex-grow text-left">
                  {quiz.description}
                </p>

                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between text-xs text-slate-400 mb-3 md:mb-4 gap-2 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {quiz.questions.length} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.timeLimit} min
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {quiz.passingScore}% to pass
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 mt-auto text-sm py-2 min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuizStart(quiz);
                  }}
                  data-testid={`button-start-quiz-${quiz.id}`}
                >
                  <Play className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle Tools & Tech
  if (activeFilter === "Tools & Tech") {
    return (
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((tech) => (
            <Card
              key={tech.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 bg-gradient-to-br from-slate-900 to-slate-800 h-full flex flex-col"
              onClick={() => onResourceClick(tech)}
              data-testid={`card-tech-${tech.id}`}
            >
              <CardContent className="p-3 md:p-6 text-white flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-3xl" />

                <div className="flex flex-col h-full">
                  <div className="flex flex-col items-center md:items-start mb-3 md:mb-3">
                    <div className="mb-2 md:mb-2">
                      <div className="text-blue-400 transition-transform duration-300 group-hover:scale-110 text-2xl md:text-xl flex justify-center">
                        <Wrench className="h-8 w-8 md:h-5 md:w-5" />
                      </div>
                    </div>

                    <h3 className="text-base md:text-xl font-bold group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 text-center md:text-left mb-1 md:mb-3">
                      {tech.title}
                    </h3>

                    <span className="text-xs md:text-sm font-medium uppercase tracking-wide text-blue-400 hidden md:inline">
                      {tech.type}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col text-left">
                    <div className="mb-3 md:mb-4">
                      <p className="text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed text-sm md:text-sm">
                        {tech.shortDescription}
                      </p>
                    </div>

                    <div className="mb-4 md:mb-6">
                      <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                        {tech.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300 px-2 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 mt-auto text-sm py-2 min-h-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResourceClick(tech);
                      }}
                      data-testid={`button-view-tech-${tech.id}`}
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle regular resources (Blog Posts, Whitepapers, Case Studies)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {resources.map((resource) => (
        <Card
          key={resource.id}
          className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:-translate-y-2"
          onClick={() => onResourceClick(resource)}
          data-testid={`card-resource-${resource.id}`}
        >
          <div className="relative overflow-hidden">
            <img
              src={resource.imageUrl}
              alt={resource.imageAlt}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge className="bg-orange-500 text-white border-0 mb-2">
                {resource.type}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed line-clamp-3">
              {resource.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              {resource.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {resource.author}
                </div>
              )}
              {resource.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {resource.date}
                </div>
              )}
              {resource.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {resource.readTime}
                </div>
              )}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onResourceClick(resource);
              }}
              data-testid={`button-view-resource-${resource.id}`}
            >
              {resource.type === "Whitepaper" ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              ) : resource.externalLink ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read More
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
