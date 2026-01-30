---
type: case-study
title: User Onboarding
slug: onboarding
url: /case-studies/onboarding
---

# Case Study — User Onboarding

## Context
For a bakery management SaaS, users need to sign up and subscribe quickly. Drop-off happens when the flow is slow or confusing.

## Problem
Users were at risk of abandoning signup if:
- the flow had too much friction,
- steps felt redundant or unclear,
- security and ease of use were not balanced.

## Approach
The goal was simple: give users the ability to sign up and subscribe as quickly and smoothly as possible — before they drop off. The focus was on reducing friction and making every step feel intuitive and necessary.

I started with brainstorming (paper, pen, and brain), then moved to specification: mapping entry points, fields, and backend logic with security and ease of use at the core.

## What I shipped
- A validated, API-integrated signup form.
- Integration with key libraries and AWS services (AWS Cognito, Google login).
- Coordinated delivery with the front-end developer via daily check-ins and Asana tracking.
- A full video walkthrough of the flow for demos.

## Tech & tools
Paper and pen (brainstorming); Miro, Google docs, Swagger (spec); AWS Cognito, Google login, React + Next, Python (development); iMovie (demo).

## Results / Impact
- A working signup and subscription flow that reduces friction.
- Early iterations brought valuable learnings (see below).

## Architectural decisions & learnings
- **Unified Signup Flow:** Initially I considered handling signup on the website. That led to redundant logic and increased maintenance. I unified the flow entirely within the app for simplicity and scalability.
- **Smarter Indexing:** A key challenge was when to create the user's index in the database. I now trigger index creation only after a successful payment, preventing pollution of the database with incomplete signups.
- **Improved Social Login:** I separated Google login from Cognito, since Cognito's social login lacks an account selection screen, which confused users.
- **Stripe Checkout Evolution:** Currently using Stripe's hosted checkout; the goal is to move to a fully integrated experience with the Stripe API for better control and branding.
- **Beta Learnings:** This beta version already provides critical user feedback to refine the onboarding experience further.

## What I'd do differently
- Formalize test coverage earlier (unit, integration, E2E) instead of relying mainly on manual validation across environments and devices.
