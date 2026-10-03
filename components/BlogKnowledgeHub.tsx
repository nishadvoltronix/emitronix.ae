"use client";

import { ArrowRight, CalendarDays, Clock3, Mail, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { blogImageAlt, type BlogPostSummary } from "@/data/blog";
import { getGeneratedImage } from "@/data/generatedImages";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";

type BlogKnowledgeHubProps = {
  posts: BlogPostSummary[];
  categories: string[];
  categoryPhotograph?: ReactNode;
  enquiryPhotograph?: ReactNode;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function postHref(post: BlogPostSummary) {
  return `/blog/${post.slug}`;
}

export function BlogKnowledgeHub({ posts, categories, categoryPhotograph, enquiryPhotograph }: BlogKnowledgeHubProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const featuredAsset = getGeneratedImage(featured.generatedImage);
  const featuredCards = posts.filter((post) => post.slug !== featured.slug).slice(0, 3);
  const recentPosts = [...posts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).slice(0, 4);
  const selectedGuides = posts.filter((post) => post.popular).slice(0, 4);
  const normalizedQuery = query.trim().toLowerCase();
  const defaultLibraryView = activeCategory === "All" && normalizedQuery.length === 0;
  const spotlightSlugs = new Set([featured.slug, ...featuredCards.map((post) => post.slug)]);
  const filteredPosts = posts.filter((post) => {
    const categoryMatch = activeCategory === "All" || post.categories.includes(activeCategory);
    const queryMatch =
      normalizedQuery.length === 0 ||
      [post.title, post.excerpt, post.category, ...post.categories, ...post.targetKeywords]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const alreadyVisibleInSpotlight = defaultLibraryView && spotlightSlugs.has(post.slug);
    return categoryMatch && queryMatch && !alreadyVisibleInSpotlight;
  });

  return (
    <>
      <section className="internal-page-intro relative isolate overflow-hidden bg-brand-dark pb-16 pt-24 text-white lg:pb-20 lg:pt-28">
        <ResponsiveIllustrativeImage
          asset={featuredAsset}
          alt={blogImageAlt(featured)}
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 h-full w-full"
          imageClassName="h-full w-full object-cover"
          imageStyle={{ height: "100%", objectFit: "cover" }}
        />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(11,31,58,0.94)_0%,rgba(18,58,115,0.76)_52%,rgba(25,73,145,0.36)_100%)]" />

        <div className="container-pad relative z-30">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm font-bold text-white/[0.78]" aria-label="Breadcrumb">
            <Link href="/" prefetch={false} className="transition hover:text-brand-sky">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Blog</span>
          </nav>

          <div className="grid min-h-[320px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-sky">Emitronix Knowledge Center</p>
              <h1 className="internal-page-title mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-7xl">
                Dubai construction insights for better project decisions.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-white/[0.86]">
                Decision guides on civil construction, building contracting, warehouse delivery, interior fit-out and Dubai authority approvals for owners, consultants and commercial teams.
              </p>
            </div>

            <form className="rounded-lg border border-white/25 bg-white/[0.18] p-4 shadow-none backdrop-blur-2xl" role="search" onSubmit={(event) => event.preventDefault()}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-brand-sky">Search Dubai guides</p>
              <label htmlFor="blog-search" className="sr-only">Search construction articles</label>
              <div className="flex items-center gap-3 rounded-lg border border-brand/[0.12] bg-white px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 shrink-0 text-brand" />
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search approvals, warehouses, civil works..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-charcoal outline-none placeholder:text-steel/70"
                  aria-controls="blog-article-library"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 lg:pb-24">
        <div className="container-pad grid min-w-0 gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 xl:sticky xl:top-28 xl:self-start">
            <div className="luxury-surface min-w-0 rounded-lg p-5 xl:max-h-[calc(100vh-18rem)] xl:overflow-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand">Categories</p>
              <div className="mt-5 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-2 xl:grid xl:overflow-visible xl:pb-0">
                {["All", ...categories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    aria-controls="blog-article-library"
                    className={`flex shrink-0 items-center justify-between gap-5 rounded-lg px-4 py-3 text-left text-sm font-semibold transition xl:w-full ${
                      activeCategory === category
                        ? "bg-brand text-white shadow-blue"
                        : "bg-white text-charcoal hover:bg-brand-soft hover:text-brand"
                    }`}
                  >
                    <span>{category}</span>
                    <span className={activeCategory === category ? "text-white/80" : "text-steel"}>
                      {category === "All" ? posts.length : posts.filter((post) => post.categories.includes(category)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {categoryPhotograph ? <div className="mt-6">{categoryPhotograph}</div> : null}
          </aside>

          <div className="grid min-w-0 gap-10">
            <article className="grid overflow-hidden rounded-lg border border-brand/[0.12] bg-white shadow-none lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative h-[320px] lg:h-auto lg:min-h-[430px]">
                <ResponsiveIllustrativeImage
                  asset={featuredAsset}
                  alt={blogImageAlt(featured)}
                  sizes="(min-width: 1280px) 42vw, 100vw"
                  quality={65}
                  className="absolute inset-0 h-full w-full"
                  imageClassName="h-full w-full object-cover"
                  imageStyle={{ height: "100%", objectFit: "cover" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/10 to-transparent lg:hidden" />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <p className="premium-kicker">Featured guide</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-charcoal">
                  {featured.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-steel">{featured.excerpt}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-steel">
                  <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" />{formatDate(featured.publishedDate)}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand" />{featured.readTime}</span>
                  <span className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-brand" />{featured.category}</span>
                </div>
                <Link href={postHref(featured)} className="premium-button mt-8 w-fit">
                  Read guide <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <div className="grid min-w-0 gap-5 lg:grid-cols-3">
              {featuredCards.map((post) => (
                <Link key={post.slug} href={postHref(post)} className="group overflow-hidden rounded-lg border border-brand/[0.10] bg-white shadow-none transition duration-300 hover:-translate-y-1 hover:border-brand/[0.25] hover:shadow-none">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <ResponsiveIllustrativeImage
                      asset={getGeneratedImage(post.generatedImage)}
                      alt={blogImageAlt(post)}
                      sizes="(min-width: 1024px) 24vw, 100vw"
                      quality={65}
                      className="absolute inset-0 h-full w-full"
                      imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      imageStyle={{ height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">{post.category}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal">{post.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-steel">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="premium-kicker">Article library</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
                      {filteredPosts.length} construction articles
                    </h2>
                    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                      {filteredPosts.length} {filteredPosts.length === 1 ? "article matches" : "articles match"} the current search and category filters.
                    </p>
                  </div>
                  <Link href="/resources" className="premium-button-light w-fit">
                    Resources <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div id="blog-article-library" className="mt-8 grid gap-5">
                  {filteredPosts.map((post) => (
                    <Link key={post.slug} href={postHref(post)} className="luxury-card grid min-w-0 gap-5 rounded-lg p-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="relative h-[180px] overflow-hidden rounded-lg bg-brand-soft sm:h-auto sm:min-h-[190px]">
                        <ResponsiveIllustrativeImage
                          asset={getGeneratedImage(post.generatedImage)}
                          alt={blogImageAlt(post)}
                          sizes="(min-width: 768px) 180px, 100vw"
                          quality={65}
                          className="absolute inset-0 h-full w-full"
                          imageClassName="h-full w-full object-cover"
                          imageStyle={{ height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="min-w-0 py-1">
                        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-steel">
                          <span>{post.category}</span>
                          <span>{post.readTime}</span>
                          <span>{formatDate(post.publishedDate)}</span>
                        </div>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-charcoal">{post.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-steel">{post.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <aside className="grid min-w-0 gap-5 self-start">
                <div className="luxury-surface rounded-lg p-5">
                  <p className="premium-kicker">Recent posts</p>
                  <div className="mt-5 grid gap-4">
                    {recentPosts.map((post) => (
                      <Link key={post.slug} href={postHref(post)} className="border-b border-brand/[0.10] pb-4 last:border-b-0 last:pb-0">
                        <span className="text-xs font-bold uppercase tracking-wide text-steel">{formatDate(post.publishedDate)}</span>
                        <span className="mt-1 block text-sm font-semibold leading-6 text-charcoal transition hover:text-brand">{post.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="luxury-surface rounded-lg p-5">
                  <p className="premium-kicker">Selected guides</p>
                  <div className="mt-5 grid gap-3">
                    {selectedGuides.map((post, index) => (
                      <Link key={post.slug} href={postHref(post)} className="flex gap-3 rounded-lg bg-white p-3 shadow-sm transition hover:bg-brand-soft">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold leading-6 text-charcoal">{post.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-brand/[0.15] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-none">
                  <Mail className="h-7 w-7 text-brand" />
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">Request Dubai project guidance.</h2>
                  <p className="mt-3 text-sm leading-7 text-steel">
                    Use the project enquiry form to share your location, scope and authority status with the team.
                  </p>
                  <Link href="/contact" className="premium-button mt-5 w-full">
                    Open project enquiry <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-section py-16 lg:py-24">
        <div className="container-pad">
          <div className="grid gap-8 rounded-lg border border-brand/[0.15] bg-white/[0.88] p-6 shadow-none backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="premium-kicker">Project support</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-charcoal">
                Need a construction, fit-out or authority approval route for Dubai?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-steel">
                Share the location, drawings, approval status and timeline so the next coordination action can be identified.
              </p>
            </div>
            <Link href="/contact" className="premium-button">
              Request a Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            {enquiryPhotograph ? <div className="lg:col-span-2">{enquiryPhotograph}</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
