export function resolve(command) {
  const [cmd, arg] = command.split(" ");
  const [provider, target] = arg.split("@");
  const [owner, model] = target.split("/");

  let providerUrl = undefined;

  if (provider === "hg") {
    providerUrl = "https://huggingface.co/";
  } else {
    providerUrl = undefined;
  }

  let result = undefined;

  if (cmd === "install") {
    result = {
      provider,
      providerUrl,
      target,
      owner,
      model,
    };
  } else if (cmd === "uninstall") {
    result = {
      provider,
      target,
      owner,
      model,
    };
  } else {
    result = {
      cmd,
      provider,
      providerUrl,
      target,
      owner,
      model,
    };
  }

  return result;
}
