---
type: case-study
title: Recipe Scanning
slug: scan
url: /case-studies/scan
---

# Case Study — Scan Product

## Context
Bakers and pastry chefs often work from physical recipe cards, books, or product sheets. Manually typing recipes and products into a platform is slow and error-prone.

## Problem
Product and recipe creation was a bottleneck:
- manual data entry was tedious,
- complex products with sub-recipes were hard to model,
- multiple recipes on one document required repetitive work.

## Approach
The goal was to accelerate Products (& Recipes) creation by allowing bakers to scan physical recipe cards, books, or product sheets directly into the platform.

I mapped OCR workflows, AI extraction schemas, and user selection flows — handling single recipes, multiple recipes, and complex products with sub-recipes in one coherent flow.

## What I shipped
- Intelligent image processing with OpenAI vision models.
- Smart content detection to identify recipes vs. products.
- Structured data extraction into the platform’s interface.
- Separate pipelines for recipes and products while keeping a unified user experience.
- A video walkthrough showing scan-to-recipe flow, multiple recipe detection, and product extraction with sub-recipes.

## Tech & tools
Paper and pen (brainstorming); Miro, Google docs, OpenAI API docs (spec); OpenAI GPT-4o-mini API, React (development); iMovie (demo).

## Results / Impact
- Bakers can scan physical sources and get structured data in the platform.
- Testing covered various recipe formats, handwritten notes, printed cards, and product sheets across different lighting and image quality to ensure reliable extraction.

## Architectural decisions & learnings
- **Textract vs. OpenAI:** I considered AWS Textract but it did not handle multi-column documents well. I chose a full OpenAI-based solution instead.
- **OpenAI:** I used vision models, smart content detection, and structured data extraction — creating separate pipelines for recipes vs. products. “Everything is in your prompts.”
- **Smart scan:** Smart content detection identifies recipes and products; structured extraction then pulls the data into the interface.
- **Next step — Web search:** I am considering letting users search for a product or recipe on the web and import it directly into the platform.

## What I'd do differently
- Continue to expand test coverage for edge cases (format, language, layout) as more users adopt the feature.
