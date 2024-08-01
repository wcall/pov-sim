# 🚀 POV Flight Simulator 🚀

Welcome to the POV Flight Simulator.

This repo holds the starting points for you to complete the assigned tasks.

# Links
- [POV Sim spreadsheet](https://docs.google.com/spreadsheets/d/1NjyNKgT0HVhAmHKodApmUdZshkA_ccwRApL3aE1Hw8M/edit?gid=2099201327#gid=2099201327)

# About

Included in this repo are uninstrumented sample applications that serve as starting points for you to add instrumentation as specified in the instructions of select tasks.

The following applications, which are configured to run in Docker containers, expose identical API interfaces but are implemented in different languages:
- `flight-app-js` - Express.js backend application
- `flight-app-py` - Python Flask backend application

# Getting Up and Running

## Prerequisites
- Install [Docker](https://docs.docker.com/engine/install/) on your local machine

## flight-app-js
From the `flight-app-js` directory:
- Build the app
    - `make build`
- Run the app
    - `make run`
- Alternatively, use a single command to both build and run the app:
    - `make start`

The app should now be up and running at http://localhost:3000/

Navigate to http://localhost:3000/api-docs/ to view the API interface and make requests

## flight-app-py
From the `flight-app-py` directory:

- Build the app
    - `make build`
- Run the app
    - `make run`
- Alternatively, use a single command to build and run the app
    - `make start`

The app should now be up and running at http://127.0.0.1:5000/

Navigate to http://127.0.0.1:5000/apidocs/ to view the API interface and make requests
