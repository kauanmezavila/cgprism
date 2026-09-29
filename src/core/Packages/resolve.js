export function resolve(command) {
  let provider;
  let target;
  let owner;
  let model;

  const [cmd, arg] = command.split(" ");

  if (arg) {
    [provider, target] = arg.split("@");
  }

  if (target) {
    [owner, model] = target.split("/");
  }

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
