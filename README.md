## How to run

install node packages:

```
npm install
```

run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or run it using docker, `Dockerfile` should work.

## Project structure

we are using next.js 14 router logic

- backend
  --- milestoneEvaluation.ts - functions for evaluating milestones against the traces.
  --- pareLangSmithTraces.ts - custom made parsing script to organise and simplify traces obtained from LangSmith
- app
  --- upload - page for uploading traces. Files have to be in .json format. Each file can contain only one trace. Multiple files can be uplaoded at once.
  --- dashboard - main page where user can: inspect traces, add milestones, run tests, and inspect test results

The database is SQLite (temporarily for itteration). Rest API endpoints for CRUDE operations are in `*/api` folders. Curently endpoints are written rather poorly using chatGPT (they need to be rewritten and use some ORM like Prisma)

## backend logic

see `runTests()` function in `src/backend/milestoneEvaluation.ts` for a sequence of functions used to run tests. Prompt/s are also in this file.

## database structure

![database structure](tracelight_app/public/backend_structure.png)

## TODO

- [ ] handling multiple test runs
      (one can run tests multiple times on a single user request - trace pair. This is neccesary, becasue user should be able to upload a new trace and rerun the test or even rerun the test for the same trace (due to stochastic nature of milestone tests) )
  - [ ] add a timestamp ID to the database tables: Trace, TestResult. This is important to be able to track Trace uploads, and TestRuns over time. We will be then able to order them and show only the last test run by default.
  - [ ] add a dialog field where you can see timestamps of TestRun and another one for Traces Clicking on a specific dialog would load that test state.
    - [ ] whenever an older testrun/trace is selected there should be a badge - “this is not the latest test run”
- [ ] uploading new trace for the same user request
      CORE FEATURE - the main point of the app is to enable Test driven development (TDD). part of this is to make itterative improvoements to your code. User requests stay fixed and the traces change as you update your code and run the agent again.
  - [ ] design how the UI & UX should look like - make some FIGMA sketches (to be done). ideally there would be some nice UI for expressing a timeline of traces as they were uploaded (left to rigth) and test scores for each.
  - [ ] what is the minimal MVP of this?
    - [ ] some dialog box for looking at older traces
    - [ ] and some additional timeline plot which captures test evolution overtime.
      - how do you handle addition of milestones/tests overtime? we can’t simply track percentage passed, becasue as we add more tests, it may seem as performance has worsened, but test might have simply gotten more rigorous.
      - nevertheless, this might be fine for the time being. sbhow abolsute values: all milestones, milestones passed
        - maybe each milestone could have its own color
        - or for each test run we can show which milestones passed and which didn’t
