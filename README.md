# DIY

## Goal
- **Technical** :  Create a serverless game App that can use the maximum features of Forge
- **Admin**: Build Creative Canvas Using productivity Data, User will get more tools to build something by themselves if they have more atlassian data.

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
[Youtube](https://youtu.be/usEQRGRaISQ)

## Forge Features 
- Modules (JIRA, Confluence, Admin)
- UI (UIKit for Getting Started, Admin Using React CustomUI, App using static Resources
- Storage API
- Resolver , Bridge
- Permission (Scope, External CSS/JS, External Domains , Backend)
- Rest API(JIRA/Confluence)

## App Details
- App Id : 2f814a1d-b624-43ce-89a8-51d4c6677b01
- App Site : https://devsunleashed.atlassian.net/
- Distribution Link : https://developer.atlassian.com/console/myapps/2f814a1d-b624-43ce-89a8-51d4c6677b01/distribution
- Creds for Demo : Email : liner77937@octovie.com   Password : H@ck@123
- bitbucket repo : https://bitbucket.org/sandeepscet/devsunleashed-diy


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
- [Skeleton Picked up from my Another Project: Snake](https://bitbucket.org/sandeepscet/devsunleashed-hackathon)