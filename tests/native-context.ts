import { join, resolve } from "node:path";

// Real installed native route: a heading must not replace validated work identity.
export async function verifyNativeContext(core: string, repo: string) {
  const root = await Deno.makeTempDir({ prefix: "cloud-work-context-" });
  const quarto = Deno.env.get("QUARTO") || "quarto";
  async function command(args: string[], expected: string[] = []) {
    const result = await new Deno.Command(quarto, {
      args,
      cwd: root,
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
      throw Error(`Native-контекст работы потерян: ${output}`);
    }
    return output;
  }
  function input(
    vm: string,
    file?: string,
    heading = "# Служба {#sec-service}\n",
  ) {
    return `---
title: Служба
assessment:
  id: vm-lab
  kind: lab
cloud:
  virtual-machines:
    host:
      template: ubuntu-host
---

${heading}
:::: {#exr-service target="cloud" difficulty="introductory" time="10"}
## Проверка службы

### Настройка {.cloud-step key="configure"}

\`\`\`{.sh .cloud-action phase="check" vm="${vm}"}
echo ready
\`\`\`
::::

::: {.task-items}
1. @exr-service
:::

${
      file
        ? `\`\`\`{.sh .cloud-action phase="prepare" vm="host" file="${file}"}\n\`\`\`\n`
        : ""
    }`;
  }
  try {
    await command(["add", core, "--no-prompt"]);
    await command(["add", repo, "--no-prompt"]);
    await Deno.writeTextFile(
      join(root, "_quarto.yml"),
      `project:
  type: default
  pre-render: _extensions/course-core/entrypoints/pre.ts
  post-render: _extensions/course-core/entrypoints/post.ts
format: html
exercise-bank: true
exercise-statement-visibility: open
lang: ru
course:
  id: work-context
  view: full
  adapters: [cloud]
filters: [course-core, course-cloud]
`,
    );
    await Deno.writeTextFile(join(root, "check.sh"), "echo ready\n");
    await Deno.symlink("/etc/passwd", join(root, "escape.sh"));
    const render = ["render", "--fail-if-warnings"];
    await Deno.writeTextFile(join(root, "index.qmd"), input("undeclared"));
    const vmFailure = await command(render, [
      "CLOUD005_declaredVm",
      "объект=vm-lab, поле=cloud.virtual-machines",
      "объект=exr-service",
      "undeclared",
    ]);
    if (vmFailure.includes("объект=sec-service, поле=cloud.virtual-machines")) {
      throw Error("ID заголовка выдан за ID работы");
    }
    await Deno.writeTextFile(
      join(root, "index.qmd"),
      input("host", "/escape.sh"),
    );
    await command(render, [
      "CLOUD.ACTION_SOURCE_INVALID",
      "источник=index.qmd",
      "объект=vm-lab",
      "поле=source.file",
      "/escape.sh",
    ]);
    await Deno.writeTextFile(
      join(root, "index.qmd"),
      input("undeclared", undefined, ""),
    );
    await command(render, [
      "CLOUD005_declaredVm",
      "объект=vm-lab, поле=cloud.virtual-machines",
    ]);
    await Deno.writeTextFile(
      join(root, "index.qmd"),
      input("host", "/check.sh"),
    );
    await command(render);
    console.log(
      "ПРОЙДЕНО: контекст Cloud сохраняет ID работы vm-lab вместо заголовка sec-service и без отдельного заголовка",
    );
  } finally {
    await Deno.remove(root, { recursive: true });
  }
}

if (import.meta.main) {
  if (!Deno.args[0]) throw Error("Запуск: native-context.ts CORE");
  await verifyNativeContext(resolve(Deno.args[0]), Deno.cwd());
}
