import { Elysia } from "elysia";
import authRoutes from "./auth/route";

const routes = new Elysia().use(authRoutes);

export default routes;
