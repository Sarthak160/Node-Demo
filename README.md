Sample node.js and postgres note taking application.

## Run the application: 
sudo docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword --rm -p5432:5432 postgres:alpine

node server.js

## Usage

curl http://localhost:3000/notes

curl -X POST -H "Content-Type: application/json" -d '{"title": "Sample Note 2", "content": "This is a sample note 2."}' http://localhost:3000/notes

curl -X PUT -H "Content-Type: application/json" -d '{"title": "Updated Title", "content": "Updated content for the note."}' http://localhost:3000/notes/1

curl -X DELETE http://localhost:3000/notes/1