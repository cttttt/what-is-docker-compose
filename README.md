# What is Docker Compose?

## Who Am I?

Christopher Taylor 
~ [@ctttttttttt](https://twitter.com/ctttttttttt)

```








































```

## 0 `background`

- To "get" the following, it helps to know:
  - How to write software (duh).
  - How to make configurable software (see https://12factor.net/config).
  - How to run that software (not so duh).
  - As a stretch, how to setup a VM upon which that software can run.

- If the first two points don't appeal to you, you'll be pretty bored during this talk.  Sorry.

```








































```
## 0.1 `what.is.docker...again`

- A lot of things.
- Not all of the things.


### 0.1.1 `process.runner.extraordinaire`

- Docker's great at running **processes**.
- For example, to get the version of `bash`, you could run:

```
bash -v
```

- Or you could run the same command using Docker:

```
docker run ubuntu:14.04 bash -v
```
```































```

> Docker is a **process** runner.

```














































```

### 0.1.2 `...from.a.starting.point`

- If Docker were just a command runner, that would be an awful lot of overhead.
- One of Docker's core features is its ability to run a command from a known starting point: An image.
- What's an image?
  - Just a bunch of files.
  - ...and a bit of metadata.
- In fact, the `ubuntu` image is a bunch of files that make up a base Ubuntu Linux installation, plus a few extra facts, like the default `PATH`.
- Consider the previous example:

```
docker run ubuntu:14.04 bash -v
```

- Here, `ubuntu` is the image.
- When Docker runs `bash -v` it effectively copies all of the files in the image somewhere, and runs `bash -v` from that _starting point_.

```


































```
> Docker provides a way to run **processes** from starting points, called **images**.


```













































```

### 0.1.3 `...with.isolation`

- Docker is, at its core, a simplified interface to a bunch of features in Linux, called [Linux Containers](https://linuxcontainers.org), or LXC.
- The part of the LXC infrastructure that we exercised just now is actually quite old and pre-dates the container movement on Linux by at least few decades:
- `chroot` - Allows you to lock a process to a sub-tree of `/`.
- Effectively set `/` for a process and its children.
- Docker employs many other features of LXC to provide isolation of the filesystem, as well as other subsystems:
  - Network sockets
  - Users
  - Groups
  - SE-Linux-style rights
  - Logging
- ...pretty much everything except for the kernel:  There's only one kernel.

```










































```

> Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.


```













































```

### 0.1.4 `docker.is.fast`

- Above, I mentioned that Docker sets up containers where processes run.
- Specifically, the starting point for a container is a copy of a bunch of files that make up an OS.
- _Copying a bunch of files_ is a slow operation.
- Docker employs a trick in the form of a special filesystem, a **union filesystem** to make this instantaneous.
- A `unionfs` is a bunch of filesystems, layered.

- Consider the complicated diagram below.
  - The process on the right is **bound to** the container.  Anything it does is isolated, including file writes.
  - The isolated filesystem in a Docker container is layered.
  - The bottom layer is a reference to an image.
  - New files are simply written to the topmost layer.
  - Modified files are **copied** to the topmost layer.
  - Modifying a file twice just modifies it again in the top-layer.
  - aka: Copy-on-write.
  - Reads happen by trying the layers from top to bottom.

```
.----------------------.
| container:           |<---------.
|    name: fancy_pansy |          | bound to
|                      |          |
| isolated disk:       |       .--|-------------------------.
|                      |       |                            |
|  .-----------------. |       |  process: /usr/bin/bash    |
|  | new layer   <----<writes>---          ^                |
|  |                 | |       '-----------|----------------'
|  |                 | |                <reads>
|  |            ---------------------------|
|  |    |            | |                   |
|  .----|------------. |                   |
|       |              |                   |
'-------|--------------'                   |
        |                                  |
 <next layer below>                        |
        |                                  |
.-------|--------------.                   |
|  .----|------------. |                   |
|  |    v            | |                   |
|  | image:          | |                <reads>
|  |   ubuntu:14.04  | |                   |
|  |                 | |                   |
|  |            ---------------------------'
|  |  /usr/bin/bash  | |  
|  |  tonnes of files| |  
|  |                 | |  
|  '-----------------' |  
'----------------------'  
```

- Now, let's add another container:  Notice that multiple **isolated filesystems** can point to a single image.


```
.----------------------.
| container:           |<---------.
|    name: fancy_pansy |          | bound to
|                      |          |
| isolated disk:       |       .--|-------------------------.
|                      |       |                            |
|  .-----------------. |       |  process: /usr/bin/bash    |
|  | new layer   <----<writes>---          ^                |
|  |                 | |       '-----------|----------------'
|  |                 | |                <reads>
|  |            ---------------------------|
|  |    |            | |                   |
|  .----|------------. |                   |
|       |              |                   |
'-------|--------------'                   |
        |                                  |
 <next layer below>                        |
        |                                  |
.-------|--------------.                   |
|  .----|------------. |                   |
|  |    v            | |                   |
|  | image:          | |                <reads>
|  |   ubuntu:14.04  | |                   |
|  |                 | |                   |
|  |            ---------------------------'
|  |  /usr/bin/bash  | |  
|  |  tonnes of files| |  
|  |^   ^            | |  
|  '|---|------------' |  
'---|---|--------------'  
    |   |
    |   |
    | <next layer above>
    |   |
    |	| .----------------------.
    |	| | container:           |<---------.
    |	| |  name: footsy_wootsy |          | bound to
    |	| |                      |          |
    |	| | isolated disk:       |       .--|-------------------------.
    |	| |                      |       |                            |
    |	| |  .-----------------. |       |  process: /usr/bin/bash    |
    |	| |  |             <----<writes>---          ^                |
    |	| |  |                 | |       '-----------|----------------'
    |	| |  | new layer       | |                   |
    |	'--------              | |                <reads>
    |	  |  |                 | |                   |
    |	  |  |            ---------------------------|
    |	  |  |                 | |                   |
    |	  |  '-----------------' |                   |
    |	  |                      |                   |
    |	  '----------------------'                   |
    |                                             <reads>
    |                                                |
    '------------------------------------------------'
```

```











































```

> Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.  Containers each have an isolated filesystem created by merging an image directory and an empty directory using a **union fs**.

```















































```

## 0.1.5 `starting.point.saver`

- Docker will always run commands in an environment that starts from _the given image_.

```
$ docker run ubuntu:14.04 touch /tmp/newfile
$ docker run ubuntu:14.04 ls -l /tmp/newfile
ls: cannot access /tmp/newfile: No such file or directory
```

- To make a new starting point, run `docker commit`:

```
$ docker run ubuntu:14.04 touch /tmp/newfile
$ docker ps -l
CONTAINER ID ...
b929e7eb9bf5 ...
$ docker commit b929
sha256:8993124434b105f661d4700d010bd815ae570665d0306a09dd150aeac90b6f96
$ docker run 8993 ls -l /tmp/newfile
-rw-r--r-- 1 root root 0 Sep 15 01:29 /tmp/newfile
```
```












































```
> Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.  Containers each have an isolated filesystem created by merging an image directory and an empty directory using a **union fs**.  New images can be created by **committing** containers.

```



































```

## 0.1.6 `starting.point.builder`

- Creating images in this way is slow and tedious.
- Docker provides an image builder, `docker build`.
- `docker build`'s pretty simple:  It reads a file full of directives.
- Outside of a few exceptions, after each directive, the builder will _commit_ a new image and remove the container that led to it.
- When all of the directives are done, you got your final image.

```
# Create a Dockerfile:
cat > Dockerfile <<DOCKERFILE
FROM ubuntu:14.04
RUN touch /tmp/newfile
DOCKERFILE

# Build the Dockerfile:
docker build -t cttttt/result .

# Run a container from your new image:
docker run cttttt/result ls -l /tmp/newfile
```
```


























































```


> Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.  Containers each have an isolated filesystem created by merging an image directory and an empty directory using a **union fs**.  New images can be created by **committing** containers.  A **docker build** is an automated sequence of container creations and commits that also results in a new image.


```








































```

## 0.1.7 `network.isolation`

- Containers have a full set of free ports to listen on.
- Within a container, only one process can listen on any given port, say `8080`.
- However, a process in another container can simultaneously listen on the same numbered port...they're in different containers.
- This is handy:  For example, we could listen on port `8080` in **every container** if we want to.

```
# Create a Dockerfile:
cat > Dockerfile <<DOCKERFILE
FROM ubuntu:14.04
RUN apt-get update && apt-get install -y netcat
DOCKERFILE

# Build the Dockerfile:
docker build -t cttttt/netcat .

# Run a container from your new image:
docker run -d cttttt/netcat nc -l 8080
docker run -d cttttt/netcat nc -l 8080
```

- To have Docker tunnel traffic from a port on the host to a port in a container, use `-pHOST_PORT:CONTAINER_PORT`.

In one terminal, run:
  
```
docker run -ti -p 30303:8080 cttttt/netcat nc -l 8080
``` 

And in another, run:
  
```
nc localhost 30303
```

```














































```

> Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.  Containers each have **network and filesystem** isolation.  The isolated filesystem is created by merging an image directory and an empty directory using a **union fs**.  New images can be created by **committing** containers.  A **docker build** is an automated sequence of container creations and commits that also results in a new image.

```




























































```  
# 0.1.8 `isolated.network`

- Above, we set up routing allowing us to connect to a container from the host.
- Container-to-contain communication is also allowed.
- A year ago, this was sort of hacky (unidirectional links), but now you can create *virtual networks*.

To create a network, run `docker network`:

```
docker network create demo
```

Then you can run a server:

```
docker rm -f ncserver
docker run --network=demo --name=server -t cttttt/netcat nc -l 8080
```

...and in another terminal, run a client:

```
docker run --network=demo -ti -p 8080 cttttt/netcat nc server 8080
```

```

























































```
# 0.1.9 `summary`

> * Docker provides a way to run **processes** from starting points, called **images** in isolated zones of execution called **containers**.  
> * Containers each have **network and filesystem** isolation.  
> * The isolated filesystem is created by merging an image directory and an empty directory using a **union fs**.  
> * New images can be created by **committing** containers.  
> * A **docker build** is an automated sequence of container creations and commits that also results in a new image.  
> * Docker also allows the creation of **virtual networks**.  Containers bound to a virtual network each have a hostname corresponding to the container name and can communicate freely.

```










































```

## 1 `simple.apps`

Let's take a diversion from all this Docker stuff.

> _Chris: Change branches to "simple.apps"_

- Let's have a look at these three simple apps:
  - **Tweet API**, an app that produces data: `/api/tweet`.
  - **Tweet UI**, an app that consumes that data and renders it as a beautiful webpage: `/tweet.html`.
  - **Tweet Text UI** An app that consumes that data and renders it as plain text `/tweet.txt`.

```





















































```

## 2.1 `running.the.api`

To configure the Tweet API:

- Install `node` and `npm` ... somehow.
- Create [a new Twitter app](https://apps.twitter.com/).
- From the app dashboard, click on the _Keys and Access Tokens_ tab and click on the button to _Generate Access Tokens_.
- Run the following commands, taking the values from the app dashboard:

```
export CONSUMER_KEY=...
export CONSUMER_SECRET=...
export TOKEN=...
export TOKEN_SECRET=...
export PORT=8080
```

To run it:

```
cd tweet-api
npm install
node .
```

To try it out:

```
curl http://localhost:8080/api/tweet | json_pp
```

```
















































```

## 2.2 `running.the.tweet.text.ui`

To configure the tweet text UI, **in a new terminal**, run:

```
export TWEET_API_URL=http://localhost:8080/api/tweet
export PORT=8081
```

To run it:

```
cd tweet-text-ui
npm install
node .
```

To try it out:

```
curl http://localhost:8081/tweet.txt
```

```












































```

## 2.3 `running.the.tweet.ui`

To configure, and run the tweet UI, **in yet another new terminal**, run:

```
export TWEET_API_URL=http://localhost:8080/api/tweet
export PORT=8082
cd tweet-ui
npm install
node .
```

To test, browse to http://localhost:8082/tweet.html.

Cool, eh?

```

































```

## 3 `run.them.in.docker`

> _Chris: Change branches to "use.docker"_

- Running the apps above was a bit of a task.  It required:
  - Reserving ports.
  - Multiple windows.
  - Setting environment variables here (API url) based on values there (port number of the API).
- But we have Docker.

> _Chris: Show folks those new Dockerfiles_

> _Chris: Show folks the `run` script_

This script is difficult to maintain:  It mixes data and code.

```








































```

## 4 `describe.the.topology`

> _Chris: Change branches to "describe.the.topology"_

- Remember that script, `run`?
- It describes a topology, but with code.
- Let's pull the data out.

See `docker-compose.yml`.

- What if there was a way to harness the information in this file to perform the actions from `run`?

```











































```

## 5 `docker.compose`

- With `docker-compose`, this data file is all you need.
- To build images:

```
docker-compose build
```

- To start all of the services:

```
docker-compose up
``` 

- To start services in the background:

```
docker-compose up -d
```

```























































```


## 6 `add.a.load.balancer`

> _Chris: Checkout "add.a.load.balancer"_

- Notes:
  - New container, `nginx`.
  - See the `nginx.conf`:  Notice domain names.

```




















































```
## 7 `thats.really.it`

- That's really all there is to it.
- `docker-compose` makes it a little easier to describe a topology.
- Armed with this data, `docker-compose` does all the work!




```



















































```

## 8 `tbc?`

- Scaling up services; a few problems.
- Service discovery: `consul`.
- Nginx hacks to force DNS lookups.
- Scaling up services...is super cool.





vim:expandtab:shiftwidth=2:softtabstop=2
