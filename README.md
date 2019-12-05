# UserScope Runners

A collection of Azure functions that run the tests for UserScope.

## Building the image

```
npm install
docker build --tag wildlyinaccurate/a11y-report-runners .
```

## Running the image

```
STORAGE_ACCOUNT_NAME=xxxxx
STORAGE_ACCOUNT_KEY=xxxxx
COSMOSDB_CONNECTION_STRING=xxxxx
docker run --rm --publish 8080:80 --interactive --tty \
    --env AzureWebJobsStorage="DefaultEndpointsProtocol=https;AccountName=$STORAGE_ACCOUNT_NAME;AccountKey=$STORAGE_ACCOUNT_KEY;EndpointSuffix=core.windows.net" \
    --env COSMOSDB_CONNECTION_STRING="$COSMOSDB_CONNECTION_STRING"
    wildlyinaccurate/a11y-report-runners
```
