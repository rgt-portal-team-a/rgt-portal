#!/bin/bash
cd /home/site/wwwroot
echo "Starting app installation" > /home/LogFiles/startup.log
npm install --only=production >> /home/LogFiles/startup.log 2>&1
echo "Starting application" >> /home/LogFiles/startup.log
npm start >> /home/LogFiles/startup.log 2>&1
