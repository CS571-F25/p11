/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as brands from "../brands.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as migration from "../migration.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as userProfiles from "../userProfiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  brands: typeof brands;
  cart: typeof cart;
  categories: typeof categories;
  files: typeof files;
  http: typeof http;
  migration: typeof migration;
  orders: typeof orders;
  products: typeof products;
  router: typeof router;
  seedData: typeof seedData;
  userProfiles: typeof userProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
