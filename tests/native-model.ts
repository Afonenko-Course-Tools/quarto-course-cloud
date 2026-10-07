import { join } from "node:path";
const core = Deno.args[0];
if (!core) throw Error("usage: native-model.ts CORE_REPOSITORY");
const root = await Deno.makeTempDir();
const adapter = "cloud";
try {
  const model = {
    course: { view: "full" },
    registeredTargets: ["manual", adapter],
    exercises: [{
      id: "exr-native",
      project: "",
      head: { kind: "Div", level: 0, title: "" },
      body: { "pandoc-api-version": [1, 23, 1], meta: {}, blocks: [] },
      nested: 0,
      unknownAttributes: [],
      source: "index.qmd",
      extensions: {},
    }],
    assessments: [],
  };
  const path = join(root, "model.json");
  await Deno.writeTextFile(path, JSON.stringify(model));
  const result = await new Deno.Command(Deno.env.get("CUE") || "cue", {
    args: [
      "vet",
      join(core, "_extensions/course-core/spec/core.cue"),
      "_extensions/course-" + adapter + "/spec/" + adapter + ".cue",
      path,
      "-d",
      "#Course",
      "-c",
      "--all-errors",
    ],
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!result.success) throw Error(new TextDecoder().decode(result.stderr));
  // Real CUE rules: IDs remain stable and a corrected candidate succeeds.
  const action = (vm = "host", phase = "check") => ({
    phase,
    vm,
    language: "sh",
    source: { inline: "echo ready" },
    unknownAttributes: [],
  });
  const step = (key = "configure", actions = [action()]) => ({
    key,
    title: "Настройка",
    actions,
    unknownAttributes: [],
  });
  const exercise = (steps = [step()]) => ({
    steps,
    orphanActions: 0,
    misplacedMarkers: 0,
    unknownClasses: [],
  });
  const assessment = (prepare: unknown[] = []) => ({
    "virtual-machines": { host: { template: "ubuntu-host" } },
    prepare,
  });
  async function vet(value: unknown, definition: string, expected?: string) {
    await Deno.writeTextFile(path, JSON.stringify(value));
    const result = await new Deno.Command(Deno.env.get("CUE") || "cue", {
      args: [
        "vet",
        join(core, "_extensions/course-core/spec/core.cue"),
        "_extensions/course-cloud/spec/cloud.cue",
        path,
        "-d",
        definition,
        "-c",
        "--all-errors",
      ],
      stdout: "piped",
      stderr: "piped",
    }).output();
    const output = new TextDecoder().decode(result.stdout) +
      new TextDecoder().decode(result.stderr);
    if (
      expected ? result.success || !output.includes(expected) : !result.success
    ) {
      throw Error(
        `Неожиданный результат CUE (${expected || definition}): ${output}`,
      );
    }
  }
  await vet(
    exercise([step("configure", [action("host", "solution")])]),
    "#CloudExercise",
    "CLOUD001_check",
  );
  await vet(
    exercise([step("configure", [action(), action()])]),
    "#CloudExercise",
    "CLOUD002_uniqueActions",
  );
  await vet(
    exercise([step("configure", [action(), action("client", "solution")])]),
    "#CloudExercise",
    "CLOUD003_checkPerVm",
  );
  await vet(
    exercise([step(), step()]),
    "#CloudExercise",
    "CLOUD004_uniqueSteps",
  );
  await vet(
    assessment([action("client", "prepare")]),
    "#CloudAssessment",
    "CLOUD006_prepareVm",
  );
  await vet(
    assessment([action("host", "prepare"), action("host", "prepare")]),
    "#CloudAssessment",
    "CLOUD007_uniquePrepare",
  );
  await vet(exercise(), "#CloudExercise");
  await vet(assessment([action("host", "prepare")]), "#CloudAssessment");

  // Exercise the real Lua wrapper; context is optional and never alters CUE input.
  const extension = join(Deno.cwd(), "_extensions/course-cloud");
  const lua = join(root, "vet.lua");
  async function luaVet(
    value: unknown,
    context?: unknown,
    expected: string[] = [],
    cue?: string,
  ) {
    await Deno.writeTextFile(
      lua,
      `package.path = ${JSON.stringify(extension + "/?.lua;")} .. package.path
local native = require("native")
return {{Pandoc = function(doc)
  native.vet(pandoc.json.decode([==[${
        JSON.stringify(value)
      }]==]), "#CloudExercise"${
        context
          ? `, pandoc.json.decode([==[${JSON.stringify(context)}]==])`
          : ""
      })
  return doc
end}}
`,
    );
    const result = await new Deno.Command(Deno.env.get("QUARTO") || "quarto", {
      args: ["pandoc", "--from=markdown", "--to=plain", "--lua-filter=" + lua],
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
      env: cue ? { CUE: cue } : {},
    }).output();
    const output = new TextDecoder().decode(result.stdout) +
      new TextDecoder().decode(result.stderr);
    if (
      expected.length
        ? result.success || expected.some((text) => !output.includes(text))
        : !result.success
    ) {
      throw Error(`Обёртка native.vet потеряла отказ/контекст: ${output}`);
    }
  }
  await luaVet(exercise());
  const context = {
    source: "tasks/index.qmd",
    id: "exr-service",
    field: "extensions.cloud",
    related: [{ id: "configure", field: "steps.key" }, {
      id: "host",
      field: "vm",
    }],
    hint: "Проверьте шаг и действие",
  };
  await luaVet(
    exercise([step("configure", [action("host", "solution")])]),
    context,
    [
      "CLOUD001_check",
      "источник=tasks/index.qmd",
      "объект=exr-service",
      "поле=extensions.cloud",
      "configure",
      "host",
      "cue",
    ],
  );
  // A failing executable is external; its exit, stdout and stderr remain visible.
  const failedCue = join(root, "failed-cue");
  await Deno.writeTextFile(
    failedCue,
    "#!/bin/sh\nprintf 'TOOL-STDOUT\\n'\nprintf 'TOOL-STDERR\\n' >&2\nexit 37\n",
  );
  await Deno.chmod(failedCue, 0o755);
  await luaVet(exercise(), context, [
    "37",
    "TOOL-STDOUT",
    "TOOL-STDERR",
    "источник=tasks/index.qmd",
    "cue",
  ], failedCue);
  // Path guards retain realpath containment; IO failure remains external.
  const sourceFile = join(root, "check.sh");
  await Deno.writeTextFile(sourceFile, "echo ready\n");
  await Deno.symlink("/etc/passwd", join(root, "escape.sh"));
  async function validatePath(
    file: string,
    expected: string[] = [],
    contextual = true,
  ) {
    const result = await new Deno.Command(Deno.env.get("QUARTO") || "quarto", {
      args: [
        "run",
        join(extension, "validate-paths.ts"),
        root,
        ...(contextual
          ? [
            "--contexts=" +
            JSON.stringify([{ ...context, field: "source.file" }]),
          ]
          : []),
        file,
      ],
      stdout: "piped",
      stderr: "piped",
    }).output();
    const output = new TextDecoder().decode(result.stdout) +
      new TextDecoder().decode(result.stderr);
    if (
      expected.length
        ? result.success || expected.some((text) => !output.includes(text))
        : !result.success
    ) {
      throw Error(`Проверка пути потеряла результат/контекст: ${output}`);
    }
  }
  await validatePath("/check.sh", [], false);
  await validatePath("//check.sh", [
    "CLOUD.ACTION_SOURCE_INVALID",
    "источник=tasks/index.qmd",
    "объект=exr-service",
    "поле=source.file",
  ]);
  await validatePath("/escape.sh", [
    "CLOUD.ACTION_SOURCE_INVALID",
    "Путь выходит за пределы курса",
  ]);
  await Deno.mkdir(join(root, "directory"));
  await validatePath("/directory", [
    "CLOUD.ACTION_SOURCE_INVALID",
    "Отсутствует исходный файл",
  ]);
  await validatePath("/missing.sh", [
    "ExternalToolFailure",
    "NotFound",
    "источник=tasks/index.qmd",
    "missing.sh",
  ]);
  await validatePath("/check.sh");
  console.log(
    "Нативное упражнение без владельца, target, роли, сложности и исходной темы допустимо с " +
      adapter,
  );
} finally {
  await Deno.remove(root, { recursive: true });
}
