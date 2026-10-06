import { join } from "node:path";
// Explicit caller: only a successful native process permits current-run consumption.
const profile = Deno.args[0] || "student";
if (!["student", "full"].includes(profile)) {
  throw new Error("Профиль: student или full");
}
const result = await new Deno.Command(Deno.env.get("QUARTO") || "quarto", {
  args: [
    "render",
    ".",
    "--profile",
    profile,
    "--to",
    "html",
    "--fail-if-warnings",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!result.success) Deno.exit(result.code);
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
if (!core) throw Error("Installed Core required");
const checked = await new Deno.Command(Deno.env.get("QUARTO") || "quarto", {
  args: ["run", join(core, "entrypoints/check.ts"), ".", profile],
  stdout: "inherit",
  stderr: "inherit",
}).output();
if (!checked.success) Deno.exit(checked.code);
console.log(
  `Готово: _book/${profile}; текущая модель: _generated/course-spec/course.json`,
);
