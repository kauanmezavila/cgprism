export function resolve(command) {
  let provider;
  let target;
  let owner;
  let model;
  let file;

  const args = command.trim().split(/\s+/);
  const cmd = args.shift();

  const arg = args.find((a) => !a.startsWith("-"));

  if (arg) {
    [provider, target] = arg.split("@");
  }

  if (target) {
    [owner, model, file] = target.split("/");
  }

  const flags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg.startsWith("-")) continue;

    const [key, inlineValue] = arg.replace(/^-+/, "").split("=");

    const value =
      inlineValue !== undefined
        ? inlineValue
        : args[i + 1]?.startsWith("-")
          ? true
          : (args[++i] ?? true);

    flags[key] = value;
  }

  let providerUrl;

  if (provider === "hg") {
    providerUrl = "https://huggingface.co/";
  } else if (provider === "ms") {
    providerUrl = "https://www.modelscope.ai/";
  }

  const result = {
    cmd,
    provider,
    providerUrl,
    target,
    owner,
    model,
    file,
    ...flags,
  };

  return result;
}
