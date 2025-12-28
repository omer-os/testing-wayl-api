import { Elysia } from "elysia";
import authRoutes from "./auth/route";
import waylRoutes from "./wayl/route";

const routes = new Elysia().use(authRoutes).use(waylRoutes);

export default routes;
