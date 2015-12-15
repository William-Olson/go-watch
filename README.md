## go-watch

A simple file watcher (much like [c-watch](https://github.com/William-Olson/c-watch) only for golang) that will build and run your go package on changes.  Suitable for fast sketches of go programs that don't take any user input other than console arguments.

## Install

```
npm install -g go-watch
```

### Run
help menu:

```
go-watch -h
```

outputs:

```
   Program Options:
    -s    :   src files to watch for changes (relative to $GOPATH/)
    -b    :   build path relative to $GOPATH/src (for 'go install ...')
    -r    :   runner name for binary file produced ($GOPATH/bin executable)
    -p    :   params to pass to the runner
    -h    :   display this help menu

```

#### Example

```
go-watch -s 'src/github.com/William-Olson/hello/*.go' -b 'github.com/William-Olson/hello' -r hello
```

This example demonstrates running go-watch with a hello world program (based off of [golang.org](https:golang.org/doc/code.html#Workspaces) example).  This example would have the following stucture in the `$GOPATH`/ directory...

```
$GOPATH/
    bin/
      hello   # gets created when you run go-watch (specified with -r flag)
    pkg/
      # this directory gets auto-populated as well for builds
    src/
      github.com/
        William-Olson/
          hello/
            hello.go   # the src code
```
