export const Hero = () => (
  <section className="max-w-lg w-full text-center grid gap-4 sm:gap-6">
    <h1 className="text-[1.35rem] sm:text-3xl lg:text-[2.25rem] tracking-tight leading-[1.15]">
      Every commit, vetted before it reaches your{" "}
      <span className="font-mono text-foreground/60 italic light:text-foreground/50">
        repository
      </span>
    </h1>

    <p className="text-[13.5px] sm:text-[15px] text-foreground/50 leading-relaxed light:text-foreground/60">
      Point your&nbsp;
      <code className="font-mono text-[0.9em] text-foreground/60 light:text-foreground/70">
        better-commit.config.ts
      </code>
      &nbsp;before it&apos;s served.
    </p>
  </section>
);
