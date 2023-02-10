# Simple example of CloudTask queue

Code overview:

`code/functions/src/simpleCloudTask/`:

- `simpleProducer` - scheduled Function, generates messages and send them to CloudTask queue

- `simpleCloudTask` - http-based Function, which processes tasks from CloudTask queue

`code/functions/src/utls/`:
- `getFunctionUrl` - Functions v2 doesn't have a convenient way to get function's url, which is 
necessary for CloudTask to be able to send task to it. So that function was added.
- `parseMessage` - parse task from CloudTasks Queue
- `initTaskQueue` - init connection to existing or create new CloudTask Queue

### Commands
fix style:
```bash
npm run lint-fix 
```

deploy functions:
```bash
firebase deploy --only functions
```