
# MVP PRD for a general purpose 'social appliance'

## Server Side Architecture Principles

Server design choices:

- Strong back end api focus
- API-first design with clean separation of concerns
- DRY, modular, granular
- API can be run with or without http being present; import and use directly if desired
- The API exposes data objects, sometimes synthetic, and does permission based access to them.
- The server exposes a formal api wall; hiding all internals
- The api abstracts all queries, reads, writes, permissions
- The actual database should not be exposed in any way (should be able to switch between mongo and postgres)
- We will want shell based regression tests of the api
- The api itself separate from the http exposed wrapper for the api; can be used from console

## Data design choices

The application will ultimately be a stack of capabilities, each conceptual layer built as an emergent capability on top of capabilities of underlying layers. For example at a high level we will want strong social group concepts, but at a low level we're focused on simply defining individual users and allowing a capability for them to have relationships to one another. Here we're focusing on the very bottom and asking questions like "What are the fundamental building blocks on which we will build higher level concepts?" Because there are a lot of unknowns later on, we have to have a very flexible open approach early. This is the approach:

1) ENTITIES. A concept of an 'entity' is used for all objects. All of these entities are stored in one table, making it easier to relate them to each other. There are variations of entities but all entities share several common base fields including a type field that indicates if they are describing a 'user' or a 'group' or other concepts. A common set of core properties allows for common manipulations such as rendering any entity at least crudely within a layout or view. For durable storage (such as postgres or mongo) we use a beefy base class pattern (or some call it an anti-pattern). This is a core set of properties:

const EntityTypes = {
  POST: "post",
  PARTY: "party",
  AGENT: "agent",
  PLACE: "place",
  THING: "thing",
  GROUP: "group",
  // there can be many more types
} as const;

export interface Entity {
  id: string
  slug?: string
  type: string
  auth?: string             // reserved - will flesh out later
  permissions?: string[]    // reserved - will flesh out later
  address?: string          // public key of sponsor
  contract?: string | null  // reserved
  sponsorId?: string        // the entity id of the party of the sponsor
  parentId?: string         // a parent relationship (this concept overrides relationship table)
  title?: string
  content?: string
  depiction?: string
  tags?: string[]
  view?: string
  latitude?: number | null
  longitude?: number | null
  radius?: number | null
  begins?: string | null
  ends?: string | null
  createdAt: string
  updatedAt: string
  metadata?: any
}

Note: Right now the definitions for these are not 100% dry - but they are here:
  client-svelte/src/types.ts
  server/src/models/entity.js

2) SLUGS. There is an idea of a 'slug' in an entity. Entities may request (on an api request to create or update an entity) to have a wiki like optional "slug" that is similar to a uuid and represents the entity uniquely. The application overall will use a wiki-like URL structure for content ('/portland-mushroom-foragers-group/funarea', '/john-smith') where slugs are handed out on a first-come first serve basis at the root level. Slugs can have multiple slashes and are paths. A request for an arbitrary slug is granted if it is not taken, and also if parent nodes have open permissions. For example the request for a slug '/john-smith/my-fun-sub-group' may not be granted unless the caller has permission to add sub objects to '/john-smith'. Permissions is discussed later.

3) PARENT. Entities can have a parent property. This is noted since it slightly competes with relationships below. It is up to the application to decide which to use for which situation. We *may* deprecate this in favor of relationships or we *may* support both ways of indicating relationships.

4) RELATIONSHIPS. We have a 'relationships' table in mongo that relates any two entities to each other with a labelled edge of a type. We don't especially prevent any two entities from being related. Often a post entity will have children posts (forming a thread), but also one can imagine a group entity having subgroups, or weirdly a post having a subgroup. Entities can have both a 'parent' property directly (for convenience) and other relationships in a separate table.

5) TAGS. Tags are also a form of relationship; emerging from prototype based categorization theory. We're supporting them as a property but probably won't use heavily right now.

6) PERMISSIONS. There's a concept of permissions [tbd]. For now we can call an empty permissions checker stub but just always return true.

7) QUERY. We're going to need a fairly generic and powerful query interface that can filter by parent, type, slug, location, date, offset, limit... I see most requests for data taking place through this query interface. It will also be responsible for permissions, since in some cases objects are private (not visible to a given caller). A caller should optionally supply their credentials since that may affect what they can get back. We prefer a single query interface fundamentally rather than many because we can consolidate things like permissions filtering (which can get fairly complex).

There are specific types of entities in the database - these are the core types:

1) "PARTY" or user accounts; as with most apps users can create new accounts and register and login, and a fairly conventional session token approach is used. We're going to be using web3auth. Users also have account profile and permissions. Users can also set some extended details about themselves, some of this can be come from the auth provider (such as email, name, depiction). Also users by default have a minimal set of permissions - except for the very first user who is granted superuser perms. All of this can be stuffed into an entity that is marked of type 'user'.

2) "GROUP". A common need for social apps in general is to have a concept of a group, room, area, zone or focus. For example reddit has a concept of subreddits, and many other apps have a concept of an 'organization' which is a kind of grouping mechanism. To deliver on this we have an entity of type 'group' and users can be members of a given group (there is a relationship in the relationship table that relates the user to the group).

3) "POST". Another common feature of social networks is the eponymous post. Often as an anchor for a subthreaded conversation (in this case with child posts).

