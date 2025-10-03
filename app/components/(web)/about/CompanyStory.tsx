"use client";

import { Button } from "@/components/(shared)/ui/button";

export function CompanyStory() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div>
        <div
          className="text-sm uppercase tracking-wide text-primary font-semibold mb-4"
          data-testid="text-story-label"
        >
          OUR JOURNEY
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold mb-6 text-[#020a1c]"
          data-testid="text-story-title"
        >
          A Story of Friendship and Innovation
        </h2>
        <div className="space-y-4 md:space-y-6 text-muted-foreground">
          <p data-testid="text-story-paragraph-1" className="text-base md:text-lg leading-relaxed">
            STRIVE TECH wasn't born in a boardroom or pitched to venture capitalists. It started where the best partnerships do: among friends who've shared victories, defeats, and countless hours perfecting their craft together.
          </p>
          <p data-testid="text-story-paragraph-2" className="text-base md:text-lg leading-relaxed">
            Our story begins with six friends who grew up pushing boundaries. We traveled the world competing in professional esports tournaments together. In that process, we learned something invaluable: the difference between good and great isn't just skill, it's trust, communication, and knowing your team inside and out. Those late-night strategy sessions and split-second coordinated plays taught us that when you truly sync with your teammates, you can achieve the impossible.
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-[#020a1c] mt-6 md:mt-8 mb-3 md:mb-4">The Convergence</h3>
          <p data-testid="text-story-paragraph-3" className="text-base md:text-lg leading-relaxed">
            As we evolved from competitive gaming into our respective tech careers, each of us developed deep expertise in different corners of the technology landscape. Garrett brought us together with a vision: combine our diverse technical backgrounds to build AI solutions that solve real-world problems. Not just impressive tech demos, but practical applications that transform how businesses operate.
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-[#020a1c] mt-6 md:mt-8 mb-3 md:mb-4">Why This Matters to You</h3>
          <p data-testid="text-story-paragraph-4" className="text-base md:text-lg leading-relaxed">
            When you work with STRIVE TECH, you're not hiring a vendor. You're partnering with a team that's been pressure-tested in environments where milliseconds matter and trust is everything. We approach your challenges the way we approached competition: with complete dedication, strategic thinking, and seamless execution.
          </p>
          <p data-testid="text-story-paragraph-5" className="text-base md:text-lg leading-relaxed">
            Our gaming background isn't just unconventional; it's our secret weapon. We've spent years optimizing performance, identifying patterns, and making rapid decisions based on incomplete information. Skills that translate directly into building intelligent systems that work in the real world.
          </p>
          <p data-testid="text-story-paragraph-6" className="text-base md:text-lg leading-relaxed">
            Today, we're channeling that same competitive drive and team synergy into helping businesses harness the power of AI. We're growing fast, not because we're chasing growth, but because our clients keep telling their peers about the team that actually delivers. On time. On spec. Beyond expectations.
          </p>

          <h3 className="text-lg md:text-xl font-semibold text-[#020a1c] mt-6 md:mt-8 mb-3 md:mb-4">Moving Forward Together</h3>
          <p data-testid="text-story-paragraph-7" className="text-base md:text-lg leading-relaxed">
            We believe the best technology comes from teams who genuinely enjoy working together, who challenge each other to be better, and who never settle for "good enough." That's who we are at STRIVE TECH. Six friends who became co-founders, teammates who became innovative partners, and most importantly, a team that's ready to help you win.
          </p>
          <div className="mt-4 md:mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p data-testid="text-story-paragraph-8" className="text-base md:text-lg leading-relaxed italic font-medium text-primary">
              Ready to see what a truly synchronized team can do for your business? Let's connect and explore how STRIVE TECH can turn your AI ambitions into reality.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            size="lg"
            onClick={() => window.location.href = "/contact"}
            data-testid="button-learn-more"
          >
            Partner With Us
          </Button>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl rotate-3"></div>
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
          alt="Professional business team in modern corporate office"
          className="rounded-2xl w-full h-full object-cover relative z-10 shadow-2xl"
          data-testid="img-company-story"
        />
      </div>
    </div>
  );
}
