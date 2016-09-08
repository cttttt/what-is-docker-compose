# What is Docker Compose?

## Who Am I?

[Christopher Taylor](https://twitter.com/ctttttttttt)


## 0 `background`

- To "get" the following, it helps to know:
  - How to write software (duh).
  - How to make configurable software (see https://12factor.net/config)
  - How to run that software (not so duh).
  - As a stretch, how to setup a VM on which that software can run.

- If the first two points don't appeal to you, you'll be pretty bored during this talk.

## 0.1 `what.is.docker.again`

- A lot of things.
- Not all of the things.


## 0.1.1 `process.runner.extrordinare`

- Docker's great at running **processes**.
- For example, to get the version of `bash`, you could run:

```
bash -v
```

- Or you could run the same command using Docker:

```
docker run -ti ubuntu bash -v
```

> Docker is a **process** runner.


### 0.1.2 `...from.a.context`

- If Docker were just a command runner, that would be an aweful lot of overhead.
- One of Docker's core features is its ability to run a command from a known context: An image.
- What's an image?
  - Just a bunch of files.
  - Oh, and a bit of metadata.
- In fact, the `ubuntu` image is a bunch of files that make up a base Ubuntu Linux installation, plus a few extra facts, like the default `PATH`.
- Consider the previous example:

```
docker run -ti ubuntu bash -v
```

- Here, `ubuntu` is the image.
- When Docker runs `bash -v` it effectively copies all of the files in the image somewhere, and runs `bash -v` from that _context_.

> Docker provides a way to run **processes** from contexts, called **images**.


### 0.1.3 `...with.isolation`

- Docker is, at its core, a simplified interface to a bunch of features in Linux, called [Linux Containers](https://linuxcontainers.org), or LXC.
- The part of the LXC infrastructure that we exercised just now is actually quite old and pre-dates the container movement on Linux by at least few decades.
- `chroot` - Allows you to lock a process a sub-tree of `/`.
- Effectively set `/` for a process and its children.
- Docker employs many other features of LXC to provide isolation of the filesystem, as well as other subsystems:
  - Network sockets
  - Users
  - Groups
  - SE-Linux-style rights
  - Logging
- ...pretty much everything except for the kernel:  There's only one kernel.

> Docker provides a way to run **processes** from contexts, called **images** in isolated zones of execution called **containers**.


### 0.1.4 `docker.is.fast`

- Above, I mentioned that Docker sets up containers where processes run.
- Specifically, the starting point for a container is a copy of a bunch of files that make up an OS.
- _Copying a bunch of files_ is a slow operation.
- Docker employs a trick in the form of a special filesystem, a **union filesystem** to make this instantaneous.
- A `unionfs` is a bunch of filesystems, layered.

_TODO: Insert diagram here._

## 1.simple.apps

> Chris: Change branches to "simple.apps"

- Let's have a look at these three simple apps:
  - An app that produces data.
  - An app that consumes that data and renders it as a beautiful (time permitting) webpage.
  - An app