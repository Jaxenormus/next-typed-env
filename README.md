# next-typed-env

`next-typed-env` is a utility that enhances Next.js applications by enabling type-safe handling and validation of environment variables. It generates TypeScript files with typed exports for both client and server environments.

## Features

- Validates environment variables against a predefined schema
- Generates TypeScript files with typed exports
- Supports both client and server environments
- Reduces runtime errors by ensuring consistent access to environment variables

## Installation

Use npm to install `next-typed-env`:

```sh
npm install next-typed-env
```

or use yarn:

```sh
yarn add next-typed-env
```

## Usage

### Define Environment Variables in `.env` File

Create a `.env` file in the root directory of your Next.js project and define environment variables:

```sh
NEXT_PUBLIC_API_URL=https://api.example.com
SECRET_KEY=mysecretkey
NODE_ENV=development
```

### Define a Schema for Environment Variables

Define a schema for your environment variables using Zod. Use the `withTypedEnv` function in your Next.js configuration file to integrate `next-typed-env`.

```typescript
// next.config.js
import { withTypedEnv } from "next-typed-env";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string(),
  SECRET_KEY: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

module.exports = withTypedEnv(
  {
    // ...other Next.js config options
  },
  envSchema
);
```

### Generated TypeScript Files

`next-typed-env` will generate TypeScript files in an `/env` directory.

```typescript
// ./env/env.client.ts
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL as "https://api.example.com";

export const NODE_ENV = process.env.NODE_ENV as "development" | "production" | "test";
```

Example generated file (`env.server.ts`):

```typescript
// ./env/env.server.ts
export const SECRET_KEY = process.env.SECRET_KEY as "mysecretkey";
```

### Use the Generated File in Your Code

Import the environment variables directly from the generated file. This will provide you with type safety:

```typescript
// example-component.tsx
import { NEXT_PUBLIC_API_URL, NODE_ENV } from "../env/env.client";

console.log(NEXT_PUBLIC_API_URL); // Typed as string

if (NODE_ENV === "production") {
  console.log("You are in production mode.");
} else if (NODE_ENV === "development") {
  console.log("You are in development mode.");
}
```

```typescript
// example-server.ts
import { SECRET_KEY } from "../env/env.server";

console.log(SECRET_KEY); // Typed as string
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
