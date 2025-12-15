# Landing Page

This directory contains the source code for the "Own Your Secrets" landing page.

## Structure

- `index.html`: The main entry point. It uses Tailwind CSS via CDN for styling.

## Deployment

The landing page is deployed to GitHub Pages automatically via a GitHub Action workflow defined in `.github/workflows/deploy-landing.yml`.

The workflow uploads the contents of this directory (`apps/landing`) to GitHub Pages.

## Development

To develop locally, simply open `index.html` in your browser. Since it uses Tailwind via CDN, no build step is required.
