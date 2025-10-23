---
slug: update-docusautus-v3.8-v3.9
title: "Docusaurus: Update from v3.8 to v3.9"
authors: [egrosdou01]
date: 2025-10-23
image: ./docusaurus.jpg
description: A quick guide describing how to update Docusaurus from v3.8 to v3.9 and what changed in between. The guide is mainly for engineers like myself and not frontend experts.
tags: [docusaurus,github]
---

**Summary**:

This is a quick summary of updating Docusaurus from **v3.8** to **v3.9** and what the required modifications/steps are.
<!--truncate-->

## Introduction

It is time again for a Docusaurus update! 🦖🚀 In the past, we described how frequent updates can save us time and headaches. Thus, decided to perform an update from my current version to the latest available. In today’s post, we will cover key updates in the `docusaurus.config.js` and changes to the GitHub workflows.

![title image reading "Docusaurus"](docusaurus.jpg)

## Release Notes

Before we begin, let us have a look at the [v3.9 release notes](https://docusaurus.io/blog/releases/3.9). The following are some important changes.

### Important Updates

1. Dropping support for **Node.js 18**. The minimum Node.js requirement is **Node.js 20**
1. Enhancement in diagramming options with the addition of **Mermaid ELK layout** support
1. **Algolia DocSearch v4**, which now includes an AI-powered "AskAI" assistant to provide a conversational search experience
1. Since Docusaurus [v3.8](https://docusaurus.io/blog/releases/3.8) the "Future Flags," have been introduced, allowing users to gradually opt into upcoming **Docusaurus 4** breaking changes. 

## Changes

To upgrade to the latest Docusaurus version, `build` and `serve` the static site, we should perform the changes below.

:::tip
The default command to upgrade docusaurus is: ```npm i @docusaurus/core@latest @docusaurus/preset-classic@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest```. If more plugins are used on your site, the `npm` command should get modified as required.
:::

### docusaurus.config.js Changes

Guidance on how to update the `docusaurus.config.js` file for the latest release; I followed the GitHub [pull request #1011](https://github.com/scalar-labs/docs-scalardl/pull/1011).

Here are the changes made for a successful update and to hide potential warning messages.

```js
const config = {
  onBrokenLinks: 'throw',
  onDuplicateRoutes: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
}
```

You can find more details on updating the `docusaurus.config.js` file in the [official Docusaurus configuration guide](https://docusaurus.io/docs/api/docusaurus-config#onBrokenMarkdownLinks). Check out my [pull request](https://github.com/egrosdou01/blog.grosdouli.dev/pull/82/files) for more information.

### docusaurus.config.js v4 Changes Opt

As mentioned earlier, we have the possibility to opt into upcoming **Docusaurus 4** breaking changes. This can be done by adding the following to the `docusaurus.config.js` file.

```js
const config = {
  future: { v4: true },
}
```

### GitHub Workflow Changes

As support for **Node.js 18** has officially dropped, we need to update the GitHub workflows for `test` and `prod` deployments. In the GitHub workflows, we use the setup action `actions/setup-node@v4` with `node-version: 18`. That means the **Node.js** version will have to be updated to `node-version: 20` instead.

```yaml
name: Test deployment

on:
  pull_request:
    branches:
      - main
jobs:
  test-deploy:
    name: Test deployment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
        // highlight-start
          node-version: 20
        // highlight-end
          cache: npm
```

More details about the `actions/setup-node@v4` can be found [here](https://github.com/actions/setup-node).

## Conclusion

As I am not a frontend developer working every day with Node.js, with a few changes, we could update Docusaurus from v3.8 to v3.9 with no surprises. Have fun coding!

## Resources

- [Upgrade to v3.9 Notes](https://docusaurus.io/changelog/3.9.2)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!