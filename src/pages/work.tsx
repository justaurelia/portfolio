"use client";
import { useState } from "react";
import demoVideo from "/public/onboarding/demo.mp4"; // Example demo video
import { BrainCircuit, FileText, Hammer, FlaskConical, Film, Settings2 } from "lucide-react";

const icons = {
  Brain: <BrainCircuit className="w-5 h-5 text-primary" />,
  File: <FileText className="w-5 h-5 text-primary" />,
  Dev: <Hammer className="w-5 h-5 text-primary" />,
  Test: <FlaskConical className="w-5 h-5 text-primary" />,
  Demo: <Film className="w-5 h-5 text-primary" />,
  Settings: <Settings2 className="w-5 h-5 text-primary" />,
};

const features = [
  {
    id: "onboarding",
    label: "User Onboarding",
    stages: [
      {
        id: 1,
        title: "Brainstorming",
        content: "For this feature, the goal was simple: give users the ability to sign up and subscribe as quickly and smoothly as possible — before they drop off. The focus was on reducing friction, making every step feel intuitive and necessary.",
        tools: "paper, pen and brain !",
        icon: "Brain",
        size: "sm",
        asset: "/onboarding/brain.jpg"
      },
      {
        id: 2,
        title: "Specification",
        content: "Mapped out entry points, fields, and backend logic — with security and ease of use at the core.",
        icon: "File",
        tools: "Miro, Google docs, Swagger",
        asset: "/onboarding/flow.jpg",
      },
      {
        id: 3,
        title: "Development",
        content: "Developed a validated, API-integrated form leveraging key libraries and AWS services — while coordinating closely with the front-end developer through daily check-ins and Asana tracking.",
        icon: "Dev",
        tools: "AWS cognito, Google login, React + next, python",
        asset: "/onboarding/asana.png",
      },
      {
        id: 4,
        title: "Testing",
        content: "At this stage, testing is mostly manual — I validate user flows directly in different environments and devices. As I grow, formalizing test coverage with unit, integration, and E2E tests is a priority.",
        icon: "Test",
      },
      {
        id: 5,
        title: "Demo",
        content: "Created a full video walkthrough of the flow.",
        icon: "Demo",
        tools: "iMovie",
        video: demoVideo,
      },
      {
        id: 6,
        title: "Architectural decisions & next steps",
        icon: "Settings",
        tools: "",
        //asset: "/images/asana-task-board.png",
      },
    ],
  },
  // More features can be added here
];

export default function Work() {
  const [activeTab, setActiveTab] = useState("onboarding");

  const activeFeature = features.find((f) => f.id === activeTab);

  return (
    <div className="p-10 space-y-10">
      <div className="flex gap-6 border-b pb-2">
        {features.map((feature) => (
          <button
            key={feature.id}
            className={`pb-1 ${activeTab === feature.id
              ? "text-primary border-b-2 border-primary font-semibold"
              : "text-gray-500"
              }`}
            onClick={() => setActiveTab(feature.id)}
          >
            {feature.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {activeFeature?.stages.map((stage, i) => (
          <div
            key={i}
            className="bg-white/80 border border-border rounded-2xl shadow-md p-6 space-y-4 max-w-4xl w-full mx-auto"
          >
            <div className="flex items-center gap-2">
              {icons[stage.icon as keyof typeof icons]}
              <h3 className="text-xl font-bold">{stage.title}</h3>
            </div>

            {/* Content */}
            {stage.id === 6 ? (
              <div className="space-y-4 text-gray-700">
                <p><strong>Early iterations brought valuable learnings.</strong></p>

                <p><span className="font-semibold">• Unified Signup Flow:</span> Initially, I considered handling signup on the website. However, this led to redundant logic and increased maintenance overhead. I decided to unify the flow entirely within the app for simplicity and scalability.</p>

                <p><span className="font-semibold">• Smarter Indexing:</span> A key challenge was deciding when to create the user’s index in the database. I now trigger index creation only after a successful payment, preventing pollution of the database with incomplete signups.</p>

                <p><span className="font-semibold">• Improved Social Login Experience:</span> I separated Google login from Cognito, since Cognito’s social login lacks an account selection screen, which confused users.</p>

                <p><span className="font-semibold">• Stripe Checkout Evolution:</span> Currently using Stripe’s hosted checkout, but the goal is to transition to a fully integrated experience using the Stripe API for better control and branding.</p>

                <p><span className="font-semibold">• Beta Learnings:</span> This beta version already provides critical user feedback to refine the onboarding experience further.</p>
              </div>
            ) : (
              <p className="text-gray-700">{stage.content}</p>
            )}

            {/* Optional tools used */}
            {stage.tools && (
              <div className="text-sm text-gray-500 italic">
                <span className="font-semibold text-gray-600">Tools:</span> {stage.tools}
              </div>
            )}

            {/* Image */}
            {stage.asset && (
              <img
                src={stage.asset}
                alt={stage.title}
                className={`rounded-xl mx-auto ${stage.size === "sm"
                  ? "max-w-xs"
                  : stage.size === "md"
                    ? "max-w-md"
                    : stage.size === "lg"
                      ? "max-w-2xl"
                      : "max-w-full"
                  }`}
              />
            )}

            {/* Video */}
            {stage.video && (
              <video
                controls
                className="rounded-xl max-w-full mx-auto"
              >
                <source src={stage.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

        ))}
      </div>
    </div>
  );
}
