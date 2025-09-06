---
slug: docusaurus-cloudflare-web-analytics
title: "Docusaurus: Integration with Cloudflare Web Analytics"
authors: [egrosdou01]
date: 2025-09-11
description: A step-by-step guide integrating Docusaurus with Cloudflare Web Analytics.
tags: [open-source,docusaurus,cloudflare,beginner-guide,"2025"]
---

**Summary**:

This is a step-by-step guide outlining the process of integrating Docusaurus with Cloudflare Analytics.
<!--truncate-->

## Scenario

When I decided to move my blog to a self-managed instance, I did not fully consider how I would keep track of website traffic stats, SEO scores, and all those nitty-gritty details that blog hosting platforms usually provide right out of the box. This post is the first in a two or maybe three-part part series focused on analytics, SEO, and the improvements I have made over the past few weeks to make the site more efficient.

Previously, I used Medium to publish articles and loved being able to see stats on post views and reads. After some thought, I realised I needed a way to gain similar insights on my setup. Since I use [Cloudflare](https://www.cloudflare.com/en-gb/) to host my domain, I found out they offer a `free tier` service called [Cloudflare Web Analytics](https://www.cloudflare.com/en-gb/web-analytics/). Anyone can add their JavaScript snippet and start receiving real-time analytics. If you deploy your website directly with Cloudflare, analytics integration is automatic, but this is not the case for me. My blog is hosted on [GitHub](https://github.com/), using [GitHub Pages](https://docs.github.com/en/pages). So, in today’s post, we will dive into how to integrate analytics into the site!

## Prerequisites

1. Docusaurus static site deployed
1. A Cloudflare account and a valid domain

## What is Cloudflare Web Analytics?

> Cloudflare Web Analytics provides free, privacy-first analytics for your website without changing your DNS or using Cloudflare’s proxy. Cloudflare Web Analytics helps you understand the performance of your web pages as experienced by your site visitors.

## How Cloudflare Analytics Works?

> All you need to enable Cloudflare Web Analytics is a Cloudflare account and a JavaScript snippet on your page to start getting information on page views and visitors. The JavaScript snippet (also known as a beacon) collects metrics using the Performance API, which is available in all major web browsers.

## Cloudflare Configuration

The section describes how to work with the Cloudflare UI, create a `site` and retrieve the beacon for the setup.

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
1. Navigate to `Analytics & Logs > Web Analytics`
1. Click on the `Add a site` button
1. Provide a website domain. For me, I defined `blog.grosdouli.dev`
1. Click Done

If the website is proxied by Cloudflare, no further action is required. If the website is not proxied by Cloudflare, copy the `.js` snippet script from the screen and proceed with the next steps.

## Docusaurus Configuration

Cool! We created a new `site` in the Cloudflare Dashboard, but now what? We have a `.js` snippet, but what is the right place, and how can we install it and connect it with the Docusaurus static site? I did not know the question myself, so some reading followed.

### Research

First off, I had to search the different possibilities provided by Docusaurus to run scripts. Docusaurus [official documentation](https://docusaurus.io/docs/api/docusaurus-config#scripts) to the rescue! Looking at the `docusaurus.config.js` configuration reference, the `scripts` section appeared to be the right place for the `.js` script.

On a second base, it was time to integrate `dotenv`, as in the future it might be useful to mask sensitive data in the `docusaurus.config.js` file. For this setup, the Beakon token is used to track and identify requests. It is not a token used for Authentication or authorisation. Plus, once the site is built, the token is visible in the `index.html` page under scripts.

### npm dotenv Package

The [dotenv](https://www.npmjs.com/package/dotenv) npm package allows us to load environment variables from an `.env` file. The way we pass variables in a Docusaurus site is by using the [process.env](https://docusaurus.io/docs/deployment#using-environment-variables) argument.

```bash
$ npm install dotenv --save # Install dotenv package
$ npm ls dotenv # Check the installed version
```

### docusaurus.config.js

Modify the `docusaurs.config.js` file and add the lines below.

```js
import 'dotenv/config'; // Define this at the beginning of the file after the initial import

/** @type {import('@docusaurus/types').Config} */  //Below the const config = { section add the scrips section
const config = {
...
scripts: [
  {
    src: 'https://static.cloudflareinsights.com/beacon.min.js',
    defer: true,
    'data-cf-beacon': `{"token": "${process.env.CLOUDFLARE_TOKEN}"}`,
  },
],
```

For this setup, we use the GitHub secrets functionality to store the Beacon token in a secret and use it when we build the Docusaurus site using the GitHub workflows.

## GitHub Configuration

To define the `CLOUDFLARE_TOKEN` as a secret in GitHub, follow the steps below.

1. Log in to GitHub
1. Access the Docusaurus site repository
1. Navigate to `Settings > Secrets and variables > Actions`
1. Click the `New repository secret`
1. Define the **name** of the secret and the Beacon token

:::tip
For a 2FA setup, GitHub will request verification before creating the secret.
:::

## GitHub Workflows

Nothing will happen unless we update the existing GitHub Workflows and instruct them to use the secret defined previously. Update the existing workflows to include the lines below.

```yaml
- name: Create .env file
  run: |
    echo "CLOUDFLARE_TOKEN=${{ secrets.CLOUDFLARE_TOKEN }}" >> .env
  working-directory: ${{ github.workspace }}
```

## Local Testing

Before we push any changes to the site, we can test the deployment locally. Then we could use the `test-deploy` GitHub workflow to ensure the **build** of the site is successful.

```bash
$ npm run build
$ npm run serve
```

Ensure everything is working as expected. You can access the site on `localhost:3000`, and no warnings are visible in the terminal. Once the smoke tests are done, navigate to the `build/` directory and open the `index.html` file with an editor. Search for `cloudflareinsights` and ensure the script section added in the previous step is already visible.

Next steps are `git add, commit, and push`!

## Conclusion

With just a few easy tweaks, we added Cloudflare Web Analytics to the Docusaurus site to track traffic and performance. In the next post, we will look at simple ways to improve our Search Engine Optimization (SEO). 🚀

## Resources

- [Cloudflare Analytics](https://www.cloudflare.com/en-gb/application-services/products/analytics/)
- [docusaurus.config.js Details](https://docusaurus.io/docs/api/docusaurus-config)
- [GitHub Action](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!

