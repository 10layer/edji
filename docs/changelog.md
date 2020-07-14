# Changelog

## v1.0.0

- Mongoose v5

## v1.0.1

- Closed bad security hole in groups - now only admins can set groups. (Will probably change this in future so that only those defined in the usergroup model can change groups.)

## v1.0.12

- Select individual fields in populate joins

## v1.0.16

- Add a /query endpoint, that allows you to POST { query } for advanced queries

## v1.2.3

- Throttling

## v1.2.4

- Time log includes operation number

## v2.0.1-0

- Start v2!
- Move to "connection_string" for MongoDB connection - allows connectivity to Atlas, for example
- Use our own (much smarter) Schema class

## v2.0.1-1

- Tokens as the preferred login methodology