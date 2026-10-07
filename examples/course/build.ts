import { pathToFileURL } from "node:url";
import { join } from "node:path";
const native = await new Deno.Command("quarto", {
  args: ["render", "--profile", "full", "--fail-if-warnings"],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!native.success) Deno.exit(native.code);
let core: string | undefined;
for (const owner of ["", "Afonenko-Course-Tools/"]) {
  const candidate = join(Deno.cwd(), "_extensions", owner + "course-core");
  try {
    if ((await Deno.stat(candidate)).isDirectory) {
      core = candidate;
      break;
    }
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e;
  }
}
if (!core) throw Error("Необходимо установить ядро курса Core");
const checked = await new Deno.Command("quarto", {
  args: ["run", join(core, "entrypoints/check.ts"), ".", "full"],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!checked.success) Deno.exit(checked.code);

const { collectExport } = await import(
  pathToFileURL(join(core, "body-export/collect.ts")).href
);
const selected = await collectExport(Deno.cwd(), {
  book: ".",
  work: "sec-lab-01",
});
if (
  selected.result.model.exercises.length !== 1 ||
  selected.result.model.exercises[0].extensions.cloud.steps.length !== 2
) {
  throw Error("Выбранный экспорт Cloud потерял или продублировал шаги задания");
}

const revision = await new Deno.Command("git", {
  args: ["rev-parse", "HEAD"],
  stdout: "piped",
  stderr: "null",
}).output();
await Deno.writeTextFile(
  "_book/full/BUILD.json",
  JSON.stringify(
    {
      sourceRepository: "Afonenko-Course-Tools/quarto-course-cloud",
      commit: Deno.env.get("DEMO_SOURCE_COMMIT") ||
        (revision.success
          ? new TextDecoder().decode(revision.stdout).trim()
          : ""),
      sourceDirty: Deno.env.get("DEMO_SOURCE_DIRTY") === "true",
      extensionVersion: "2.1.0",
      dependencies: { "quarto-course": "3.0.0" },
      projection: "full",
      verification: "local installed native build",
      livePlatformVerified: false,
    },
    null,
    2,
  ) + "\n",
);
