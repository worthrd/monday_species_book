## Overview

This is the "Species Book Integration"  Monday app.

## Install

1. Using flask and postgres docker images and directly run app

* `docker network create con`
* `docker run -d --name species-api -p 5000:5000  --network=con worthrd/species-api`
* `docker run -d --name species -p 5432:5432 --network=con worthrd/postgre-db:2`
* `npm run server`

    **NOTE:In this scenario NodeJS has to be installed in the host machine and it hast to be bring `https://monday-integration-10029358.loca.lt` **


2. Use docker-compose file in the project

    `docker compose up`
    
3. Test

     `curl -X GET "http://localhost:5000/search?name=Caretta"`
  
     If some data comes after curl request flask&postgres are healty.  
     
     





