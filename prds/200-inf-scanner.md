# Info file scanner

On demand we scan a supplied 'data' folder for predefined content.
These are stored in .inf files, in a hierarchy.

The way it should work is that we will supply a data folder, and in that folder we will have .info.js files - which are full blown javascript files that we can import or otherwise execute - and what we're interested in getting out of those files is the exports, in the form of individual objects, or arrays of objects. these objects are going to be in dividual entities or arrays of entities, and each of them should be added or revised in the database (if the id was already present), perhaps print a console warning if the entity has no id and just ignore it, and submitted entities have to pass normal slug validation as well. i've created a folder at the root called seed-data where we can place some sample data... i think we should create an admin entity, and then some other entities, such as a few user group entities (of type group) for groups such as 'hiking', 'bali', and 'photography' ... note i am using full blown .js instead of json because this will let me compose entities more richly prior to export.

