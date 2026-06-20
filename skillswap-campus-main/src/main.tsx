import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";


import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
    routeTree,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);