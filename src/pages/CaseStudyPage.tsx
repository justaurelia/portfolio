"use client";
import { useParams, Navigate } from "react-router-dom";
import Work, { features } from "./work";

export default function CaseStudyPage() {
  const { name } = useParams<{ name: string }>();
  const feature = name ? features.find((f) => f.id === name) : null;

  if (!feature) {
    return <Navigate to="/404" replace />;
  }

  return <Work initialFeatureId={feature.id} singleStudy key={name} />;
}
