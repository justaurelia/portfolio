---
type: case-study
title: Supabase Email Customisation
slug: supabase
url: /case-studies/supabase
github: https://github.com/justaurelia/supabase_demo
---

# Case Study — Supabase Email Customisation

## Context
Supabase provides a default confirmation email for auth. For a polished product, that email should be branded and production-ready.

## Problem
The default Supabase confirmation email:
- looks generic and unpolished,
- does not match a product’s brand,
- can make onboarding feel less professional.

## Approach
I showed how to take the default Supabase confirmation email and turn it into a branded, production-ready HTML template. This improves onboarding and creates a more polished developer experience.

The work is documented as a demo with a video walkthrough and a clear before/after, plus step-by-step instructions and cautionary notes.

## What I did
- Customized the Supabase confirmation email template with branded HTML.
- Produced a video walkthrough of the customization process and the final result.
- Documented key steps: create signup page, register user, receive email, access customization interface, select template, edit HTML (including confirmation URL), preview and save, test with a new user.

## Tech & tools
Supabase Auth, HTML email templates, iMovie (demo). Code and demo are available on GitHub.

## Key steps (summary)
1. Create the signup page (email, password, signup button).
2. Register a new user and trigger the confirmation flow.
3. Confirm the confirmation email is received.
4. Access the Supabase auth customization interface and pending users.
5. Select the email template to customize (e.g. confirmation).
6. Edit the HTML code and ensure the confirmation URL is correct and clickable.
7. Preview and save the template.
8. Test with a new user to verify the customized email is received and looks correct.

## Cautionary notes
- Make sure the confirmation URL is correct to avoid verification errors.
- Ensure the email template matches your brand’s visual identity.

## Tips for efficiency
- Use existing email templates to save development time.
- Test the template with multiple email addresses to ensure compatibility across clients.

## Results / Impact
- A clear, repeatable path from default Supabase email to a branded, production-ready template.
- Improved onboarding and a more professional developer experience.
