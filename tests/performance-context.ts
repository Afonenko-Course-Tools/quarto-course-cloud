const root = await Deno.makeTempDir({ prefix: 'cloud-performance-' });
const extension = new URL('../_extensions/course-cloud/', import.meta.url).pathname.replace(/\/$/, '');
try {
  const probe = root + '/child-probe';
  const deno = Deno.execPath();
  const script = root + '/probe.ts';
  await Deno.writeTextFile(script, `await Deno.writeTextFile(Deno.env.get('CLOUD_PROBE_OUTPUT')!,JSON.stringify({parent:Deno.env.get('COURSE_PERF_PARENT_SPAN_ID'),functional:Deno.env.get('CLOUD_FUNCTIONAL_PROBE'),path:Deno.env.get('PATH'),cwd:Deno.cwd(),args:Deno.args}));\n`);
  const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'";
  await Deno.writeTextFile(probe, `#!/bin/sh\nexec ${quote(deno)} run -A ${quote(script)} "$@"\n`);
  await Deno.chmod(probe, 0o755);
  for (const mode of ['off', 'missing', 'trace']) {
    const result = await new Deno.Command(Deno.env.get('QUARTO') || 'quarto', {
      args: ['pandoc', '/dev/null', '--from=markdown', '--to=plain', '--lua-filter', new URL('./performance-context.lua', import.meta.url).pathname],
      cwd: root,
      env: { ...Deno.env.toObject(), QUARTO: probe, CLOUD_EXTENSION: extension, CLOUD_TEST_ROOT: root,
        CLOUD_PROBE_OUTPUT: root + '/result.json', CLOUD_FUNCTIONAL_PROBE: 'kept-functional-value',
        COURSE_PERF_MODE: mode, COURSE_PERF_PARENT_SPAN_ID: 'ghost-parent' },
      clearEnv: true, stdout: 'piped', stderr: 'piped',
    }).output();
    if (!result.success) throw new Error(new TextDecoder().decode(result.stderr));
    console.log(`native Pandoc scoped environment (${mode}): ok`);
  }
} finally { await Deno.remove(root, { recursive: true }); }
