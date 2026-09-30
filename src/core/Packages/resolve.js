export function resolve(command) {
  let provider;
  let target;
  let owner;
  let model;
  let file;

  const [cmd, arg] = command.split(" ");

  if (arg) {
    [provider, target] = arg.split("@");
  }

  if (target) {
    [owner, model, file] = target.split("/");
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
      file,
    };
  } else {
    result = {
      cmd,
      provider,
      providerUrl,
      target,
      owner,
      model,
      file,
    };
  }

  return result;
}
