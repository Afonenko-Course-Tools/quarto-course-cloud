import { copy } from "stdlib/fs";
import { dirname, fromFileUrl, join, resolve } from "stdlib/path";

const repo = dirname(dirname(fromFileUrl(import.meta.url)));
if (Deno.args.length !== 1) throw new Error("Usage: quarto run tests/check.ts PATH_TO_COURSE_CORE_REPOSITORY");
const core = resolve(Deno.args[0]);
const root = await Deno.makeTempDir({ prefix: "cloud-example-" });
const quarto = Deno.env.get("QUARTO") || "quarto";
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
async function run(args: string[], expectedError?: string) {
  const result = await new Deno.Command(quarto, {
    args, cwd: root, stdout: "piped", stderr: "piped",
  }).output();
  const output = new TextDecoder().decode(result.stdout) + new TextDecoder().decode(result.stderr);
  assert(expectedError ? !result.success && output.includes(expectedError) : result.success, output);
}
async function exists(path: string) {
  try { await Deno.stat(path); return true; }
  catch (error) { if (error instanceof Deno.errors.NotFound) return false; throw error; }
}

try {
  await copy(join(repo, "examples/course"), root, { overwrite: true });
  await run(["add", core, "--no-prompt"]);
  await run(["add", repo, "--no-prompt"]);
  const render = ["render", "--fail-if-warnings"];
  await run(render);
  const modelPath = join(root, "_generated/course-spec/course.json");
  const model = JSON.parse(await Deno.readTextFile(modelPath));
  assert(await exists(join(root, "_book/index.html")), "Missing Cloud book");
  assert(model.registeredTargets.includes("cloud"), "Cloud contract not discovered");
  assert(model.exercises.length === 1 && model.assessments.length === 1, "Incomplete Cloud model");
  const steps = model.exercises[0].extensions.cloud.steps;
  assert(steps.length === 2, "Expected both Cloud steps");
  assert(steps[0].actions[0].source.file === "/projects/service/check.sh", "External check lost");
  assert(Object.keys(model.assessments[0].extensions.cloud["virtual-machines"]).length === 2, "Expected both VMs");

  const taskPath = join(root, "tasks/index.qmd");
  const labPath = join(root, "labs/01.qmd");
  const task = await Deno.readTextFile(taskPath);
  const lab = await Deno.readTextFile(labPath);
  const cases = [
    { name: "missing check", task: task.replace('phase="check"', 'phase="solution"'), lab, error: "CLOUD001" },
    { name: "duplicate step", task: task.replace('key="client"', 'key="configure"'), lab, error: "CLOUD004" },
    { name: "undeclared VM", task, lab: lab.replace("    client:\n      template: ubuntu-client\n", ""), error: "CLOUD005" },
    { name: "missing external file", task: task.replace("/projects/service/check.sh", "/projects/service/missing.sh"), lab, error: "missing.sh" },
  ];
  for (const item of cases) {
    assert(item.task !== task || item.lab !== lab, `Test did not change input: ${item.name}`);
    await Deno.writeTextFile(taskPath, item.task);
    await Deno.writeTextFile(labPath, item.lab);
    // A failed build must remove an old successful model too.
    await Deno.writeTextFile(modelPath, JSON.stringify(model));
    await run(render, item.error);
    assert(!await exists(modelPath), `Stale model survived: ${item.name}`);
    console.log(`PASS rejection: ${item.name}`);
  }
  console.log("PASS Cloud: local installation, Core integration, CUE validation, two VMs, external check and invalid authoring cases");
} finally {
  await Deno.remove(root, { recursive: true });
}
