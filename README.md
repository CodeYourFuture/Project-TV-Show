# TV Show Project

One of the most powerful things a software engineer can do is take some data and make it easy for people to understand.

The aim of this project is to take some data someone else has (and exposes over an API), and display it to users. The data we're using for this project is about episodes of TV shows.

This project will take you multiple weeks to complete. As always, we will break down the project into levels we can deliver incrementally. You must finish each milestone before you start working on the next one (but it's OK to know what the future levels are going to be - it may help you design things). Your goal is to complete all of the levels up to and including level 500 during the Data Flows module.

## Goals

There are three primary goals of this project:
1. Get experience building a non-trivial application end-to-end.
2. Get experience understanding, modifying, and working with code someone else wrote.
3. Build an impressive application you can demo and show off.

Specific learning objectives of the project:

<!--{{<objectives>}}-->
- [ ] Consume structured data in JavaScript using `fetch`.
- [ ] Build UI components dynamically.
- [ ] Update a UI dynamically in response to user input.
- [ ] Make sense of a codebase produced by someone else.
- [ ] Refactor an existing codebase to make it easier to understand and modify.
- [ ] Collaborate with another programmer in a single shared GitHub repository.
- [ ] Add functionality to a codebase you didn't design/write.
<!--{{</objectives>}}-->

## Data

The data we're going to use comes from a website called TVmaze. For the first few levels, you can call a function `getAllEpisodes()` and you will get an array of objects, one per episode of a TV show. Later on, you will use `fetch` to get the data dynamically from the API. Here is an example object for one episode:

```js
{
    id: 4952,
    url: "http://www.tvmaze.com/episodes/4952/game-of-thrones-1x01-winter-is-coming",
    name: "Winter is Coming",
    season: 1,
    number: 1,
    airdate: "2011-04-17",
    airtime: "21:00",
    airstamp: "2011-04-18T01:00:00+00:00",
    runtime: 60,
    image: {
        medium: "http://static.tvmaze.com/uploads/images/medium_landscape/1/2668.jpg",
        original: "http://static.tvmaze.com/uploads/images/original_untouched/1/2668.jpg"
    },
    summary:
        "<p>Lord Eddard Stark, ruler of the North, is summoned to court by his old friend, King Robert Baratheon, to serve as the King's Hand. Eddard reluctantly agrees after learning of a possible threat to the King's life. Eddard's bastard son Jon Snow must make a painful decision about his own future, while in the distant east Viserys Targaryen plots to reclaim his father's throne, usurped by Robert, by selling his sister in marriage.</p>",
    _links: {
        self: {
            href: "http://api.tvmaze.com/episodes/4952"
        }
    }
}
```

## Rules

### Your website must be accessible and use semantic HTML

As always, your application must score 100 for Accessibility on Lighthouse.

### Don't change `getAllEpisodes()`

Because we're just using this `getAllEpisodes()` function as a placeholder until we use `fetch`, and we can't change what data will be returned to us from the `fetch`, you shouldn't change the implementation of `getAllEpisodes()`.

### Use tech that we've learnt

You should use the DOM-manipulation functions you've been learning about on the course - the point of this project is to practice.

You should not use React, Vue, JQuery, or any other libraries or frameworks for this project. You can rebuild it in React later if you want!

### Functionality before style

Your goal of this project is to achieve the levels, all of which are about functionality. When you have completed level 500, you can spend some time making it look beautiful. But focus on the functionality first.

Remember: it's important that software works and that people can use it.

## Get started

Each level has a .md file in the [`levels`](./levels) folder. Start with level 0, then complete level 100.

After that, you're going to swap codebases with someone else. You should complete level 200 in their repository, not your own. Every level, you'll swap back - so you'll do level 300 in your own codebase, level 400 in theirs, etc.

You are allowed to change anything in your partner's code to make it easier to understand or build on, but they must understand and accept your changes.

Remember, finish each level before you move on to the next. Reach out for help when you're stuck.

### If you can't find a pair

The expectation is that you work with a partner on this project.

If you are unable to find a partner, reach out on Slack - the whole cohort will be attempting this project. This includes people in other regions - you can work with them if you want/need!

If you absolutely can't find a partner to work with, see if one of the volunteers will be your partner.

If you _still_ can't find a partner, you can use the existing levels in this repo. There is a branch for each level - after you make your own level 100, make a new branch based on the `solutions/100` branch and implement level 200 on top of it. Then make a new branch based on the `solutions/200` branch and implement level 300 on top of it. And so on.

You should avoid working without a partner - the expectation is you are working with a partner, because this will practise important skills. If you work without a partner, for your submission to be accepted you must justify to the reviewer how you tried to find a partner and why one couldn't be found - our bar for an explanation is high.

## Submission
This task has 6 steps of implementation: level 0 through to level 500.
You will **not** submit a PR to `CodeYourFuture/Project-TV-Show` until you have finished level 500.
You will collaborate with another partner and submit pull requests to each other's repos, instructions will be given in level200 for how to do this.

When you have finished level 500, you will submit a pull request back to `CodeYourFuture/Project-TV-Show`.
As you will have been using different branches during this project, make sure you are submitting a PR for the correct one.
Then go through the normal PR flow to finally submit.

Each partner in the pair needs to make their own PR to submit.
If the reviewer asks for changes you should do so individually on your own PRs.

In the description of your pull request, include a link to the deployed page.
You should also give the name of the partner you worked with.

There is a stretch level 999 if you want to practice more, you should not submit this as part of your PR.
If you want feedback, ask for this to be done separately.

### Instructions for Reviewers

#### Requirements
If this is your first review of the TV show project, familiarise yourself with the task requirements.
For your convenience, you can find a list of all the requirements [here](levels/Reviewers-All-Requirements.md).
There are no rules about how the site should look, only how it behaves.

#### How to review
Submission is done via a PR, like usual.
The trainees have been working in pairs, so it is normal if you see evidence of collaboration.
Each pair will have submitted their own final version, and these can differ so they should be reviewed independently.

Do not try to deploy the page for your own review.
Use the URL to the deployed page provided by the trainee.
If they did not include this in the PR description, ask for them to add this, and don't proceed with the review until they do so.

Check any changes made, and raise issues for problems in implementation or where the requirements are not met.
Only the trainee submitting that PR should respond and make changes, not their partner.
