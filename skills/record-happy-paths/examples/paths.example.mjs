// Example spec for /record-happy-paths. Copy it next to the project (not into
// this skill), name it <something>.happy-paths.mjs, adapt it, then run
//   node <skill>/bin/record.mjs ./orders.happy-paths.mjs
// Everything app-specific lives here, from the URL, users and sign-in to the
// selectors and the wording. For a single-file app, baseUrl can be a file://
// URL (pathToFileURL(path.resolve(here, "index.html")).href), and a goto of
// "?reset=1#/home" resolves against it.
export default {
  baseUrl: "http://localhost:3000",
  brand: "Acme Orders",               // kicker on the title card and end card
  out: "./happy-path-recordings",     // MP4s + README.txt land here, relative to this spec
  viewport: { width: 1600, height: 1000 },
  slowMo: 120,                        // ms between browser actions
  // captions: "band",                // the default, a band under the app; "overlay" draws over the page
  // contextOptions: { locale: "en-GB", timezoneId: "Europe/London" },
  // Narration from a local Kokoro voice. Each step's say is the spoken line, and the video waits for it.
  // voice: { voice: "bf_emma", speed: 1.05, lexicon: { SKU: "S K U" } },
  // A calm bed of music under the voice, dipping while it speaks. --music-samples renders each preset to choose from.
  // music: { preset: "soft-piano", volumeDb: -24, duck: true, seed: 3 },
  // theme: { accent: "#2563eb", bandBg: "#111827", cardBg: "linear-gradient(180deg,#1f2937,#111827)" },
  // Branded cards, with the colours, font and logo taken from the app's own design system:
  // theme: { bandBg: "#111827", cardColours: ["#1e3a8a", "#111827"], cardTexture: "grid", cardAccent: "#60a5fa",
  //          cardShape: "glow", cardAlign: "left", logo: "./brand/logo.svg" },
  // Chapters for bin/assemble.mjs, each one or more paths in order:
  // assemble: { chapters: [{ file: "Orders", parts: ["create-order", "approve-refund"] }] },

  // Requests that fail by design (e.g. a session probe before sign-in) and
  // should not be reported. Matched against "STATUS METHOD /path".
  ignoreRequests: ["^401 GET /api/session"],

  users: {
    manager: { email: "manager@example.com", label: "Store manager", who: "Store manager" },
    clerk: { email: "clerk@example.com", label: "Clerk", who: "Clerk\nFront counter" },
  },

  // Sign-in, shared by every user. {{user.*}} fills in the user's fields;
  // ${env:NAME} reads a secret from the environment at run time.
  login: [
    { action: "goto", url: "/login" },
    { action: "type", target: "label=Email", value: "{{user.email}}", caption: "Sign in as {{user.label}}" },
    { action: "type", target: "label=Password", value: "${env:DEMO_PASSWORD}" },
    { action: "click", target: "role=button|Sign in" },
    { action: "wait", url: "/dashboard" },
    { action: "who", text: "{{user.who}}" }, // the band names who is acting from here on
  ],

  paths: [
    {
      slug: "create-order",
      title: "Create an order",
      subtitle: "From an empty basket to a confirmed order",
      roles: ["Clerk"],
      summary: "A clerk adds two products, checks the total and places the order.",
      steps: [
        { action: "login", as: "clerk" },
        { action: "click", target: "role=link|Orders", caption: "Open the orders list" },
        { action: "click", target: "testid=new-order", caption: "Start a new order" },
        { action: "type", target: "label=Customer", value: "Northwind Traders" },
        { action: "select", target: "label=Product", value: "Coffee beans 1 kg" },
        { action: "click", target: "role=button|Add line" },
        { action: "click", target: "role=button|Place order", caption: "Place the order", say: "With everything in the basket, the clerk places the order." },
        // expect names what the caption claims, so a UI change fails the take instead of the video lying.
        { action: "wait", text: "Order placed", caption: "The order is confirmed and appears in the list", expect: ["Order placed", "Northwind Traders"] },
        // hold lets the caption be read before a step without its own caption changes the screen.
        { action: "click", target: (p) => p.getByRole("dialog").getByRole("button", { name: "Close" }), hold: true },
      ],
    },
    {
      slug: "approve-refund",
      title: "Approve a refund",
      roles: ["Clerk", "Store manager"],
      summary: "A clerk requests a refund and the manager approves it.",
      // A path can be code instead of steps: r is the Recorder.
      run: async (r, { login }) => {
        await login("clerk");
        await r.caption("The clerk requests a refund");
        await r.goto("/orders/1");
        await r.click("role=button|Request refund");
        await r.type("label=Reason", "Damaged on arrival");
        await r.click("role=button|Submit");
        await r.signOut();
        await login("manager");
        await r.caption("The manager approves it");
        await r.goto("/refunds");
        await r.click("text=Damaged on arrival");
        await r.click("role=button|Approve");
        await r.waitFor({ text: "Approved" });
        await r.pause(2000);
      },
    },
  ],
};
