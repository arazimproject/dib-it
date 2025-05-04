<h1 align="center">
    <a href="https://arazim-project.com/dib-it/">🗓️ Dib It</a>
    <br />
    <img src="https://img.shields.io/badge/updated-2025-purple.svg">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
</h1>

<p align="center">
    <b>A schedule planning website for Tel Aviv University built with <a href="https://react.dev">React</a>, <a href="https://mantine.dev">Mantine</a> and <a href="https://firebase.google.com">Firebase</a></b>
</p>

<p align="center">
    📖 <a href="#usage">Usage</a>
    &nbsp;&middot&nbsp;
    💻 <a href="#developing">Developing</a>
    &nbsp;&middot&nbsp;
    🚗 <a href="#roadmap">Roadmap</a>
</p>

# Usage

The website should be pretty straight-forward.
To export your schedule to Google Calendar, click: "<span dir="rtl">ייצוא ל-Apple/Google Calendar</span>".
You will download an ICS file, which you can import to [Google calendar](https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop), [Apple calendar](https://support.apple.com/en-il/guide/calendar/icl1023/mac) (or most other calendars as well).

# Developing

To start developing Dib It, you need to follow these steps:

- Clone the repository and install the dependencies with `bun install` (or `npm install` or `yarn install`).
- Create a Firebase project and enable Google authentication and Cloud Firestore.
- Create a web app in the Firebase Console and put the configuration in `src/firebase.json`.
- Run a local development server with `bun run dev` (or `npm run dev` or `yarn dev`)

You are **highly encouraged** to send pull requests or feature requests!

# Roadmap

- [x] Schedule view
- [x] Google sync
- [x] Export to Google/Apple calendar
- [x] Show exam list/calendar
- [x] Show difference between exam dates
- [x] Suggest courses based on exam date
