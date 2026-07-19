<script lang="ts">
  import { onMount } from "svelte";

  type Presentation = {
    url: string;
    title: string;
    date: string;
  };

  const presentationsSourceUrl =
    "https://akazdayo.github.io/presentations/.well-known/presentations.json";
  const presentationsUrl = import.meta.env.DEV
    ? presentationsSourceUrl
    : "/api/presentations";
  const visiblePresentationCount = 4;

  let presentations = $state<Presentation[]>([]);
  let status = $state<"loading" | "ready" | "error">("loading");
  let expanded = $state(false);

  const isPresentation = (value: unknown): value is Presentation => {
    if (typeof value !== "object" || value === null) return false;

    const presentation = value as Record<string, unknown>;
    if (
      typeof presentation.url !== "string" ||
      typeof presentation.title !== "string" ||
      typeof presentation.date !== "string"
    ) {
      return false;
    }

    try {
      const url = new URL(presentation.url);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  };

  const isMachineReadableDate = (date: string) =>
    /^\d{4}(?:-\d{2}){0,2}$/.test(date);

  onMount(async () => {
    try {
      const response = await fetch(presentationsUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const value: unknown = await response.json();
      if (!Array.isArray(value)) throw new Error("Invalid response shape");

      presentations = value.filter(isPresentation).reverse();
      status = "ready";
    } catch (error) {
      console.error("Failed to load presentations", error);
      status = "error";
    }
  });
</script>

<section
  class="mx-auto flex w-full max-w-none justify-center bg-base-100 px-6 py-16 text-left text-base-content sm:px-10 min-[900px]:px-[clamp(3.5rem,6vw,7rem)] min-[900px]:py-[clamp(4rem,8vh,7rem)]"
  aria-labelledby="presentations-section-title"
>
  <div
    class="flex w-full max-w-none flex-col min-[900px]:px-[clamp(1rem,3vw,3rem)]"
  >
    <div
      class="flex items-end justify-between gap-6 border-b border-base-content/10 pb-5"
    >
      <div>
        <p class="m-0 text-sm text-base-content/55">Works / archive</p>
        <h2
          id="presentations-section-title"
          class="mt-3 mb-0 text-3xl leading-tight font-normal"
        >
          Presentations
        </h2>
      </div>
      <span
        class="hidden pb-1 text-xs text-base-content/55 sm:block"
        aria-live="polite"
      >
        {#if status === "loading"}
          Loading…
        {:else if status === "ready"}
          {presentations.length} entries
        {:else}
          Unavailable
        {/if}
      </span>
    </div>

    {#if status === "loading"}
      <p
        class="m-0 py-12 text-center text-sm text-base-content/55"
        aria-live="polite"
      >
        発表資料を読み込んでいます…
      </p>
    {:else if status === "error"}
      <p
        class="m-0 py-12 text-center text-sm text-base-content/55"
        aria-live="polite"
      >
        発表資料を読み込めませんでした。
        <a
          class="ml-2 underline decoration-base-content/30 underline-offset-4 transition-colors hover:decoration-base-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-base-content"
          href={presentationsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          一覧を直接開く
        </a>
      </p>
    {:else if presentations.length === 0}
      <p
        class="m-0 py-12 text-center text-sm text-base-content/55"
        aria-live="polite"
      >
        公開中の発表資料はまだありません。
      </p>
    {:else}
      <ol
        id="presentations-list"
        class="m-0 grid list-none grid-cols-1 gap-4 p-0 pt-8"
        aria-label="発表資料"
      >
        {#each presentations as presentation, index}
          <li
            class="min-w-0"
            hidden={!expanded && index >= visiblePresentationCount}
          >
            <a
              class="group flex h-full min-h-24 items-start justify-between gap-6 rounded-2xl border border-base-content/10 bg-base-100 p-4 text-inherit no-underline transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-base-200/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-base-content sm:px-5 sm:py-4"
              href={presentation.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${presentation.title}の発表資料を開く`}
            >
              <span class="flex min-w-0 flex-col">
                <time
                  class="text-xs tracking-[0.16em] text-base-content/55 uppercase"
                  datetime={isMachineReadableDate(presentation.date)
                    ? presentation.date
                    : undefined}
                >
                  {presentation.date}
                </time>
                <h3 class="mt-2 text-lg leading-7 sm:text-xl">
                  {presentation.title}
                </h3>
              </span>
              <svg
                class="mt-0.5 size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path d="M6 14 14 6m0 0H8m6 0v6"></path>
              </svg>
            </a>
          </li>
        {/each}
      </ol>

      {#if presentations.length > visiblePresentationCount}
        <div
          class="mt-8 flex justify-center border-t border-base-content/10 pt-6"
        >
          <button
            type="button"
            class="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-base-content/15 bg-base-100 px-5 py-2.5 text-sm transition-colors hover:bg-base-200/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-base-content"
            aria-controls="presentations-list"
            aria-expanded={expanded}
            onclick={() => (expanded = !expanded)}
          >
            <span class:hidden={expanded}>すべての発表資料を見る</span>
            <span class:hidden={!expanded}>発表資料を閉じる</span>
            <svg
              class:rotate-180={expanded}
              class="size-4 transition-transform duration-300"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="m5 7.5 5 5 5-5"></path>
            </svg>
          </button>
        </div>
      {/if}
    {/if}

    <noscript>
      <p class="m-0 pt-8 text-sm leading-7 text-base-content/65">
        発表資料の一覧は
        <a
          class="underline decoration-base-content/30 underline-offset-4 transition-colors hover:decoration-base-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-base-content"
          href={presentationsUrl}
        >
          presentations.json
        </a>
        から確認できます。
      </p>
    </noscript>
  </div>
</section>
