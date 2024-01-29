# Food delivery backend

This project contains a simple Strapi-based Wolt-like food delivery backend. It uses SQLite for data storage, and it exposes GraphQL API.

# Getting started

Once you have the project cloned, you should install required dependencies with

```
npm install
```

After the dependencies have finished installing, create `.env` file and change all the `toBeModified` with actual values

```dotenv
HOST=0.0.0.0
PORT=3030
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
# Stripe
STRIPE_KEY=tobemodified
```
Apart from `STRIPE_KEY` it is up to you to create required secrets that will replace `toBeModified` values.

Once you have `.env` file in place, you can start the project with

```
npm run develop
```

You can access Strapi admin pages using `http://localhost:3030/admin` and GraphQL using `http://localhost:3030/grahql`. For GraphQL, entire playground is available that comes with the editor, results viewer as well as documentation and schema explorer.

_**NOTE: Don't forget to setup correct access rights using `Settings -> Users & Permissions Plugins -> Roles` section**_

# Features

Backend support working with following data

## Restaurant

| Field       | Type        |
|-------------|-------------|
| name        | text        |
| image       | media       |
| description | markdown    |
| dishes      | one-to-many |


## Dish

| Field       | Type        |
|-------------|-------------|
| name        | text        |
| image       | media       |
| description | markdown    |
| price       | decimal     |
| restaurant  | many-to-one |

## User

| Field    | Type        |
|----------|-------------|
| username | text        |
| email    | email       |
| password | password    |
| ...      | ...         |
| cart     | one-to-one  | 
| orders   | one-to-many |

## Cart

| Field    | Type        |
|----------|-------------|
| user     | one-to-one  |
| dishes   | one-to-many |

## Order

| Field   | Type        |
|---------|-------------|
| address | text        |
| amount  | decimal     |
| token   | text        |
| dishes  | JSON        |
| user    | many-to-one |

# Frontend implementation

While it is up to you to choose the libraries / frameworks to implement the frontend code, my proposal is to use:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [React Hook Form](https://www.react-hook-form.com/)
