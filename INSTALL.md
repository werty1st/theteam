Prepare Couchdb Database
========================

curl -X PUT http://127.0.0.1:5984/nightmanager


Upload Data
============

/nightmanager$ php convert_data.json.php -ftd


Upload CouchApp
===============

grunt push:dev