

Vibe Coding Meta Constraints

1) We provide a context and instruction to guide LLM strategies. This is ours:

1) Overview:

We're building a social place sharing app ultimately, with playful game like aspects, encouraging participants to submit their own tiny games and challenges. Serendipitous local geographic discovery is the goal.

2) General code goals:

	- mobile focused, web app, used geolocation
	- react based but with maps and 3d elements

3) Code tool choices:

	- nodejs server/client, es6, typescript
	- spa app
	- react, vite, tailwind, typescript
	- shadcn
	- supabase
	- threejs for 3d art elements
	- leaflet for maps
	- ethereum for some public ledger state
	- deploy as a docker to google cloud

	- firebase for authentication?
	- public ledger authentication?

4) Code philosophy:

	- modular; split components and code
	- responsive, web and mobile layout
	- use system light/dark mode always
	- proxy all db access via nodejs server api
	- vertical slice development; a bit of everything at once, a bit of backend, a bit of api, a bit of front end talking to that api and so on 
	- 

5) UX philosophy:

	- minimal, black and white ux to start
	- box layouts to start; no aesthetics
	- wiki like -> content has slugs and urls

Vibe Tools that are useful and general tips:

https://replit.com

https://v0.dev/

https://www.reddit.com/r/ClaudeAI/comments/1kivv0w/the_ultimate_vibe_coding_guide/

https://dev.to/wasp/a-structured-workflow-for-vibe-coding-full-stack-apps-352l

https://natesnewsletter.substack.com/p/the-vibe-coding-bible-how-to-build

https://lovable.dev/blog/what-is-vibe-coding

https://medium.com/madhukarkumar/a-comprehensive-guide-to-vibe-coding-tools-2bd35e2d7b4f

https://aider.chat/docs/usage/conventions.html


12) A wiki like pattern may be a good foundation concept:

	- a wiki like pattern with documents on slug paths seems reasonable

	- 'documents' can be all kinds of things, groups, entities and so on

	- documents can even be behaviors; can be intelligent agents; like roblox

	- flexibility around presentation of each document

	- in which case a group is like a game level or room or zone or layer

13) Groups, Rooms, Levels, Spaces, Zones

	- create groups or leagues or teams, basically forums of some kind
	- and post into those areas, effectively into that "layer"
	- and posts should be very rich; game-like - really more like "entities"
	- and participants need to be deputized over a group
	- later we can worry about public ledgers and so on


14) Basic entities have a common core
	- slug
	- title
	- descr
	- created
	- updated
	- tags
	- type
	- subtype
	- sponsor
	- parent

15) review

	- a place based game like experience focused on portland oregon
	- is web based, using javascript, node, html
	- uses a pubsub backbone for game loop state broadcasting
	- uses an event driven game loop, a bit different from a react app
	- has as strong geographical place based focus
	- is wiki-like; documents or entities have file-like slugs or urls
	- will have networking, and permissions attached to slug paths
	- working title? 'night-city' or 'thedirt' or 'thevibe' or other?












