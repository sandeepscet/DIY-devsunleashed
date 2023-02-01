# DIY

## Goal
- **Technical** :  Create a serverless game App that can use the maximum features of Forge
- **Admin**: Build Creative Canvas Using productivity Data, User will get more tools to build something by themselves if they have more atlassian data.

### Why
- Employees will try to maximize productivity to get more tools/blocks. They will focus on all aspects like documentation, stories, bugs, etc as per their set workflow. Using those (hard-earned) blocks, they will try to create something amazing. so they need to be productive and creative both. 
- Organizations/Teams can arrange competitions using this game.

### How
- Fetching Data from JIRA and Confluence using JQL/CQL. Since organizations have a different workflow, they can configure dynamic JQL/CQL on the admin screen and set the intial screen of the Game. 

## Features
- Create Your Own World using Physics engine
- Multiple Blocks/Tools in Canvas
- Color-Change/Deletion/Static position of Blocks
- Tools based on Atlassian Data
- Share Canvas Image
- Get Extra tools by Coupons(Help Collaboration + App Marketing)
- Admin Configuration Page for JIRA and Confluence Data
- Getting Started page for Admin


## Demo Video
- [Youtube](https://youtu.be/usEQRGRaISQ)

## Forge Features 
- Modules (JIRA, Confluence, Admin)
- UI (UIKit for Getting Started, Admin Using React CustomUI, App using static Resources
- Storage API
- Resolver , Bridge
- Permission (Scope, External CSS/JS, External Domains , Backend)
- Rest API(JIRA/Confluence)



## Install
### Getting Started
```
npm install
npx forge deploy
npx forge install
npm forge tunnel
```

### Admin Config
```
cd  static/admin
npm install
npm run start
```
### APP
```
cd  static/app
npx yarn install
npx yarn serve
```

## Future Scope
- [] Add Canvas image to JIRA story to track
- [] realtime add tools
- [] Consider bitbucket Commit and PRs (Seems limitation from Forge Side)
- [] Better UI

## Credit
- [matter.js](https://github.com/liabru/matter-js)
- [Typescript Boilerplare](https://github.com/VD39/typescript-webpack-boilerplate)
- [Forge Platform](https://developer.atlassian.com/platform/forge/)
- [Web Share API](https://web.dev/web-share/)
