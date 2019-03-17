# CloudVision

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.6.

## Prerequisites
* If you don’t already have one, create a
    [Google Account](https://accounts.google.com/SignUp).

### Cloud Functions

* Create a Developers Console project.
    1. Install (or check that you have previously installed)
        * [`git`](https://git-scm.com/downloads)
        * [`node` and `npm`](https://nodejs.org/en/)
        * [Firebase console](https://firebase.google.com)
    2. [Set up Node.js and Firebase CLI](https://firebase.google.com/docs/functions/get-started)
    3. [Api Reference](https://firebase.google.com/docs/reference/functions/)

### Google Cloud API

* Create a Developers Console project.
    1. Install (or check that you have previously installed)
        * [Google Cloud SDK](http://cloud.google.com/sdk/)
    2. [Vision Api](https://cloud.google.com/vision/)
    3. [Enable Project Billing](https://support.google.com/cloud/answer/6293499#enable-billing)

### Angular material
* [Incorporate Angular Material](https://material.angular.io/guide/getting-started)

## Firebase Instructions

* Create Firebase project and config.
    1. Copy firebase api key into `environment.ts` and `environment.prod.ts`
    2. Install Firebase `npm install firebase`
    3. Init functions `firebase init functions`
    4. Change directory `cd functions`
    5. Install google cloud vision `npm i @google-cloud/vision`
    6. Get the bucket name in Firebase storage and copy it in variable bucket name in `functions/src/index.ts`
    7. Activate billing plan

## Install Dependencies

Run `npm install` to install all the dependencies of the project. Npm will automatically download the libraries.

 * Angular Firebase -> `npm install firebase @angular/fire --save`
 * Image cropper -> `npm install ngx-image-cropper`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
