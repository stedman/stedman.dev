---
title: "Austin JavaScript Case Study"
meta:
  description: "Case study: Migrating Austin JavaScript from Jekyll to Eleventy on GitHub Pages."
tags:
  - javascript
  - 11ty
---

[Austin JavaScript](https://austinjavascript.com/) (AustinJS) is a tech meetup organization with a proud history of involvement from local hackers to JavaScript industry giants. For over ten years, it's provided timely and relevant JavaScript knowledge while serving as a key social network for the Austin web development community. If it has *anything* to do with JavaScript, it's being talked about at AustinJS.

So it was always a bit ironic that JavaScript as a technology didn't play a bigger role in the AustinJS website. Granted, a key consideration was performance on mobile devices and client-side JavaScript can degrade rendering speeds and battery life if not crafted properly. But even on the server-side, there wasn't a contribution model in the [Node](https://nodejs.org/) world that quite fit AustinJS's needs. This volunteer organization's content management system needed to be simple, deployments needed to be effortless, and whatever was chosen needed to be free.

<figure class="image browser-chrome">
  <img src="/assets/img/posts/austinjs-2013.png" alt="Austin JavaScript (WordPress), 2013">
  <figcaption>AustinJavaScript.com, circa 2013</figcaption>
  <i class="browser-parts"></i>
</figure>

The site was initially set up in 2010 on [WordPress](https://wordpress.org/) (PHP) and then moved to [GitHub Pages](https://pages.github.com/) and [Jekyll](https://jekyllrb.com/) (Ruby) in 2015. As a publishing platform, the GitHub Pages + Jekyll duo is a hard combination to beat. It's rock-solid, easy to update (even with a mobile device), deployments are invisible, and it's free.

But it's not JavaScript. Worse, Jekyll runs on Ruby which is a challenging ecosystem for the uninitiated to set up locally. This impeded layout and design contributions, so not much evolved on the site beyond 2015.

<figure class="image browser-chrome">
  <img src="/assets/img/posts/austinjs-2016.png" alt="Austin JavaScript (Jekyll), 2016">
  <figcaption>AustinJavaScript.com, circa 2016</figcaption>
  <i class="browser-parts"></i>
</figure>

Fast-forward to 2020. The JavaScript community now has a wide variety of capable Jekyll alternatives. Better yet, the automated build and deploy process that Jekyll enjoys on GitHub Pages can be replicated with the recently released [GitHub Actions](https://github.com/features/actions).

It was time to rebuild AustinJS on JavaScript.

> On this page: [The prep](#1-the-prep) > [The pitch](#2-the-pitch) > [The pivot](#3-the-pivot) > [The launch](#4-the-launch) > [Conclusion](#conclusion)

## 1. The prep

Before approaching the AustinJS organizers, I wanted to have a decent proof of concept to share. I figured I'd push some of the current content through a JavaScript engine, throw a fresh coat of paint on it, and see what folks thought.

### Discovery

Before starting, I put on my project management hat and did some fieldwork. Their GitHub repo had been up for five years, so there was plenty of material to research:

1. Content: patterns of use (and evolutions in those patterns)
2. GitHub Pull Requests: issues that need to be addressed by code change
3. GitHub Issues: issues that need to be addressed
4. Templates/other code: comments, FIXMEs, and TODOs

### Goals

After the research, my initial goals were simple:

1. maintain content parity (while the engine and the design might change, the content should remain the same)
1. keep all of Jekyll's ease of use (e.g., YAML front matter for meta data, Markdown content, straightforward templating)
1. keep the lightweight and responsive static pages
1. keep GitHub Pages' auto build and deploy functionality
1. improve the contributor experience (e.g., meetup posts, site templates)
1. improve the user experience with a visual design refresh
1. reduce dependencies (especially those requiring additional services and logins; Travis and Cloudflare, for example)

### Proof of concept

#### Generator

[Gatsby](https://gatsbyjs.com/) seemed like a solid JavaScript static site generator (SSG) choice. Based on ReactJS, it has tons of documentation, a good Jekyll migration path, and a supportive community.

#### Style

I also decided to give the CSS framework [Bulma](https://bulma.io/) a shot as it is lightweight, flexible, and well-documented. For this community project, I figured that it's also important to make design contribution as frictionless as possible. Bulma impressed me as hitting that sweet spot of capability and ease of use.

#### Content

Keeping Jekyll's YAML front matter + Markdown content layout was never a question. It's a tried and true system that's been adopted by all the Jekyll alternatives. The home page, about page, etc. migrated without a hitch.

I took a closer look at the 100+ meetup posts from the past ten years. Details such as speaker names, bios, avatars, sponsor names, and venue locations in the Markdown could be standardized and moved up into the YAML front matter. This front matter data can then be used in the current page or elsewhere on the site. Standardizing the data format also makes linting and/or pre-flight field checks possible before allowing pull requests to be opened.

Thus, a [typical original meetup (`2020-02-16-meetup.md`)](https://github.com/austinjavascript/austinjavascript.com/blob/v2-eol/_posts/2020-02-16-meetup.md) file:

{% raw %}

```yaml
---
title: Absolute Unit Tests with Jest and Enzyme
author: kevin
layout: post
categories:
  - posts
  - meetups
when: 2020-02-18T19:30:00-06:00
---

{% assign speakr = 'Nick Gottschlich' %}
{% assign twiturl = 'https://twitter.com/nickgottschlich/' %}
{% assign huburl = 'https://github.com/nick-gottschlich/' %}
{% assign website = 'http://nickpgott.com' %}


Everything you wanted to know about testing React components with Jest and Enzyme! Learn what a unit test is, why its useful, and how to test things like: existence of react components, simulated clicks and other events, mocking data, snapshots and more!

### Our speaker

<div class="media-object speaker-bio">
  <a href="{{ twiturl }}">
    <img alt="{{ speakr }} @NickGottschlich on Twitter"
      src="https://pbs.twimg.com/profile_images/1029847332781740032/Gp54dk3Z_400x400.jpg" />
  </a>
  <div>
  <a href="{{ twiturl }}"><strong>{{ speakr }}</strong></a>, Software Engineer at Procore Technologies
  <p>
    Twitter: <a href="{{ twiturl }}">@NickGottschlich</a>
  </p>
  <p>
    Website: <a href="{{ website }}">http://nickpgott.com/</a>
  </p>
  <p>
    Github: <a href="{{ huburl }}">nick-gottschlich</a>
  </p>
  </div>
</div>

Make sure to thank our gracious host [Cloudflare][].

{% include give-em-the-business.html location='cloudflare' %}

Check back here or <a href="{{ site.twitter.url }}">follow us on Twitter</a>
for updates.

[cloudflare]: https://www.cloudflare.com/
```

...was transformed into the following concise post:

```yaml
---
layout: meetup
title: Absolute Unit Tests with Jest and Enzyme
speakers:
  - name: Nick Gottschlich
    title: Software Engineer at Procore Technologies
    avatar: https://pbs.twimg.com/profile_images/1029847332781740032/Gp54dk3Z_400x400.jpg
    bio:
    email:
    homepage: http://nickpgott.com
    twitter: NickGottschlich
    github: nick-gottschlich
    linkedin:
sponsor: cloudflare
venue: cloudflare
after: lavaca
organizers:
  - lingram
  - astacy
---

Everything you wanted to know about testing React components with [Jest](https://jestjs.io/) and [Enzyme](https://enzymejs.github.io/enzyme/) Learn what a unit test is, why its useful, and how to test things like: existence of react components, simulated clicks and other events, mocking data, snapshots and more!
```

> Note: To help contributors, I created a [how to contribute to posts](https://github.com/austinjavascript/austinjavascript.com/blob/master/CONTRIBUTING-POSTS.md) document that provides more details about each field. The mechanics of how it all works is a bit more involved and would be a great topic for another blog post.

You may have noticed that the `when` and `categories` fields were omitted in the new version above.

##### When

In Jekyll-land, the first part of the post file name (e.g., `2020-02-18-meetup.md`) contains the publish date. AustinJS organizers were unable to use future publish dates because Jekyll throws an error. So organizers added the `when` front matter field to represent the meetup date in the future. Unfortunately they also used it for the meeting **time** as well. While analyzing past pull requests, I noticed all sorts of Daylight Saving Time snafus that required subsequent PRs to remedy.

Gatsby didn't throw errors if file names had future dates so I was able to dispose of the `when` field. Oh, and since almost every one of the 100 or so meetups started at 7:30pm and ended at 9pm, I was able to hardwire that into the template as well.

##### Categories

The `categories` front matter field generates the site sub-folders—at least in the AustinJS Jekyll setup. Using our example from above, the output file path looks like:

```html
/<cat-1>/<cat-2>/<date>/    # format
/posts/meetups/2020/02/18/  # actual
```

With Gatsby, the permalink format is defined in the `gatsby-node.js` file, so the `categories` front matter fields are completely unnecessary.

{% endraw %}

## 2. The pitch

After wrangling Gatsby, Bulma, and a sample of content for a few days, I soon had a [proof of concept](https://github.com/austinjavascript/austinjavascript.com/issues/105) to share with AustinJS leadership.

Aaron Stacey, long-time AustinJS organizer and developer of the second gen site, was pleased with the idea of it all but added that an MVP (minimal viable product) would include the following:

1. Deploy on push
2. Have a low page weight
3. Look good on mobile

Hooray! We agreed on goals. But then Aaron pointed out the page weight. My Gatsby-powered home page had ballooned to 30 times the size of the Jekyll-powered version. It now weighed-in at over 3GB. What the heck? Sure it was speedy on my desktop, but there were valid concerns about load times for mobile devices.

Gatsby hydrates the initial page after the static bits load and subsequent page loads are routed through ReactJS. So, as you can imagine, you're getting a large upfront JS payload followed by smaller GraphQL data transfers to navigate additional pages. For a site that typically only experiences one page view per session (to view details about an upcoming meetup), it's important to maintain a trim initial page weight.

Aaron kindly mentioned that [Eleventy (11ty)](https://11ty.dev/) might be a better fit.

## 3. The pivot

Changing horses from Gatsby to Eleventy was relatively uneventful. I quickly ported over the Bulma CSS and the posts with the newly standardized YAML front matter. Migrating the Gatsby guts was a bit more delicate but once on Eleventy, everything was gravy.

> Note: The [LiquidJS templating language](https://liquidjs.com/) used by Eleventy is a port of the very same Liquid language that Jekyll uses. Direct migrations from Jekyll to Eleventy are relatively seamless (with a few exceptions, of course).

Once I switched to Eleventy, things got even easier. Working with Eleventy is a joy. For the most part, things just make sense. The community is vibrant and ready to help when things don't make so much sense.

### GitHub Actions

While a JavaScript SSG is pretty exciting, this site needed to build and deploy whenever the master branch was updated. Jekyll did this out of the box and it meant that organizers could update meetup details from their mobile devices and see the changes live on the site within minutes.

[GitHub Actions](https://docs.github.com/en/actions) adds the ability to spin up a server to run builds, tests, deployments, etc. based on repo events such as pull requests or merges.

Setting up the AustinJS workflow was absolutely painless (see [Make the Jump from Jekyll to JavaScript](/2020/04/29/make-the-jump-from-jekyll-to-javascript/)) and has been running like a tank ever since.

### Enhancements

Once the basics were nailed down, there was time to add even more value.

* [home](https://austinjavascript.com/) page: add an Austin skyline hero (to make a place connection) and a roll-call of past speakers/presentations (to make a people connection)
* [contributing](https://austinjavascript.com/contributing/) page: add a page to help presenters, sponsors, hosts, and others get more involved
* [meetup](https://austinjavascript.com/posts/meetups/) posts: add videos and slide decks from past presentations
* [RSS feed](https://austinjavascript.com/feed.xml)
* SSL/CI/CDN services: switch to GitHub and remove Cloudflare and Travis dependencies

<figure class="image browser-chrome">
  <img src="/assets/img/posts/austinjs-2020.png" alt="Austin JavaScript, 2020">
  <figcaption>AustinJavaScript.com, circa 2020</figcaption>
  <i class="browser-parts"></i>
</figure>

### Goals review

I reviewed the [goals](#goals) one last time:

1. ✅ maintain content parity
2. ✅ keep all of Jekyll's ease of use
3. ✅ keep the lightweight and responsive static pages
4. ✅ keep GitHub Pages' auto build and deploys
5. ✅ improve the contributor experience
6. ✅ improve the user experience
7. ✅ reduce dependencies

With all the boxes checked, it was time to launch.

## 4. The Launch

This launch called for the development branch to be merged into the main branch and then setting up the Actions workflow to automate future build/deployments. Simple tasks, but replacing engines while the old one still works is always a scary move. I pressed the buttons and hoped for the best.

I saw source code.

All that showed up on the AustinJS site was source code for the index page. Was there something I missed in an Eleventy config? Was something wrong with the Actions workflow?

Another hour of testing and research revealed that this repo didn't have the same ability to deploy to `gh-pages` branch as my demo site. Huh? A bit [more research](https://help.github.com/en/github/working-with-github-pages/about-github-pages#publishing-sources-for-github-pages-sites) revealed that `<org_name>.github.io` type repos can only deploy to `master`. There weren't many options. Change the `austinjavascript.github.io` repo name or give up and return to Jekyll.

I got on a short call with Aaron and went through the options. We decided to rename the repo to `austinjavascript.com` and break the logjam. A few short moments later, the new site was live.

## Conclusion

Since the launch, the site has run flawlessly. It builds a bit faster than the old Jekyll engine but you'd be hard-pressed to find any other deployment differences.

I set out to improve the AustinJS user/contributor experience and bury the [cruel Ruby joke](https://github.com/austinjavascript/austinjavascript.com/blob/v2-eol/README.md#previewing-changes). With special thanks to Aaron Stacey and Kevin Kipp for their help, I believe I succeeded. At long last, Austin JavaScript can proudly say that, with regards to JavaScript, it is [eating it's own dog food](https://en.wikipedia.org/wiki/Eating_your_own_dog_food).
