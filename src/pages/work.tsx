"use client";
import { useState, useEffect } from "react";
import demoVideo1 from "/public/onboarding/demo.mp4"; // Example demo video
//import demoVideo2 from "/public/scan/demo.mp4"; // Example demo video
import { BrainCircuit, FileText, Hammer, FlaskConical, Film, Settings2, Github, ExternalLink, Copy, Check, ListChecks } from "lucide-react";

const icons = {
  Brain: <BrainCircuit className="w-5 h-5 text-primary" />,
  File: <FileText className="w-5 h-5 text-primary" />,
  Dev: <Hammer className="w-5 h-5 text-primary" />,
  Test: <FlaskConical className="w-5 h-5 text-primary" />,
  Demo: <Film className="w-5 h-5 text-primary" />,
  Settings: <Settings2 className="w-5 h-5 text-primary" />,
  Steps: <ListChecks className="w-5 h-5 text-primary" />,
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
        video: demoVideo1,
      },
      {
        id: 6,
        title: "Architectural decisions & next steps",
        icon: "Settings",
        tools: "",
        //asset: "/images/asana-task-board.png",
      },
    ],
  }, {
    id: "scan",
    label: "Scan Product",
    stages: [
      {
        id: 1,
        title: "Brainstorming",
        content: "For this feature, the goal is to accelerate Products (& Recipes) creation by allowing bakers to scan physical recipe cards, books, or product sheets directly into the platform.",
        tools: "paper, pen and brain!",
        icon: "Brain",
        size: "md",
        asset: "/scan/brain.jpg"
      },
      {
        id: 2,
        title: "Specification",
        content: "Mapped out OCR workflows, AI extraction schemas, and user selection flows — handling single recipes, multiple recipes, and complex products with sub-recipes seamlessly.",
        icon: "File",
        tools: "Miro, Google docs, OpenAI API docs",
        asset: "/scan/flow.jpg",
      },
      {
        id: 3,
        title: "Development",
        content: "Built intelligent image processing with OpenAI vision models, smart content detection, and structured data extraction — creating separate pipelines for recipes vs. products while maintaining a unified user experience.",
        icon: "Dev",
        tools: "OpenAI GPT-4o-mini API, React",
        asset: "/scan/snapcode.png",
      },
      {
        id: 4,
        title: "Testing",
        content: "Testing involves scanning various recipe formats, handwritten notes, printed cards, and product sheets across different lighting conditions and image qualities to ensure reliable extraction accuracy.",
        icon: "Test",
      },
      {
        id: 5,
        title: "Demo",
        content: "Created a full video walkthrough showing the scan-to-recipe flow, multiple recipe detection, and product extraction with sub-recipes.",
        icon: "Demo",
        tools: "iMovie",
        // video: demoVideo2,
      },
      {
        id: 6,
        title: "Architectural decisions & next steps",
        icon: "Settings",
        tools: "",
      },
    ]
  }, {
    id: "supabase",
    label: "Supabase Email Customisation",
    stages: [
      {
        id: 1,
        title: "Introduction",
        content: "In this demo, I show how to take the default Supabase confirmation email and turn it into a branded, production-ready HTML template. This improves onboarding and creates a more polished developer experience.",
        icon: "File",
      },
      {
        id: 2,
        title: "Demo",
        content: "Video walkthrough showing the email customization process and the final result.",
        icon: "Demo",
        tools: "iMovie",
        video: "/supabase-email/Supabase Demo.mp4",
        poster: "/supabase-email/supabaseDemoThumbnail.png",
        github: "https://github.com/justaurelia/supabase_demo",
      },
      {
        id: 3,
        title: "Key Steps",
        content: "steps",
        icon: "Steps",
      },
      {
        id: 4,
        title: "Before",
        content: "The default Supabase confirmation email template.",
        icon: "File",
        asset: "/supabase-email/before.png",
        size: "lg",
      },
      {
        id: 5,
        title: "After",
        content: "The customized branded email template with improved visual design.",
        icon: "File",
        asset: "/supabase-email/after.png",
        size: "lg",
      },
    ]
  }
  // More features can be added here
];

export default function Work() {
  const [activeTab, setActiveTab] = useState("onboarding");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const activeFeature = features.find((f) => f.id === activeTab);

  // Handle hash-based navigation
  useEffect(() => {
    // Read hash from URL on mount
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash) {
      // Check if hash matches any feature ID
      const matchingFeature = features.find((f) => f.id === hash);
      if (matchingFeature) {
        setActiveTab(matchingFeature.id);
      }
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash) {
        const matchingFeature = features.find((f) => f.id === newHash);
        if (matchingFeature) {
          setActiveTab(matchingFeature.id);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  const copyToClipboard = async (text: string, stageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(`${activeTab}-${stageId}`);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
            onClick={() => handleTabChange(feature.id)}
          >
            {feature.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {activeFeature?.stages.map((stage, i) => {
          // Skip After stage if we're in supabase tab - it will be rendered with Before
          if (activeTab === "supabase" && stage.id === 5) {
            return null;
          }

          // Extract asset path and size for rendering
          let assetPath: string | null = null;
          if ('asset' in stage && stage.asset && typeof stage.asset === 'string') {
            assetPath = stage.asset;
          }
          const sizeValue = 'size' in stage && typeof stage.size === 'string' ? stage.size : 'full';
          const sizeClass = sizeValue === "sm" ? "max-w-xs"
            : sizeValue === "md" ? "max-w-md"
              : sizeValue === "lg" ? "max-w-2xl"
                : "max-w-full";

          // Find After stage for side-by-side display
          const afterStage = activeTab === "supabase" && stage.id === 4
            ? activeFeature?.stages.find(s => s.id === 5)
            : null;



          return (
            <div
              key={i}
              className="bg-white/80 border border-border rounded-2xl shadow-md p-6 space-y-4 max-w-4xl w-full mx-auto"
            >
              {/* Only show title if not Before/After side-by-side */}
              {!(activeTab === "supabase" && stage.id === 4 && afterStage) && (
                <div className="flex items-center gap-2">
                  {icons[stage.icon as keyof typeof icons]}
                  <h3 className="text-xl font-bold">{stage.title}</h3>
                </div>
              )}

              {/* Combined Before/After title */}
              {activeTab === "supabase" && stage.id === 4 && afterStage && (
                <div className="flex items-center gap-2">
                  {icons[stage.icon as keyof typeof icons]}
                  <h3 className="text-xl font-bold">Before & After</h3>
                </div>
              )}

              {/* Content */}
              {(stage.id === 3 && activeTab === "supabase" && stage.content === "steps") ? (
                <div className="space-y-6 text-gray-700">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">1.</span>
                        <div>
                          <p className="font-semibold">Create the Signup Page <span className="text-sm font-normal text-gray-500">(0:01)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Create a simple signup page with an email input, password input, and a button to start the signup process.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">2.</span>
                        <div>
                          <p className="font-semibold">Register a New User <span className="text-sm font-normal text-gray-500">(0:13)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Enter an email and password in the appropriate fields and click the button to sign up.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">3.</span>
                        <div>
                          <p className="font-semibold">Check if the Email Was Received <span className="text-sm font-normal text-gray-500">(0:36)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Check your inbox to confirm that the confirmation email has arrived.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">4.</span>
                        <div>
                          <p className="font-semibold">Access the Customization Interface <span className="text-sm font-normal text-gray-500">(0:50)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Go to the authentication section and view the users who are currently pending verification.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">5.</span>
                        <div>
                          <p className="font-semibold">Select the Email Template to Customize <span className="text-sm font-normal text-gray-500">(1:18)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Go to the email notifications section and select the email template you want to customize.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">6.</span>
                        <div>
                          <p className="font-semibold">Edit the HTML Code <span className="text-sm font-normal text-gray-500">(1:38)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Modify the HTML code to include the confirmation URL. Make sure the user can click the link successfully.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">7.</span>
                        <div>
                          <p className="font-semibold">Preview and Save <span className="text-sm font-normal text-gray-500">(1:50)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Preview the email to ensure it matches your expectations and save your changes.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary">8.</span>
                        <div>
                          <p className="font-semibold">Test With a New User <span className="text-sm font-normal text-gray-500">(2:01)</span></p>
                          <p className="text-sm text-gray-600 mt-1">Sign up a new user to test the flow. Check that the confirmation email is received and correctly customized.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">Cautionary Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Make sure the confirmation URL is correct to avoid verification errors</li>
                      <li>Ensure your email template matches your brand's visual identity</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <p className="font-semibold text-gray-800 mb-2">Tips for Efficiency:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Use existing email templates to save development time</li>
                      <li>Test the template with multiple email addresses to ensure compatibility across clients</li>
                    </ul>
                  </div>
                </div>
              ) : (stage.id === 6 && activeTab === "onboarding") ? (
                <div className="space-y-4 text-gray-700">
                  <p><strong>Early iterations brought valuable learnings.</strong></p>

                  <p><span className="font-semibold">• Unified Signup Flow:</span> Initially, I considered handling signup on the website. However, this led to redundant logic and increased maintenance overhead. I decided to unify the flow entirely within the app for simplicity and scalability.</p>

                  <p><span className="font-semibold">• Smarter Indexing:</span> A key challenge was deciding when to create the user's index in the database. I now trigger index creation only after a successful payment, preventing pollution of the database with incomplete signups.</p>

                  <p><span className="font-semibold">• Improved Social Login Experience:</span> I separated Google login from Cognito, since Cognito's social login lacks an account selection screen, which confused users.</p>

                  <p><span className="font-semibold">• Stripe Checkout Evolution:</span> Currently using Stripe's hosted checkout, but the goal is to transition to a fully integrated experience using the Stripe API for better control and branding.</p>

                  <p><span className="font-semibold">• Beta Learnings:</span> This beta version already provides critical user feedback to refine the onboarding experience further.</p>
                </div>
              ) : stage.id === 6 && activeTab === "scan" ? (
                <div className="space-y-4 text-gray-700">
                  <p><strong>Early iterations brought valuable learnings.</strong></p>

                  <p><span className="font-semibold">• Textract:</span> I considered using AWS textract service but it does not manage the multiple columns document well, so I choose instead to use a full openai solution.</p>

                  <p><span className="font-semibold">• OpenAI:</span> I used OpenAI vision models, smart content detection, and structured data extraction — creating separate pipelines for recipes vs. products while maintaining a unified user experience. Everything is in your prompts</p>

                  <p><span className="font-semibold">• Smart scan:</span> I used smart content detection to identify recipes and products, and then used structured data extraction to extract the data into our interface.</p>

                  <p><span className="font-semibold">• Web search:</span> As a next feature, I am imaging searching for a product or a recipe on the web and then being able to import it directly into the platform.</p>
                </div>
              ) : !(activeTab === "supabase" && stage.id === 4 && afterStage) ? (
                <p className="text-gray-700">{stage.content}</p>
              ) : null}

              {/* Optional tools used */}
              {(() => {
                const hasTools = Boolean(stage.tools && typeof stage.tools === 'string' && stage.tools.trim().length > 0);
                if (hasTools) {
                  const toolsText = stage.tools as string;
                  return (
                    <div className="text-sm text-gray-500 italic">
                      <span className="font-semibold text-gray-600">Tools:</span> {toolsText}
                    </div>
                  );
                }
                return null;
              })() as any}

              {/* Image */}
              {(() => {
                if (activeTab === "supabase" && stage.id === 4 && afterStage && 'asset' in afterStage && afterStage.asset && typeof afterStage.asset === 'string') {
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-600 mb-2 text-center">Before</p>
                        {assetPath ? (
                          <img
                            src={assetPath}
                            alt={stage.title}
                            className={`rounded-xl mx-auto w-full ${sizeClass} flex-shrink-0`}
                          />
                        ) : null}
                        <div className="flex-grow"></div>
                        <p className="text-sm text-gray-500 mt-2 text-center">{stage.content}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-600 mb-2 text-center">After</p>
                        <img
                          src={afterStage.asset}
                          alt={afterStage.title}
                          className={`rounded-xl mx-auto w-full ${sizeClass} flex-shrink-0`}
                        />
                        <div className="flex-grow"></div>
                        <p className="text-sm text-gray-500 mt-2 text-center">{afterStage.content}</p>
                      </div>
                    </div>
                  );
                }
                if (assetPath) {
                  return (
                    <img
                      src={assetPath}
                      alt={stage.title}
                      className={`rounded-xl mx-auto ${sizeClass}`}
                    />
                  );
                }
                return null;
              })()}

              {/* Video */}
              {'video' in stage && stage.video && typeof stage.video === 'string' && (
                <div className="space-y-2">
                  <video
                    controls
                    className="rounded-xl max-w-full mx-auto"
                    poster={'poster' in stage && stage.poster && typeof stage.poster === 'string' ? stage.poster : undefined}
                  >
                    <source src={stage.video as string} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* GitHub Link */}
                  {'github' in stage && stage.github && typeof stage.github === 'string' && (
                    <a
                      href={stage.github as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline justify-center"
                    >
                      <Github className="w-5 h-5" />
                      <span>View code on GitHub</span>
                    </a>
                  )}
                </div>
              )}

              {/* GitHub Link without video */}
              {!('video' in stage && stage.video) && 'github' in stage && stage.github && typeof stage.github === 'string' && (
                <a
                  href={stage.github as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline justify-center"
                >
                  <Github className="w-5 h-5" />
                  <span>View code on GitHub</span>
                </a>
              )}

              {/* Demo Link */}
              {'demoUrl' in stage && stage.demoUrl && typeof stage.demoUrl === 'string' && (
                <div className="flex flex-col gap-3 items-center">
                  <div className="flex gap-3">
                    <a
                      href={stage.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Try Demo</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(stage.demoUrl as string, stage.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {copiedLink === `${activeTab}-${stage.id}` ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Share this link to let users try the demo directly</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
