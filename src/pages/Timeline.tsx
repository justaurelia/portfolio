"use client";

import { BriefcaseIcon, AcademicCapIcon, SparklesIcon, BuildingOffice2Icon, BuildingStorefrontIcon, ChartBarIcon, CommandLineIcon, LightBulbIcon, UserGroupIcon, StarIcon } from "@heroicons/react/24/solid";
import { motion } from "motion/react"

type TimelineItem = {
  year: string;
  title: string;
  description: string;
  learned: string;
  icon: string;
  color: string;
  colorIcon: string;
};

const timeline: TimelineItem[] = [
  {
    year: "2025 (Goal)",
    title: "Launching PastelarAI",
    description: "Aiming for production and bringing my AI-powered bakery management platform to life.",
    learned: "Planning and scaling a SaaS product for production.",
    icon: "product",
    color: "bg-sky-400",
    colorIcon: "text-sky-400",
  },
  {
    year: "2024",
    title: "Building PastelarAI",
    description: "Hired frontend developer and fully focused on developing and shaping PastelarAI.",
    learned: "Managing remote teams and refining product vision.",
    icon: "dev",
    color: "bg-teal-400",
    colorIcon: "text-teal-400",
  },
  {
    year: "2023",
    title: "From bakery to SaaS",
    description: "Resold my bakery business to fully dedicate to PastelarAI and started intensive AI and cloud training.",
    learned: "Pivoting to tech requires resilience and fast learning.",
    icon: "idea",
    color: "bg-amber-400",
    colorIcon: "text-amber-400",
  },
  {
    year: "2021",
    title: "Pastry Business in US",
    description: "Moved to the US, launched online pastry shop, and established exclusive partnership with coffee shop.",
    learned: "Entrepreneurship and scaling production with a team.",
    icon: "bakery",
    color: "bg-rose-400",
    colorIcon: "text-rose-400",
  },
  {
    year: "2020",
    title: "Certified Pastry Chef",
    description: "Earned French Certificate of Pastry while exploring entrepreneurship.",
    learned: "Commitment to mastering a new craft.",
    icon: "cert",
    color: "bg-violet-400",
    colorIcon: "text-violet-400",
  },
  {
    year: "2019",
    title: "Pre-sales world",
    description: "Explored pre-sales department, blending technical and business skills.",
    learned: "Communicating technical ideas to business stakeholders.",
    icon: "business",
    color: "bg-emerald-400",
    colorIcon: "text-emerald-400",
  },
  {
    year: "2014",
    title: "New product",
    description: "Joined Axway to work on a startup-style product in a large organization.",
    learned: "Building from scratch and adapting in dynamic environments.",
    icon: "analytics",
    color: "bg-indigo-400",
    colorIcon: "text-indigo-400",
  },
  {
    year: "2012",
    title: "Product Analyst",
    description: "Full year collaborating as a business analyst with off-shore team.",
    learned: "Cross-functional collaboration and analysis.",
    icon: "collab",
    color: "bg-cyan-400",
    colorIcon: "text-cyan-400",
  },
  {
    year: "2008",
    title: "Customer service",
    description: "First job at Sopra Banking Software on payment engine and customer service projects.",
    learned: "Foundations of software engineering and customer empathy.",
    icon: "office",
    color: "bg-fuchsia-400",
    colorIcon: "text-fuchsia-400",
  },
];

function getIcon(type: TimelineItem["icon"], colorIcon: string) {
  switch (type) {
    case "bakery":
      return <BuildingStorefrontIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "cert":
      return <AcademicCapIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "product":
      return <SparklesIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "business":
      return <BriefcaseIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "analytics":
      return <ChartBarIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "office":
      return <BuildingOffice2Icon className={`w-12 h-12 ${colorIcon}`} />;
    case "collab":
      return <UserGroupIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "idea":
      return <LightBulbIcon className={`w-12 h-12 ${colorIcon}`} />;
    case "dev":
      return <CommandLineIcon className={`w-12 h-12 ${colorIcon}`} />;
    default:
      return null;
  }
}

export default function HorizontalTimeline() {
  return (
    <div className="flex h-full w-fit justify-start items-center border-none px-10"  >
      <motion.div
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex"
      >
        <div className="w-4 h-4 rounded-full border-2" />
        <div className="grid grid-rows-2">
          <div className="w-2 border-b-2" />
          <div />
        </div>
      </motion.div>
      {timeline.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, translateY: 20 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="grid grid-rows-2 items-center justify-center w-50"
        >
          {index % 2 === 0 ? (
            <>
              <div className="flex flex-col h-full w-full text-center gap-2 border-b-2">
                <p className="flex flex-1 text-gray-600 text-sm">{item.description}</p>
                <div className="flex items-start text-xs text-primary italic">
                  <div className="h-4 w-4 flex justify-center items-center">
                    <StarIcon className="w-3 h-3" />
                  </div>
                  <span>
                    <span className="font-semibold not-italic">Insight:</span> Managing remote teams and refining product vision.
                  </span>
                </div>
                <h3 className="flex w-full justify-center text-lg font-bold">{item.year}</h3>
                <div className={`flex w-full ${item.color} justify-center items-center h-10 rounded-t-full text-sm font-semibold text-white`}>{item.title}</div>
              </div>
              <div className="flex h-full w-full justify-center items-center">
                {getIcon(item.icon, item.colorIcon)}
              </div>
            </>
          ) : (
            <>
              <div className="flex h-full w-full justify-center items-center border-b-2">
                {getIcon(item.icon, item.colorIcon)}
              </div>
              <div className="flex flex-col h-full w-full text-center gap-2">
                <div className={`flex w-full ${item.color} justify-center items-center h-10 rounded-b-full text-sm font-semibold text-white`}>{item.title}</div>
                <h3 className="text-lg font-bold">{item.year}</h3>
                <p className="flex-1 text-gray-600 text-sm">{item.description}</p>
                <div className="flex items-start text-xs text-primary italic">
                  <div className="h-4 w-4 flex justify-center items-center">
                    <StarIcon className="w-3 h-3" />
                  </div>
                  <span>
                    <span className="font-semibold not-italic">Insight:</span> Managing remote teams and refining product vision.
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, translateY: 20 }}
        whileInView={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.5, delay: timeline.length * 0.1 }}
        viewport={{ once: true }}
        className="flex"
      >
        <div className="grid grid-rows-2">
          <div className="w-2 border-b-2" />
          <div />
        </div>
        <div className="top-1/2 w-4 h-4 rounded-full border-2"></div>
      </motion.div>
    </div>
  );
}