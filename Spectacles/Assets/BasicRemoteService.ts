@component
export class BasicRemoteService extends BaseScriptComponent {
    @input
    remoteServiceModule: RemoteServiceModule;
    onAwake() {
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.url = 'https://catfact.ninja/facts'; // Set the URL for the request
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get; // Set the HTTP method to GET

        // Perform the HTTP request
        print("Performing http request");
        this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
            if (response.statusCode === 200) {
                // Check if the response status is 200 (OK)
                print('Body: ' + response.body);
            }
            else {
                print("Request failed")
            }
        });
    }
}
