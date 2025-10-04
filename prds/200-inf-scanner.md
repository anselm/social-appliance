# Wiki concepts, namespaces, manifests and database queries

## Design constraints

There are a few design constraints that come up due to different user stakeholder requirements:

1) From the "application user" perspective this application is driven by user requests for discrete data objects, similar to a file system or a wiki. A user asks for "/hiking" and sees some information (such as a discussion group) related to hiking - following a principle of least surprise, and well defined urls that make sense. There is of course a curation role in making sure that the namespace formed out of user requests is sober and matches user expectations.

2) From the perspective of a "content creator" we want to encourage users to be able to use an ordinary file-system to describe their data. We don't want to force users to have to use a web based interface.

## .info files

We allow users to use the filesystem to describe the files and assets they want to present, the filesystem maps 1-to-1 to the urls.

How it works:

- **URL Requests map to files and folders** - if a path is not found in the read-through client side cache, then we do an ordinary http request using es6 fetch (which is built into javacript today) to attempt to fetch a .info file on the matching path. A url request for "/hiking" will first attempt to resolve on the client side cache, but if not found then it will attempt to read through to the file-system using fetch("/hiking/.info.js") - noting that of course these are actually in "public/" because http requests are anchored on the public folder in svelte and other frameworks. These .info.js files can be kept in the root public folder or in child folders, and contain exports that are added to the database. The system is smart enough to never try to fetch "/hiking/.info.js" twice. Once we've attempted to fetch that once (given a cache miss) then we can try again - and while the request may still fail if no .info.js file is found, we've at least allowed an opportunity for the content creator to specify how to handle the request - effectively turning the filesystem into a database.

- **Preloading** - we always load the /.info.js file at startup. Any given .info.js can declare arbitrary objects, and this can help seed the state of the system. It's important to note that any freshly loaded .info.js will overwrite previously cached objects with matching ids.

- **Entity Declaration** - loading a .info.js file simply submits each exported object found in the file as an ordinary entity creation event. Illegal entities will still be rejected. Entities may need to have valid slugs for example.

- **Arrays** - The .info.js can consist of individual exports of objects, arrays of objects and/or default exports - all of which are treated as "entities to import".

- **js** - Note that we use .js instead of .json because it gives us more flexibility to dynamically compose exports.

- **tracing from root** - if our first request is for a child path such as /anselm/projects/2024 - we have to trace down from the root, first fetching /.info.js then /anselm/.info.js then /anselm/projects/.info.js and so on ... because we need to make sure we manufacture all objects 'in between' - rather than skipping to the leaf.

- **read through strategy** - If we're not in a serverless mode, then the read-through cache should always first try get the file at path/.info.js - because we may have a stub or partial content, then  try the client side state cache, and then if that all fails can go to the server if any... so the read through strategy should remain similar to before, except now we are shifting the reading of .info.js files to be dynamic rather than done once at the start...

- **hinting** - Because children won't be visible to the root, you'll often end up declaring content twice for now - later on let's introduce a dynamic load hint - so importing one .info.js can fetch some other related ones... 

## Example Directory structure

```
client-svelte/public/data/
├── .info.js                    # Homepage content
├── anselm/
│   ├── projects/               # Development work
│   │   └── 2024/
│   │       └── project-name/
│   │           └── .info.js
│   ├── images/                 # Photography & visual work  
│   │   └── 2024/
│   │       └── photo-series/
│   │           └── .info.js
│   └── words/                  # Essays & writing
│       └── 2025/
│           └── essay-title/
│               └── .info.js
```
