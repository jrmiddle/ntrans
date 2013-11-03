# ntrans

## What

ntrans is an experimental transcoder.  The general idea is to provide
a service which accepts a URL, an operation, and some parameters
in a GET request, performs the request, applies the operation to the request,
and then provides result of the operation.

The initial impetus for this is to provide a loosely-coupled image scaling
service for source assets that are to be rendered on multiple media types.

## How

### Install and run the server:

1. Install node and npm (if you use homebrew, this is as simple as `brew install node`)
2. Install dependencies: `npm install`
3. Run the server: `node index.js`

### Make a request

  `curl "http://localhost:8888?u=https%3A%2F%2Fwww.google.com%2Fimages%2Fsrpr%2Flogo11w.png%0A&o=fit&p=100x100" > google_small.png`
  `open google_small.png`

## Issues

This is so not production code.  Please be aware:

### Robustness

1. Problems with the URL will often crash the server; I'm doing very little in terms of responsible
URL handling, aside from avoiding remote execution.

2. Other stuff.  Lots.

### Scalability

1. The node-imagemagick module forks a child process to perform the convert operation.  This totally makes sense
from the perspective of providing complete API access, as ImageMagick has a bazillion options, and providing that
breadth of functionality via libmagick++ would be a ton of work.  Nevertheless, a high-performance solution would
probably provide narrower functionality in-process.

2. There's no fancy work queueing aside from what node's http{,s}.{request,response} classes, and the kernel, provide.

I picture a world where we cluster in-process transcoders, and front them with an external caching mechanism.  That world is not the current world.


## License

MIT.  Go nuts, donuts.


## Contributing

Pull requests welcome.  This is a pet project in very early stages, however, so don't feel bad if I don't take them.

Suggestions welcome.  This is the first javascript I've written since 1998, and to date my node experience chalks up to about 16 hours.

Jokes welcome.  I don't get out much, but am always up for a good yuk.
