---
slug: update-docusautus-3.4.0-3.7.0
title: "Docusaurus: Update from 3.4.0 to 3.7.0"
authors: [egrosdou01]
date: 2025-06-20
tags: [docusaurus,github,beginner-guide,"2025"]
---

Docusaurus: Update from **v3.4.0** to **v3.7.0**. Tips and Tricks.

<!--truncate-->

## Introduction

As Docusaurus announced a minor release in January 2025, I have decided to perform an npm and docusaurus upgrade to benefit from the new features and bug fixes. The blog post will guide you through an update from **v3.4.0** to **v3.7.0**.

![title image reading "Docusaurus"](docusaurus.png)

## Release Notes

Before we even begin, I would recommend exploring the release notes of the versions after **v3.4.0** and trying to identify any dependencies and/or potential breaking changes. The release announcements are located [here](https://docusaurus.io/blog/releases/3.5) while the changelog is [here](https://docusaurus.io/changelog/3.7.0).

## Docusaurus 3.5 Release

Starting with Docusaurus **v3.5** and going through the release notes, a notable breaking change [10313](https://github.com/facebook/docusaurus/pull/10313) was noticed. The blog-related `@docusaurus/theme-common/internal` APIs have been moved to `@docusaurus/plugin-content-blog/client`. That means, once we upgrade to the latest available version, the `npm run build` will not be able to finish successfully, as there are still references to the old blog-related API.

## Changes

To upgrade to the latest Docusaurus version and `build` and `serve` the blog post, we should perform the below file changes.

:::tip
The default command to upgrade docusaurus is: ```npm i @docusaurus/core@latest @docusaurus/preset-classic@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest```
:::

### Import Changes

Relace the line `import {useBlogPost} from '@docusaurus/theme-common/internal';` with the line `import { useBlogPost } from '@docusaurus/plugin-content-blog/client';` for the files below.
- src/theme/BlogPostItem/Content/index.js
- src/theme/BlogPostItem/Footer/index.js
- src/theme/BlogPostItem/Header/Authors/index.js
- src/theme/BlogPostItem/Header/Info/index.js
- src/theme/BlogPostItem/Header/Title/index.js
- src/theme/BlogPostItem/index.js

My pull request is located [here](https://github.com/egrosdou01/blog.grosdouli.dev/pull/18).

:::note
Regarding the `src/theme/BlogPostItem/Header/Info/index.js` file, add this `import { useDateTimeFormat } from '@docusaurus/theme-common/internal';`.
:::

## Conclusion

As I am not a frontend developer working every day with NodeJS, below is what I would do differently next time.

1. Read the NodeJS updates.
1. Read and not scan the Docusaurus Release Notes.
1. Upgrade more frequently. When the next available minor release is ready, make the prerequisite tests and then continue with the image.

## Resources

- [Upgrade to v3.7.0 Notes](https://docusaurus.io/docs/3.7.0/migration)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!