
# Frontend

[![Build Status](https://dev.azure.com/theazurechallenge/Kubernetes/_apis/build/status/Code/Azure.azch-frontend)](https://dev.azure.com/theazurechallenge/Kubernetes/_build/latest?definitionId=17)

A containerised Express/NodeJS app that periodically queries the Order Capture API to retrieve the total number of orders.

## Usage

## Environment Variables

The following environment variables need to be passed to the container:

### Capture Order Service IP

```
ENV CAPTUREORDERSERVICEIP=<public IP/hostname of capture order service>
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
