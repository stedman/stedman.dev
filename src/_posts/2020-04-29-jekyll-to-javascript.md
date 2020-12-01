---
title: Make the Jump from Jekyll to JavaScript
meta:
  description: Fully replace Jekyll with Eleventy on GitHub Pages. Learn how to set up the application, automatic deployments, and a custom domain.
tags:
  - tutorial
  - 11ty
  - github
---

With the recent addition of [Actions](https://github.com/features/actions) to GitHub's product lineup, we now have the ability to create a *100% Pure, Unfiltered&trade;* JavaScript alternative to Jekyll (and Ruby) in GitHub Pages. This is a big deal. Really.

## Back story

[GitHub Pages](https://pages.github.com/), for the uninitiated, are public web pages automatically generated from your GitHub source files and freely hosted on github.io or your custom domain. There are no servers to provision and no databases to set up.

The automatic generation part is handled by [Jekyll](https://jekyllrb.com/), a pretty sweet static site generator. It's been around quite awhile, is battle tested, and is backed by a huge community. It's also simple enough for beginners and yet powerful enough for advanced users. Unfortunately, customizing it requires running it locally and this is where things get sticky. Jekyll is based on Ruby. For casual users, Ruby is a challenge to set up and maintain—especially on Windows. Scaling is also an issue for Jekyll/Ruby as bigger builds are notorious for taking a long time to compile.

While there are plenty of competitive static site generators out there, the one piece that was missing was the integrated of build and deploy to GitHub's web server. Pages+Jekyll took care of that build and deploy mumbo-jumbo for you, automagically. Just commit to the `gh-pages` branch and **poof**, your site is updated.

More recently, workarounds from [Netlify](https://netlify.com/) and others have popped up. They handle build/deploy and offer additional features worth considering, but at the end of the day they are yet another dependency to maintain.

If only we could run a static site generator on Pages with all the hooks and privileges of Jekyll but with the ease-of-setup and performance provided by more modern alternatives.

Well, now you can. All the pieces have finally fallen into place.

> **UPDATE:** If you're working with GitHub **user** or **organization** sites, you can only [publish from the `master` branch](https://help.github.com/en/github/working-with-github-pages/about-github-pages#publishing-sources-for-github-pages-sites). This effectively prevents alternative GitHub Pages deployments such as the one described below for those types of sites.
>
> What are **user** or **organization** sites? Those are the sites that publish from repos named `<user>.github.io` (or `<organization>.github.io`) and have URLs that look like `https://<user>.github.io/`.
>
> All other repos are considered **project** sites. The deploy steps defined in this tutorial will work with those sites since they can [publish from the `gh-pages` branch](https://help.github.com/en/github/working-with-github-pages/about-github-pages#publishing-sources-for-github-pages-sites).

## The build

This brief tutorial will cover the essentials of migrating from Jekyll to JavaScript. The following are required to get started:

* [GitHub account](https://github.com/)
* [NodeJS](https://nodejs.org/) set up locally

Of course, it would also make sense to already have an existing Jekyll repo. If not, then [create a new GitHub repo](https://github.com/new/) (public or private) with a README initialized. Follow the follow-up instructions to clone and set it up locally.

### Set up the static site generator

It took awhile for someone to distill the essence of Jekyll into JavaScript. With [Eleventy](https://11ty.dev), Zach Leatherman ([@zachleat](https://twitter.com/zachleat)) has really distilled, bottled, and shipped it. Oh, and did I mention that it's fast? I'll skip the rest of the sales pitch here and let the experts do the talking.

* [Dave Rupert: What I Like About Eleventy](https://daverupert.com/2019/08/what-i-like-about-eleventy/)
* [iandroid: Why I'm Digging Eleventy](https://iandroid.eu/why-im-digging-eleventy/)
* [Paul Lloyd: Turn Jekyll Up to Eleventy](https://24ways.org/2018/turn-jekyll-up-to-eleventy/)

If you haven't already guessed, I'm smitten with Eleventy. It's that multi-purpose knife that fits just perfectly in your pocket and makes you smile every time you use it.

It also makes the transition from Jekyll to JavaScript almost completely seamless. So let's roll with it.

#### Install and configure

1. Open a terminal and navigate to your repo.

2. If you don't already have a `package.json` file in the root directory, then take this moment to initialize npm.

    ```shell
    npm init
    ```

3. Install Eleventy as a `devDependency`.

    ```shell
    npm install --save-dev @11ty/eleventy
    ```

4. To the site root, add an empty `.nojekyll` file to [disable the default Jekyll build](https://help.github.com/en/github/working-with-github-pages/about-github-pages#static-site-generators).

    ```shell
    touch .nojekyll
    ```

5. Keeping things simple, we'll assume a [default Jekyll file structure](https://jekyllrb.com/docs/structure/).

    ```shell
    ..
    ├── _layouts
    │   ├── default.html
    ├── assets
    │   ├── css
    │   ├── images
    │   └── js
    ├── index.html
    ..
    ```

    To the site root, add a `.eleventy.js` config file with the following contents. For more details, see the [Eleventy configuration docs](https://www.11ty.dev/docs/config/).

    ```js
    module.exports = (eleventyConfig) => {
      // Copy the "assets" directory to the compiled "_site" folder.
      eleventyConfig.addPassthroughCopy('assets');

      return {
        dir: {
          input: './',
          output: './_site',
          layouts: './_layouts',
        },
        templateFormats: [
          'html',
          'liquid',
          'md',
          'njk',
        ],
        pathPrefix: '/<repo_name>/', // omit this line if using custom domain
      };
    };
    ```

    Looking at the `dir.output` above, notice that we are maintaining parity with Jekyll's deployment, using the `./_site` directory for our compiled code.

    Also note that, unless you're using a [custom domain](#the-custom-domain), you'll need to add a [path prefix](https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix) (`/<repo_name>/`) to the config options. This is because [project sites](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) are hosted on subdirectory URLs that look like `https://<user>.github.io/<repo_name>/`.

6. To the `scripts` section of `package.json`, add the following. We'll need the `build` script for our deployment later.

    ```json
      "scripts": {
        "clean": "rm -rf ./_site",
        "build": "npm run clean && eleventy",
        "start": "eleventy --serve --watch"
      },
    ```

    * **clean**: empties out the deployment directory
    * **build**: cleans the deploy directory and builds the site with Eleventy
    * **start**: runs Eleventy in developer mode with live browser refreshes

## The deployment

Now for the real magic sauce, [GitHub Actions](https://docs.github.com/en/actions)-style.

### Set up a workflow

1. Open a browser to your GitHub repo and then select the **Actions** tab.
2. Tap on the **New workflow** button.
3. Tap on the **Set up a workflow yourself** button.
4. In the **{repo_name}/.github/workflows/`main.yml`** field, enter "`eleventy_build.yml`".
5. Into the **Edit new file** textarea, cut and paste the following:

    {% raw %}

    ```yaml
    name: Eleventy Build

    # Controls when the action will run. Triggers the workflow on push or pull request
    # events but only for the master branch
    on:
      push:
        branches: [ master ]

    # A workflow run is made up of one or more jobs that can run sequentially or in parallel
    jobs:
      # This workflow contains a single job called "build"
      build:
        # The type of runner that the job will run on
        runs-on: ubuntu-latest

        # Steps represent a sequence of tasks that will be executed as part of the job
        steps:
        # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
        - uses: actions/checkout@v2

        - name: Setup Node.js environment
          uses: actions/setup-node@v1.4.1

        - name: Install packages
          run: npm ci

        - name: Run npm build
          run: npm run build

        - name: Deploy to gh-pages
          uses: peaceiris/actions-gh-pages@v3
          with:
            deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
            publish_dir: ./_site
    ```

6. Tap the **Start commit** button.

7. Complete the **Commit new file** form and select **Commit directly to the `master` branch**.

The workflow script should be fairly self-descriptive. See that `${{ secrets.ACTIONS_DEPLOY_KEY }}` line near the end of the workflow? We need to add deploy keys to GitHub before attempting a deployment.

{% endraw %}

### Set up deployment keys

The following instructions were cribbed from a third-party [GitHub Actions for GitHub Pages](https://github.com/marketplace/actions/github-pages-action#%EF%B8%8F-create-ssh-deploy-key) page. Please check that site for updates before proceeding as these instructions may have changed.

1. Generate a SSH key locally to use as your deploy key.

    ```shell
    ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f gh-pages -N ""
    # You will get 2 files:
    #   gh-pages.pub (public key)
    #   gh-pages     (private key)
    ```

2. Open a browser to your repo and select the **Settings** tab.

3. Select **Deploy keys** from the left menu.

    1. Tap the **Add deploy key** button.
    2. In the **Title** field, enter "`Public key of ACTIONS_DEPLOY_KEY`".
    3. In the **Key** field, cut and paste the contents of your `gh-pages.pub` SSH key file made in step 1 above.
    4. Check the **Allow write access** box.
    5. Tap the **Add key** button.

4. Select **Secrets** from the left menu.

    1. Tap the **Add a new secret** link.
    2. In the **Name** field, enter "`ACTIONS_DEPLOY_KEY`".
    3. In the **Value** field, cut and paste the contents of your `gh-pages` SSH key file from step 1 above.
    4. Tap the **Add secret** button.

    > IMPORTANT: Delete the local `gh-pages` keys at this point. You certainly do not want to add them to your version control (for all to see).

5. To initiate a deployment, commit/merge to the `master` branch. The first deploy will fail (because the `gh-pages` branch has not been created yet).

6. Go back to the **Settings** tab.

    1. Scroll down to the **GitHub Pages** section.
    2. From the **Source** options, select `gh-pages branch`.

7. Merge some more code into `master` to initiate another deploy.

Congrats. You're done! From here on out, you should be able to trigger a fresh build and deploy by:

* working/saving locally, committing, and pushing to `origin master`.
* editing your code at github.com and saving to `master`.

Your updates will deploy to live in mere seconds. All of this takes place within the ecosystem that you version your code in. There are no additional dependencies, no additional accounts, nada. How cool is that?

## The custom domain

GitHub provides [project sites](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) (e.g., `https://<user>.github.io/<repo_name>/`) that may suit you just fine. If, however, you want to use a custom domain (e.g., `https://example.com/`), there's a bit more work involved.

### Set up a custom domain

1. If you haven't already set up an apex domain (e.g., `example.com`) for this repo, then you will need to add it. Follow the [GitHub instructions for managing a custom domain](https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site).

2. The `CNAME` file created when you entered your domain in the **Custom domain** field (above) needs to be included in our distribution directory.

    1. Open the `gh-pages` branch and copy the `CNAME` file.
    2. Go back to the `master` branch and add that `CNAME` file to the source directory (in this case, the root directory).
    3. Open the `.eleventy.js` config file and add the CNAME file to the list of pass-through copies.

        ```js
        ..
          eleventyConfig.addPassthroughCopy('CNAME');
        ..
        ```

    4. Save, commit, and push to origin.

## Conclusion

For 12 years, GitHub teased us with a web hosting product that almost did everything we needed. We were grateful and we made due. Along the way, we came up with hacks and workarounds, employing one or more outside services to complete the task. But nothing quite combined source code versioning, flexible site generation, and web hosting in one elegant package.

With Eleventy and GitHub Actions, we now have it all.
