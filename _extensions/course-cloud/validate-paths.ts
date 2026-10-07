import { isAbsolute, join, relative } from "stdlib/path";

type Context = {
  source?: string;
  id?: string;
  field?: string;
  related?: { source?: string; id?: string; field?: string }[];
  hint?: string;
};
function format(message: string, context: Context = {}) {
  const parts = [message];
  if (context.source) parts.push(`источник=${context.source}`);
  if (context.id) parts.push(`объект=${context.id}`);
  if (context.field) parts.push(`поле=${context.field}`);
  for (const related of context.related || []) {
    const values = [];
    if (related.source) values.push(`источник=${related.source}`);
    if (related.id) values.push(`объект=${related.id}`);
    if (related.field) values.push(`поле=${related.field}`);
    if (values.length) parts.push(`связано: ${values.join(", ")}`);
  }
  if (context.hint) parts.push(`подсказка=${context.hint}`);
  return parts.join("; ");
}
function diagnostic(
  code: string,
  message: string,
  context?: Context,
  cause?: unknown,
) {
  const error = Object.assign(
    new Error(format(`${code}: ${message}`, context), { cause }),
    { code },
  );
  error.name = "ExtensionDiagnostic";
  return error;
}
const [project, ...arguments_] = Deno.args;
const contexts: Context[] = arguments_[0]?.startsWith("--contexts=")
  ? JSON.parse(arguments_.shift()!.slice("--contexts=".length))
  : [];
const root = await Deno.realPath(project);
for (const [index, file] of arguments_.entries()) {
  const context = contexts[index] || { field: "source.file" };
  if (!file.startsWith("/") || file.startsWith("//")) {
    throw diagnostic(
      "CLOUD.ACTION_SOURCE_INVALID",
      `Путь относительно корня курса: ${file}`,
      context,
    );
  }
  // Не выдаём недоступность файловой системы за доказанное нарушение CUE.
  let real: string;

  try {
    real = await Deno.realPath(join(root, file.slice(1)));
  } catch (cause) {
    const error = new Error(
      format(`Не удалось прочитать исходный файл ${file}`, context),
      { cause },
    );
    error.name = "ExternalToolFailure";
    throw error;
  }
  const path = relative(root, real);
  if (
    !path || path === ".." || path.startsWith("../") ||
    path.startsWith("..\\") || isAbsolute(path)
  ) {
    throw diagnostic(
      "CLOUD.ACTION_SOURCE_INVALID",
      `Путь выходит за пределы курса: ${file}`,
      context,
    );
  }
  let stat: Deno.FileInfo;
  try {
    stat = await Deno.stat(real);
  } catch (cause) {
    const error = new Error(
      format(`Не удалось прочитать исходный файл ${file}`, context),
      { cause },
    );
    error.name = "ExternalToolFailure";
    throw error;
  }
  if (!stat.isFile) {
    throw diagnostic(
      "CLOUD.ACTION_SOURCE_INVALID",
      `Отсутствует исходный файл: ${file}`,
      context,
    );
  }
}
