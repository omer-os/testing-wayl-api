import Elysia from "elysia";
import Response from "@/lib/global-response";
import { t } from "elysia";

const waylRoutes = new Elysia({ prefix: "/wayl", tags: ["Wayl"] });

export default waylRoutes;
