# restaurant-reservation

## Overview

A web application for accepting and managing reservations.

## Description

Reservation data is displayed in calendar format so that availability is easy to see.  
The user selects a vacant place on the calendar and makes a tentative reservation.  
Automatically send an email when the tentative reservation is completed.  
The administrator logs in to confirm, cancel, edit, or cancel the reservation.

## Demo

<!-- ## VS. -->

## Requirement

- "firebase": "^8.9.0",
- "vue": "^2.6.11",
- "vue-plugin-load-script": "^1.3.2",
- "vue-router": "^3.2.0",
- "vuetify": "^2.4.0"

## Usage

Log in to the management screen

```
http://localhost:8080/register
```

Reservation page

```
http://localhost:8080/
```

## Install

The following work is required before installation.

- Create a project in Firebase
- SendGrid account creation and ApiKey creation

1. Get source code

   ```
   git clone git@github.com:t-aono/vote-graph.git
   ```

2. Copy .env-example to create .env and set environment variables for your Firebase project and SendGrid ApiKey.

   ```
   cp .env-example .env
   ```

3. Add package.

   ```
   yarn
   ```

4. Start local development environment.

   ```
   yarn run serve
   ```

<!-- ## Contribution -->

<!-- ## Licence -->

## Author

[t-aono](https://github.com/t-aono)

<!-- README.md Sample -->
<!-- https://deeeet.com/writing/2014/07/31/readme/ -->
