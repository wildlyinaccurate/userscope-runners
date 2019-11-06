FROM mcr.microsoft.com/azure-functions/node:2.0-node12

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
    DISPLAY=:99.0

RUN apt-get update && \
    apt-get -f install && \
    apt-get -y install wget gnupg2 apt-utils libgconf-2-4 xvfb

COPY . /home/site/wwwroot

WORKDIR /home/site/wwwroot

RUN npm install

CMD [ "/home/site/wwwroot/start.sh" ]
