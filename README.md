![app](https://user-images.githubusercontent.com/37235516/233956215-2261e862-f8c6-4551-b786-0dfb240b6f81.jpg)

# Restaurant Aggregator
This repository contains the source code of a restaurant aggregator application.

## Requirements

* [NodeJS](https://nodejs.org/en/download "NodeJS")
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)
* [Twillio Account (Optional)](https://www.twilio.com/en-us)

## Overview
* This restaurant aggragator application is a server side app built using nodejs.
* There are 3 types of users who can use this application. 
  * Admin
  * Restaurant. 
  * Customers.
* The application exposes a set of APIs including signup and login for multiple restaurants and customers. On completing registration the customers can view the all the restaurants registered and their menus. Customers can place orders with any restaurant for the available food in thier menus. The resturants and customers can individually track their active and delivered orders. All The APIs are securred by the user role using the jwt auth tokens.

## Environment Variables

Clone the repo and create a .env file with all the secrets highlighted in bold.
* **ACCESSKEY** for jwt token
* **SID** and **APIKEY** for Twillio Account
* **Mobile** Twillio Phone number

## Docker Containers
The dockerfile in the repository creates an ubuntu container and installs the nodejs, typescript and copies all the required project's source code file. The dockerfile is a template to create an image for the nodejs restaurant aggregator app. The app requires mongodb as a database and uses redis as an in-memory data store. A seprate container for mongodb and redis will be provisioned with the help of docker-compose.yml file in the repository. The app will require all the 3 contianers running
 * Nodejs App contianer
 * Mongodb container
 * Redis container

## Run the docker containers with docker-compose
To Run the application, use the below command to start all the 3 docker containers.


```sh
docker-compose -up --build -d
```
Use the below command to check if all the 3 containers have started successfully. 
```sh
docker ps -a
```
Use the API collection to test different APIs.


