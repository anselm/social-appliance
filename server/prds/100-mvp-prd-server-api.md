
# MVP PRD for a general purpose 'social appliance'

Sep 29 2025 @anselm

## General Server Side Architecture Principles

- API-first design with clean separation of concerns
- DRY, modular, granular
- Strong back end api focus
- Regression tests against back end features
- API can be run with or without http being present; import and use directly if desired

## In more detail

API formalism to define the interface.

The API exposes data objects, sometimes synthetic, and does permission based access to them.

Overall:

- the server exposes a formal api wall; hiding all internals
- the api abstracts all queries, reads, writes, permissions
- the actual database should not be exposed in any way
- we will want shell based regression tests of the api
- the api itself separate from the http exposed wrapper for the api
- we should be able to import a code interface to the server and use it, not just an http api

Database design:

1) ENTITIES. Behind the scenes an 'entity' mongo table is used for all objects and it has a collection of 'entities' that have several common base fields including a type field that indicates if they are describing a 'user' or a 'group' or other concepts. We use a single table approach to allow for richer relationships between entities. Since we're using mongo entities can each differ, but I want to have a common set of core properties that we can rely on - I think this is a good set of core properties:

const EntityTypes = {
  POST: "post",
  PARTY: "party",
  AGENT: "agent",
  PLACE: "place",
  THING: "thing",
  GROUP: "group",
  // there can be many more types
} as const;

const EntitySchema = {
  id: uuidv4(),
  slug: string || null,
  type: EntityTypes,
  auth: string,
  permissions: string[],
  title: string || null,
  content: string || null,
  depiction: string || null,
  tags: string[] || null,
  latitude: number || undefined,
  longitude: number || undefined,
  radius: number || undefined,
  begins: new Date().toISOString() || undefined,
  ends: new Date().toISOString() || undefined,
  sponsorId: UUID,  // The party (user) that created/sponsored this entity
  parentId: UUID || null,  // The hierarchical parent entity
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

2) SLUGS. There is an idea of a 'slug' in an entity. Entities may request (on an api request to create or update an entity) to have a wiki like optional "slug" that is similar to a uuid and represents the entity uniquely. The application overall will use a wiki-like URL structure for content ('/portland-mushroom-foragers-group', '/john-smith') where slugs are handed out on a first-come first serve basis at the root level. A request for an arbitrary slug is granted if it is not taken, and also if parent nodes have open permissions. For example the request for a slug '/john-smith/my-fun-sub-group' may not be granted unless the caller has permission to add sub objects to '/john-smith'. Permissions is discussed later.

3) PARENT. Entities can have a parent property. This is noted since it slightly competes with relationships below. It is up to the application to decide which to use for which situation.

4) RELATIONSHIPS. We have a 'relationships' table in mongo that relates any two entities to each other with a labelled edge of a type. We don't especially prevent any two entities from being related. Often a post entity will have children posts (forming a thread), but also one can imagine a group entity having subgroups, or weirdly a post having a subgroup. Entities can have both a 'parent' property directly (for convenience) and other relationships in a separate table.

5) PERMISSIONS. There's a concept of permissions, but we'll probably deal with it later; for now we can call an empty permissions checker stub but just always return true.

6) QUERY. We're going to need a fairly generic and powerful query interface that can filter by parent, type, slug, location, date, offset, limit... I see most requests for data taking place through this query interface. It will also be responsible for permissions, since in some cases objects are private (not visible to a given caller). A caller should optionally supply their credentials since that may affect what they can get back.

There are specific types of entities in the database - these are the core types:

1) "PARTY" or user accounts; as with most apps users can create new accounts and register and login, and a fairly conventional session token approach is used. We're going to be using web3auth. Users also have account profile and permissions. Users can also set some extended details about themselves, some of this can be come from the auth provider (such as email, name, depiction). Also users by default have a minimal set of permissions - except for the very first user who is granted superuser perms. All of this can be stuffed into an entity that is marked of type 'user'.

2) "GROUP". A common need for social apps in general is to have a concept of a group, room, area, zone or focus. For example reddit has a concept of subreddits, and many other apps have a concept of an 'organization' which is a kind of grouping mechanism. To deliver on this we have an entity of type 'group' and users can be members of a given group (there is a relationship in the relationship table that relates the user to the group).

3) "POST". Another common feature of social networks is the eponymous post. Often as an anchor for a subthreaded conversation (in this case with child posts).

## Regression tests

We are not worrying about authentication in this stage, there will be a sophisticated cryptographic authentication system later. For this stage we just verify the following:

Create a user account (users are just entities of type 'party')
Create a group with a slug
Create a post (in a group) - posts may have autogenerated slugs
Create a second post with the same slug - this should fail!
Create a post at a location
Create a post that is a child of another post
Query for posts near a location with pagination and offset
Query for posts not near location -> should return no results
Delete the test data
