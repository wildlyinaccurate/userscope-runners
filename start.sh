#!/bin/bash
echo "Starting Xvbf..."
Xvfb :99 -screen 0 1280x800x24 -nolisten tcp &
echo "Starting Azure functions host..."
/azure-functions-host/Microsoft.Azure.WebJobs.Script.WebHost
