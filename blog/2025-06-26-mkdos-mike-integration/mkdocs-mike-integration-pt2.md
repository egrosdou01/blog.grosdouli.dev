---
slug: mkdocs-mike-integration-part-2
title: "Mkdocs: Control Displayed Versions with Mike"
authors: [egrosdou01]
date: 2025-09-25
image: ./documentation.jpg
description: A comprehensive step-by-step guide working with MkDocs and the Mike plugin. Today we demonstrate how to control the visible documentation versions in the UI.
tags: [mkdocs,github]
---

**Summary**:

We have updated MkDocs with the Mike plugin [post](mkdocs-mike-integration.md). Now, it shows only the three most recent versions in the UI. Let's dive into the details!

<!--truncate-->
![title image reading "Documentation Meme"](documentation.jpg)

## Introduction

This is **part two** of the MkDocs with Mike integration series. In [part one](mkdocs-mike-integration.md), we covered how to enable and deploy the Mike plugin in MkDocs. In today's post, we cover the updated version of the GitHub workflows to maintain only the last three documentation versions, while displaying an **Archive** page that will serve users as a way to explore older documentation versions.

## GitHub Resources

The showcase repository is available [here](https://github.com/egrosdou01/mkdocs-versioning-example).

## Prerequisites

1. Go through [part one](mkdocs-mike-integration.md) of the series
1. Basic knowledge and understanding of MkDocs
1. Basic understanding of GitHub workflows

## GitHub Workflows - Update

After looking into the existing GitHub workflows, I decided to keep the `test.yml` workflow the way it is while updating the `prod.yml` to implement the logic of updating the already deployed `Mike` versions.

:::note
As a reminder, the `test.yml` is triggered when the `main` branch of the documentation is updated. The current and future releases are handled by the `prod.yml` file.
:::

### Prod Workflow

```yaml showLineNumbers
name: CI Build Prod Docu
on:
  release:
    types: [published]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-python@v5
        with:
          python-version: 3.x
      - name: Install Dependencies
        run: |
          pip install mkdocs-material==9.6.23
          pip install mike==2.1.3
      - name: Setup Docs Deploy
        run: |
          git config --global user.name "Example Docu Deploy"
          git config --global user.email "docs.deploy@eleni.dev"
      - name: Build Docs Website
        run: mike deploy --push --update-aliases ${{ github.event.release.tag_name }} latest
      // highlight-start
      - name: Hide Old Releases
        run: |
          VISIBLE_RELEASES=2
          # Include only versions starting with `v`.
          # Sort the versions from oldest to latest
          all_releases=$(mike list --json | \
                                 jq -r '.[] | select(.properties.hidden | not) | .version' | \
                                 grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+(\-.*)?$' | \
                                 sort -V)
          # Add the Mike versions into an array
          releases_array=($all_releases)
          num_releases=${#releases_array[@]}

          # Check if more than 2 releases are available
          if (( num_releases > VISIBLE_RELEASES )); then
            hide=$((num_releases - VISIBLE_RELEASES))
            echo "We have to hide $hide versions"
            
            # Take the oldest applicable releases and hide them
            for (( i=0; i<hide; i++ )); do
              hide_version=${releases_array[i]}
              echo "Hiding release version: $hide_version"
              mike props --set hidden=true "$hide_version" --push 
            done
          else
            echo "No release versions to hide. Exit"
          fi
      // highlight-end
```

Looking at the YAML definition, the important part is the newly added `Hide Old Releases` section. How does it work? We utilise the `mike list` command to collect all the versions as JSON output. We sort them out using the `-V` argument (natural sort of (version) numbers within text), then we go through the list using a `for` loop, and we get the top item from the list and hide it. Finally, we push the changes. The versions are sorted from oldest to latest.

:::note
The Mike official documentation is a great source of information. There might be a better way of doing something similar. Feel free to share your ideas! 😊
:::

:::tip
Even if we hide the old versions, they are still available in the `gh-pages` branch. Continue to the [Archive](#archive) section and have a look at how to create this page.
:::

## Archive

Even if the old versions are hidden, they are still accessible. This can be achieved by creating a new page called `archive.md`.

The file could get created under `blog/` and then defined in the `mkdocs.yml` file.

### archive.md

Create the `archive.md` file and include the URLs of any older versions. For example, ```https://egrosdou01.github.io/mkdocs-versioning-example/v0.0.1/```.

```yaml
## Documentation Archive

### Previous Versions
- [Version 0.0.1](https://egrosdou01.github.io/mkdocs-versioning-example/v0.0.1/)
- [Version 0.0.2](https://egrosdou01.github.io/mkdocs-versioning-example/v0.0.2/)
```

### mkdocs.yml

Include the `archive.md` in the `nav` section of the `mkdocs.yml` file.

```yaml
nav:
- Home: 'index.md'
...
- Archive: 'archive.md'
```

Following the same flow as described in [part 1](mkdocs-mike-integration.md) of the series, every time a new release is available, we update the documentation with the latest release and remove the older version from the top of the list.

## Conclusion

With a few tweaks to the GitHub workflow, we can control the number of displayed versions in the documentation UI! Happy coding!

## What's Next?

We will optimise the GitHub workflow to update the `archive.md` automatically instead of a manual addition.

## Resources

- [MkDocs and Mike Example Repo](https://github.com/mkdocs-material/example-versioning/tree/master)

## ✉️ Contact

If you have any questions, feel free to get in touch! You can use the `Discussions` option found [here](https://github.com/egrosdou01/blog.grosdouli.dev/discussions) or reach out to me on any of the social media platforms provided. 😊 We look forward to hearing from you!