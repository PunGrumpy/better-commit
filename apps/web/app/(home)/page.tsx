"use client";

import { Code } from "./components/code";
import { Demo } from "./components/demo";
import { Hero } from "./components/hero";

const HomePage = () => (
  <div className="relative min-h-screen flex flex-col gap-6 items-center justify-center px-4 w-full max-w-lg mx-auto">
    <Hero />
    <Code />
    <Demo />
  </div>
);

export default HomePage;
