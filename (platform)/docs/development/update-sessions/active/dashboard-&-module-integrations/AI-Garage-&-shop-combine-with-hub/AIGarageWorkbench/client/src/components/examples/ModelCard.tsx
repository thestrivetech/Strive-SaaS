import { ModelCard } from "../ModelCard";
import { useState } from "react";

export default function ModelCardExample() {
  const [selected, setSelected] = useState("gpt-4");

  const models = [
    { id: "gpt-4", name: "GPT-4 Turbo", provider: "OpenAI", speed: 85, accuracy: 95 },
    { id: "claude", name: "Claude 3 Opus", provider: "Anthropic", speed: 90, accuracy: 98 },
    { id: "gemini", name: "Gemini Pro", provider: "Google", speed: 92, accuracy: 93 },
    { id: "groq", name: "Llama 3 70B", provider: "Groq", speed: 98, accuracy: 88 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8 bg-background">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          name={model.name}
          provider={model.provider}
          speed={model.speed}
          accuracy={model.accuracy}
          selected={selected === model.id}
          onClick={() => {
            setSelected(model.id);
            console.log(`Selected model: ${model.name}`);
          }}
        />
      ))}
    </div>
  );
}
