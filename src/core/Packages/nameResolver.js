export function resolveModelName(requiredName) {
  const original = requiredName;

  const name = requiredName
    .split(/[\\/]/)
    .pop()
    .replace(/\.(gguf|ggml|safetensors|bin|pt|pth|onnx)$/i, "");

  const lower = name.toLowerCase();

  const model = {
    original,
    name,
    family: null,
    version: null,
    parameterSize: null,
    parameterCount: null,
    quantization: null,
    precision: null,
    variant: null,
    instructionTuned: false,
    baseModel: false,
    distilled: false,
    contextLength: null,
    architecture: null,
    unknown: [],
  };

  const families = [
    "llama",
    "mistral",
    "mixtral",
    "qwen",
    "gemma",
    "phi",
    "deepseek",
    "command-r",
    "command",
    "falcon",
    "yi",
    "vicuna",
    "zephyr",
    "starcoder",
    "codellama",
    "granite",
    "olmo",
  ];

  for (const family of families) {
    if (lower.includes(family)) {
      model.family = family;
      break;
    }
  }

  const versionPatterns = [/\b(\d+(?:\.\d+){1,3})\b/, /\bv(\d+(?:\.\d+)*)\b/i];

  for (const regex of versionPatterns) {
    const match = lower.match(regex);

    if (match) {
      model.version = match[1];
      break;
    }
  }

  const parameterMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*([bm])\b/i);

  if (parameterMatch) {
    const value = Number(parameterMatch[1]);
    const unit = parameterMatch[2].toUpperCase();

    model.parameterSize = `${value}${unit}`;

    if (unit === "B") {
      model.parameterCount = value * 1_000_000_000;
    }

    if (unit === "M") {
      model.parameterCount = value * 1_000_000;
    }
  }

  const quantizationPatterns = [
    /\bq[2348](?:_[0-9]+)?_[a-z0-9]+\b/i,
    /\bq[2348](?:_[a-z0-9]+)?\b/i,
    /\bfp16\b/i,
    /\bfp32\b/i,
    /\bbf16\b/i,
    /\bint8\b/i,
    /\bint4\b/i,
  ];

  for (const regex of quantizationPatterns) {
    const match = lower.match(regex);

    if (match) {
      model.quantization = match[0].toUpperCase();
      break;
    }
  }

  if (/\bfp16\b/i.test(name)) {
    model.precision = "FP16";
  } else if (/\bfp32\b/i.test(name)) {
    model.precision = "FP32";
  } else if (/\bbf16\b/i.test(name)) {
    model.precision = "BF16";
  } else if (/\bint8\b/i.test(name)) {
    model.precision = "INT8";
  } else if (/\bint4\b/i.test(name)) {
    model.precision = "INT4";
  }

  const variants = [
    "instruct",
    "chat",
    "base",
    "coder",
    "code",
    "vision",
    "vl",
    "reasoning",
    "thinking",
    "uncensored",
    "creative",
    "math",
  ];

  const foundVariants = [];

  for (const variant of variants) {
    if (new RegExp(`\\b${variant}\\b`, "i").test(name)) {
      foundVariants.push(variant);
    }
  }

  model.variant = foundVariants.length ? foundVariants : null;

  model.instructionTuned = /\binstruct\b|\binstruction\b|\bchat\b/i.test(name);

  model.baseModel = /\bbase\b/i.test(name);

  model.distilled = /\bdistill(ed)?\b/i.test(name);

  const contextMatch = lower.match(/\b(\d+)\s*k\b/i);

  if (contextMatch) {
    model.contextLength = Number(contextMatch[1]) * 1024;
  }

  if (model.family === "llama") {
    model.architecture = "LLaMA";
  } else if (model.family === "mistral" || model.family === "mixtral") {
    model.architecture = "Mistral";
  } else if (model.family === "qwen") {
    model.architecture = "Qwen";
  } else if (model.family === "gemma") {
    model.architecture = "Gemma";
  } else if (model.family === "phi") {
    model.architecture = "Phi";
  } else if (model.family === "deepseek") {
    model.architecture = "DeepSeek";
  }

  return model;
}
