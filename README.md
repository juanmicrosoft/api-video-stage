# Video Stage API Service

This service provides storage for the video links that are associated with a Teams meeting.

It provides a CRUD interface to the list of links.

## Platform Requirements

This service runs on Azure functions and uses CosmoDB as the backend storage.

## Development

The following are the prerequisites:

- yarn
- choco install azure-functions-core-tools-3

You can use 

### Sample local.settings.json

You need to place a local.settings.json in the root of the directory

```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "NODE_ENV": "development",
    "CosmosKey": "[INCLUDE_CONNECTION_STRING_HERE]"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*"
  }
}
```


