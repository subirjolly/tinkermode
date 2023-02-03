### Running Instructions
```
yarn
npm i -g ts-node
ts-node index.ts
```

### Explanation
I chose to use streaming and using chunks instead of processing the entire response at once. Because of the memory constraints, this might be the closest to the best solution. The code would have been a lot simpler if I just chained `then` and processed all the lines in the last then. This solution took around 30 minutes to code but the memory was growing rapidly if I had used a larger data-set. I was taking way longer to finish the execution of the code as well.
This approach on the other hand, is a lot faster and is considerably reliable. There's an assumption I made. The assumption is that the data will not be fomatted badly. The other one(given) was that the data is in sorted by time order.