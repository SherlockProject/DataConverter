# DataConverter
Short Node.js project to retrieve, convert and upload csv and xlsx data. 

The real action happens inside the app.js file. Here, a database connection is established, csv/ xlsx files from any location 
are retrieved, converted to json and uploaded to the database.

THINGS TO NOTICE IF YOU WANT TO RUN THIS CODE:
- node_modules are not included here, so you will have to run 'npm install' to install all the needed modules from
  the package.json once!
- username, password and datapath have been replaced by 'dummies'. Be sure to enter correct database username/ pw and a
  datapath before running the code - otherwise nothing exept errors will happen!
 
 
 Issue that one might want to fix: 
 - The xlsx converter produces JSON files, while the csv converter does not. Since the files are not needed, they should
   be deleted afterwards.
   
Changelog:

1.0 - Basic version uploaded
 
 
