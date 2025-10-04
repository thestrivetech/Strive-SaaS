import { useState, useEffect, useMemo } from "react";
import { Resource, technologyCards, resources } from "@/data/(web)/resources";
import { allQuizzes, Quiz } from "@/data/(web)/resources/quizzes";

interface SubFilter {
  category: string;
  searchTerm: string;
}

interface SubFilterOption {
  value: string;
  label: string;
  count: number;
}

export function useResourceFilters(activeFilter: string) {
  const [subFilter, setSubFilter] = useState<SubFilter>({
    category: 'all',
    searchTerm: ''
  });

  // Reset subfilters when main filter changes
  useEffect(() => {
    setSubFilter({ category: 'all', searchTerm: '' });
  }, [activeFilter]);

  // Generate subfilter options based on active filter
  const subFilterOptions = useMemo((): SubFilterOption[] => {
    const options: SubFilterOption[] = [{ value: 'all', label: 'All Categories', count: 0 }];

    const resourceList = activeFilter === "All"
      ? resources
      : resources.filter(r => r.type === activeFilter ||
          (activeFilter === "Blog Posts" && r.type === "Blog Post"));

    let categories: string[] = [];

    switch (activeFilter) {
      case "Blog Posts":
        const blogCategories = new Set<string>();
        resourceList.forEach(resource => {
          resource.tags?.forEach(tag => {
            const tagLower = tag.toLowerCase();
            if (['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural', 'deep learning', 'llm', 'gpt', 'ai model', 'claude', 'chatgpt', 'gemini', 'grok'].some(term => tagLower.includes(term))) {
              blogCategories.add('AI & Machine Learning');
            }
            if (['business', 'strategy', 'productivity', 'efficiency', 'roi', 'success', 'metric', 'value', 'transformation'].some(term => tagLower.includes(term))) {
              blogCategories.add('Business Strategy');
            }
            if (['tutorial', 'how-to', 'guide', 'implementation', 'setup', 'getting started', 'beginner', 'step'].some(term => tagLower.includes(term))) {
              blogCategories.add('Tutorials & Guides');
            }
            if (['industry', 'trends', 'news', 'updates', 'market', 'forecast', '2025', 'future', 'analysis'].some(term => tagLower.includes(term))) {
              blogCategories.add('Industry Insights');
            }
            if (['technology', 'tools', 'software', 'platform', 'framework', 'development', 'comparison', 'chatgpt', 'claude', 'grok'].some(term => tagLower.includes(term))) {
              blogCategories.add('Technology & Tools');
            }
            if (['automation', 'workflow', 'process', 'optimization', 'efficiency', 'roi'].some(term => tagLower.includes(term))) {
              blogCategories.add('Process Automation');
            }
          });
        });
        categories = Array.from(blogCategories).sort();
        break;

      case "Tools & Tech":
        const techCategories = new Set<string>();
        technologyCards.forEach(card => {
          card.tags?.forEach(tag => {
            const tagLower = tag.toLowerCase();
            if (['gpt-4', 'claude', 'gemini', 'grok', 'deepseek', 'nemotron', 'perplexity', 'ai assistant', 'llm'].some(term => tagLower.includes(term))) {
              techCategories.add('LLMs & AI Models');
            } else if (['python', 'typescript', 'rust', 'javascript', 'programming'].some(term => tagLower.includes(term))) {
              techCategories.add('Programming Languages');
            } else if (['tensorflow', 'langchain', 'fastapi', 'multi-agent', 'langgraph', 'computer vision', 'machine learning', 'ai development'].some(term => tagLower.includes(term))) {
              techCategories.add('AI/ML Frameworks');
            } else if (['docker', 'kubernetes', 'redis', 'supabase', 'node.js', 'vector database', 'drizzle', 'websocket', 'infrastructure', 'devops'].some(term => tagLower.includes(term))) {
              techCategories.add('Infrastructure & DevOps');
            } else if (['n8n', 'atlassian', 'openrouter', 'tailwind', 'recharts', 'development', 'tools'].some(term => tagLower.includes(term))) {
              techCategories.add('Development Tools');
            } else if (['f5', 'red hat', 'vmware', 'graph rag', 'knowledge graph', 'mcp', 'enterprise'].some(term => tagLower.includes(term))) {
              techCategories.add('Enterprise Solutions');
            }
          });
        });
        categories = Array.from(techCategories).sort();
        break;

      case "Quizzes":
        categories = Array.from(new Set(allQuizzes.map(quiz => quiz.difficulty))).sort();
        break;

      default:
        return options;
    }

    // Add category options with counts
    categories.forEach(category => {
      options.push({
        value: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
        label: category,
        count: 0 // Could calculate if needed
      });
    });

    return options;
  }, [activeFilter]);

  // Apply filters to resources
  const filteredResources = useMemo(() => {
    let filtered: Resource[] | Quiz[] = [];

    // Filter by main category
    if (activeFilter === "All") {
      filtered = resources;
    } else if (activeFilter === "Blog Posts") {
      filtered = resources.filter(r => r.type === "Blog Post");
    } else if (activeFilter === "Tools & Tech") {
      filtered = technologyCards;
    } else if (activeFilter === "Quizzes") {
      filtered = allQuizzes as unknown as Resource[];
    } else {
      filtered = resources.filter(r => r.type === activeFilter);
    }

    // Apply sub-category filter
    if (subFilter.category !== 'all' && activeFilter !== "All") {
      filtered = filtered.filter(item => {
        const tags = (item as Resource).tags || [];
        const categoryLower = subFilter.category;

        if (activeFilter === "Tools & Tech") {
          // Tech card filtering logic
          return matchesTechCategory(tags, categoryLower);
        } else if (activeFilter === "Quizzes") {
          const quiz = item as unknown as Quiz;
          return quiz.difficulty.toLowerCase().replace(/\s+/g, '-') === categoryLower;
        } else {
          return matchesBlogCategory(tags, categoryLower);
        }
      });
    }

    // Apply search filter
    if (subFilter.searchTerm.trim()) {
      const searchTerm = subFilter.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const title = (item as Resource).title?.toLowerCase() || '';
        const description = ((item as Resource).description || (item as unknown as Quiz).description)?.toLowerCase() || '';
        const tags = (item as Resource).tags || [];

        return title.includes(searchTerm) ||
               description.includes(searchTerm) ||
               tags.some(tag => tag.toLowerCase().includes(searchTerm));
      });
    }

    return filtered as Resource[];
  }, [activeFilter, subFilter]);

  return {
    subFilter,
    setSubFilter,
    subFilterOptions,
    filteredResources
  };
}

// Helper functions
function matchesTechCategory(tags: string[], category: string): boolean {
  const tagLower = tags.map(t => t.toLowerCase());

  switch (category) {
    case 'llms-and-ai-models':
      return tagLower.some(t => ['gpt-4', 'claude', 'gemini', 'grok', 'deepseek', 'llm'].some(term => t.includes(term)));
    case 'programming-languages':
      return tagLower.some(t => ['python', 'typescript', 'rust', 'javascript'].some(term => t.includes(term)));
    case 'ai-ml-frameworks':
    case 'aiml-frameworks':
      return tagLower.some(t => ['tensorflow', 'langchain', 'fastapi', 'machine learning'].some(term => t.includes(term)));
    case 'infrastructure-and-devops':
      return tagLower.some(t => ['docker', 'kubernetes', 'redis', 'supabase'].some(term => t.includes(term)));
    case 'development-tools':
      return tagLower.some(t => ['n8n', 'atlassian', 'tailwind', 'tools'].some(term => t.includes(term)));
    case 'enterprise-solutions':
      return tagLower.some(t => ['f5', 'red hat', 'vmware', 'enterprise'].some(term => t.includes(term)));
    default:
      return false;
  }
}

function matchesBlogCategory(tags: string[], category: string): boolean {
  const tagLower = tags.map(t => t.toLowerCase());

  switch (category) {
    case 'ai-and-machine-learning':
      return tagLower.some(t => ['ai', 'machine learning', 'neural', 'llm'].some(term => t.includes(term)));
    case 'business-strategy':
      return tagLower.some(t => ['business', 'strategy', 'productivity', 'roi'].some(term => t.includes(term)));
    case 'tutorials-and-guides':
      return tagLower.some(t => ['tutorial', 'guide', 'how-to', 'implementation'].some(term => t.includes(term)));
    case 'industry-insights':
      return tagLower.some(t => ['industry', 'trends', 'news', 'market'].some(term => t.includes(term)));
    case 'technology-and-tools':
      return tagLower.some(t => ['technology', 'tools', 'software', 'platform'].some(term => t.includes(term)));
    case 'process-automation':
      return tagLower.some(t => ['automation', 'workflow', 'process', 'optimization'].some(term => t.includes(term)));
    default:
      return false;
  }
}
