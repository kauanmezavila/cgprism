import * as os from "node:os";
import si from "systeminformation";
import t from "../core/Packages/colors.js";
import { getModels } from "../core/ModelsManager/get.js";

export async function getSystemInfo() {
  const [
    osInfo,
    cpu,
    cpuFlags,
    memory,
    memoryLayout,
    graphics,
    system,
    bios,
    baseboard,
    disks,
    filesystems,
    network,
    battery,
    load,
    processes,
    time,
    users,
    uuid,
    blockDevices,
  ] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.cpuFlags(),
    si.mem(),
    si.memLayout(),
    si.graphics(),
    si.system(),
    si.bios(),
    si.baseboard(),
    si.diskLayout(),
    si.fsSize(),
    si.networkInterfaces(),
    si.battery(),
    si.currentLoad(),
    si.time(),
    si.users(),
    si.uuid(),
    si.blockDevices(),
  ]);

  return {
    collectedAt: new Date().toISOString(),

    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      release: os.release(),
      uptime: os.uptime(),
      os: osInfo,
      system,
      uuid,
    },

    cpu: {
      ...cpu,
      flags: cpuFlags,
      logicalCores: os.cpus().length,
      load: load,
    },

    memory: {
      ...memory,
      modules: memoryLayout,
      native: {
        total: os.totalmem(),
        free: os.freemem(),
      },
    },

    graphics,

    motherboard: {
      baseboard,
      bios,
    },

    storage: {
      disks,
      filesystems,
      blockDevices,
    },

    network,

    battery,

    time,

    users,
  };
}

export function analyzeModelCapability(system) {
  const GiB = 1024 ** 3;

  const totalRAM = system.memory.total / GiB;

  const availableRAM =
    (system.memory.available ??
      system.memory.free ??
      system.memory.total - system.memory.used) / GiB;

  const usableRAM = Math.max(0, availableRAM * 0.8);

  const controllers = system.graphics?.controllers ?? [];

  const gpuList = controllers.map((gpu) => ({
    name: `${gpu.vendor ?? ""} ${gpu.model ?? "Unknown GPU"}`.trim(),
    vram: (gpu.vram ?? 0) / 1024,
    vendor: gpu.vendor ?? "Unknown",
  }));

  const totalVRAM = gpuList.reduce((sum, gpu) => sum + gpu.vram, 0);

  const usableVRAM = totalVRAM * 0.85;

  const hybridMemory = usableRAM + usableVRAM;

  const quantizations = {
    Q2: 2.5,
    Q3: 3.5,
    Q4: 4.5,
    Q5: 5.5,
    Q6: 6.5,
    Q8: 8.5,
  };
  function maxParameters(memoryGiB, bits) {
    const memoryPerBillion = (bits / 8) * 1.1;

    return Math.max(0, (memoryGiB - 1.5) / memoryPerBillion);
  }

  const parameterLimits = {};

  for (const [quant, bits] of Object.entries(quantizations)) {
    parameterLimits[quant] = {
      cpu: Number(maxParameters(usableRAM, bits).toFixed(1)),
      gpu: Number(maxParameters(usableVRAM, bits).toFixed(1)),
      hybrid: Number(maxParameters(hybridMemory, bits).toFixed(1)),
    };
  }

  function estimateContext(paramsB, quant = 4) {
    const modelMemory = paramsB * (quant / 8) * 1.1;

    const remainingRAM = Math.max(0, usableRAM - modelMemory - 1);

    const cachePer1K = paramsB * 0.014;

    return Math.floor(remainingRAM / cachePer1K) * 1024;
  }

  const contextLimits = {};

  for (const params of [1, 3, 7, 13, 30, 70]) {
    contextLimits[`${params}B`] = {
      Q4: estimateContext(params, 4),
      Q8: estimateContext(params, 8),
    };
  }

  return {
    hardware: {
      ram: {
        total: Number(totalRAM.toFixed(2)),
        available: Number(availableRAM.toFixed(2)),
        usable: Number(usableRAM.toFixed(2)),
      },

      gpu: gpuList,

      vram: {
        total: Number(totalVRAM.toFixed(2)),
        usable: Number(usableVRAM.toFixed(2)),
      },

      cpu: {
        model: system.cpu?.brand ?? system.cpu?.model,
        threads: system.cpu?.logicalCores ?? system.cpu?.cores,
      },
    },

    limits: {
      maxParameters: parameterLimits,
      context: contextLimits,
    },

    execution: {
      cpuInference: usableRAM >= 2,
      gpuInference: usableVRAM >= 2,
      hybridInference: usableRAM >= 2 && usableVRAM >= 2,
    },

    metadata: {
      unit: "Billions of parameters / GiB",
      quantization: "Estimated GGUF quantization",
      confidence: "Low - theoretical heuristic",
      warning:
        "Actual capacity depends on architecture, KV cache, backend and runtime.",
    },
  };
}

export function heuristicAnalyze(limits, execution, metadata) {
  const line = t.dim("-".repeat(48));
  0;
  console.log(`
${t.yellow("Hardware Capability Heuristic Analyzer")}
${line}
${t.bold("PARAMETER LIMITS (BILLIONS)")}

${Object.entries(limits.maxParameters)
  .map(
    ([quant, values]) =>
      `  ${quant.padEnd(4)} CPU: ${values.cpu}B | GPU: ${values.gpu}B | Hybrid: ${values.hybrid}B`,
  )
  .join("\n")}

${line}
${t.bold("CONTEXT CAPACITY (TOKENS)")}

${Object.entries(limits.context)
  .map(
    ([model, values]) =>
      `  ${model.padEnd(5)} Q4: ${values.Q4.toLocaleString()} | Q8: ${values.Q8.toLocaleString()}`,
  )
  .join("\n")}

${line}
${t.bold("EXECUTION CAPABILITIES")}

    CPU inference:    ${execution.cpuInference ? "Available" : "Unavailable"}
    GPU inference:    ${execution.gpuInference ? "Possible" : "Unavailable"}
    Hybrid inference: ${execution.hybridInference ? "Possible" : "Unavailable"}

${line}
${t.bold("ESTIMATION")}

    Confidence: ${metadata.confidence}
    Method: ${metadata.quantization}
    Unit: ${metadata.unit}

${t.dim(`[Remenber: ` + metadata.warning + `]`)}
`);
}

export async function analyzeActualModels(system) {
  const GIB = 1024 ** 3;

  const QUANTIZATION_BITS = {
    Q2: 2.6,
    Q3: 3.8,
    Q4: 4.8,
    Q5: 5.7,
    Q6: 6.6,
    Q8: 8.5,
    FP16: 16,
  };

  const RUNTIME_OVERHEAD = {
    cpu: 1.2,
    gpu: 1.15,
    hybrid: 1.25,
  };

  function parseParameters(value) {
    if (value == null) return null;

    if (typeof value === "number") {
      if (!Number.isFinite(value) || value <= 0) return null;

      return value < 1000 ? value * 1e9 : value;
    }

    const text = String(value).trim().toUpperCase();

    const match = text.match(/^([\d.]+)\s*([KMBT]?)$/);
    if (!match) return null;

    const amount = Number(match[1]);
    const suffix = match[2];

    if (!Number.isFinite(amount) || amount <= 0) return null;

    const multipliers = {
      "": 1e9,
      K: 1e3,
      M: 1e6,
      B: 1e9,
      T: 1e12,
    };

    return amount * multipliers[suffix];
  }

  function getModelParameters(model) {
    return parseParameters(
      model.parameters ?? model.parameter_count ?? model.params,
    );
  }

  function detectQuantization(model) {
    const candidates = [
      model.quantization,
      model.name,
      model.id,
      model.ollama_model_id,
      model.filename,
      model.file,
    ].filter(Boolean);

    const patterns = [
      { regex: /\bQ2(?:_K(?:_S|_M|_L)?)?\b/i, label: "Q2" },
      { regex: /\bQ3(?:_K(?:_S|_M|_L)?)?\b/i, label: "Q3" },
      { regex: /\bQ4(?:_K(?:_S|_M|_L)?)?\b/i, label: "Q4" },
      { regex: /\bQ5(?:_K(?:_S|_M|_L)?)?\b/i, label: "Q5" },
      { regex: /\bQ6(?:_K(?:_S|_M|_L)?)?\b/i, label: "Q6" },
      { regex: /\bQ8(?:_0|_K(?:_S|_M|_L)?)?\b/i, label: "Q8" },
      { regex: /\bF16|FP16|FLOAT16|HALF\b/i, label: "FP16" },
      { regex: /\bF32|FP32|FLOAT32\b/i, label: "FP32" },
    ];

    for (const candidate of candidates) {
      for (const pattern of patterns) {
        const match = String(candidate).match(pattern.regex);

        if (match) {
          return {
            quantization: pattern.label,
            detectedFrom:
              candidate === model.quantization ? "metadata" : "name",
          };
        }
      }
    }

    const params = getModelParameters(model);
    const sizeBytes = Number(model.size_bytes);

    if (params && sizeBytes > 0) {
      const bitsPerParameter = (sizeBytes * 8) / params;

      if (bitsPerParameter <= 3.2) {
        return {
          quantization: "Q2",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 4.2) {
        return {
          quantization: "Q3",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 5.2) {
        return {
          quantization: "Q4",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 6.2) {
        return {
          quantization: "Q5",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 7.3) {
        return {
          quantization: "Q6",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 10) {
        return {
          quantization: "Q8",
          detectedFrom: "size_heuristic",
        };
      }

      if (bitsPerParameter <= 18) {
        return {
          quantization: "FP16",
          detectedFrom: "size_heuristic",
        };
      }
    }

    return {
      quantization: "UNKNOWN",
      detectedFrom: "unknown",
    };
  }

  function estimateWeightsGiB(parameters, bitsPerParameter) {
    if (!parameters || !bitsPerParameter) return null;

    return (parameters * bitsPerParameter) / 8 / GIB;
  }

  function evaluate(requiredGiB, availableGiB, overhead) {
    if (requiredGiB == null || availableGiB == null || availableGiB <= 0) {
      return {
        status: "UNKNOWN",
        requiredGiB: null,
        availableGiB: availableGiB ?? null,
      };
    }

    const totalRequired = requiredGiB * overhead;

    let status;

    if (totalRequired <= availableGiB * 0.75) {
      status = "PASS";
    } else if (totalRequired <= availableGiB) {
      status = "LIMITED";
    } else {
      status = "FAIL";
    }

    return {
      status,
      requiredGiB: Number(totalRequired.toFixed(2)),
      availableGiB: Number(availableGiB.toFixed(2)),
      headroomGiB: Number((availableGiB - totalRequired).toFixed(2)),
    };
  }

  function analyzeQuantizations(model, ramGiB, vramGiB) {
    const parameters = getModelParameters(model);

    if (!parameters) {
      return {
        error: "Not able to determine parameters for this model.",
      };
    }

    return Object.entries(QUANTIZATION_BITS).map(([quantization, bits]) => {
      const weightsGiB = estimateWeightsGiB(parameters, bits);

      return {
        quantization,
        estimatedWeightsGiB: Number(weightsGiB.toFixed(2)),

        cpu: evaluate(weightsGiB, ramGiB, RUNTIME_OVERHEAD.cpu),

        gpu: evaluate(weightsGiB, vramGiB, RUNTIME_OVERHEAD.gpu),

        hybrid: evaluate(weightsGiB, ramGiB + vramGiB, RUNTIME_OVERHEAD.hybrid),
      };
    });
  }

  const ramBytes = Number(
    system?.memory?.available ?? system?.memory?.free ?? 0,
  );

  const ramGiB = ramBytes > 0 ? ramBytes / GIB : null;

  const controllers = system?.graphics?.controllers ?? [];

  const gpuList = controllers.map((gpu) => {
    const vramMB = Number(gpu.vram);

    return {
      name: gpu.name ?? gpu.model ?? "GPU unknown",
      vendor: gpu.vendor ?? "Unknown",
      vramGiB: vramMB > 0 ? vramMB / 1024 : null,
    };
  });

  const knownVRAM = gpuList
    .map((gpu) => gpu.vramGiB)
    .filter((value) => value != null);

  const vramGiB =
    knownVRAM.length > 0
      ? knownVRAM.reduce((sum, value) => sum + value, 0)
      : null;

  const models = await getModels();

  if (!Array.isArray(models)) {
    throw new Error(
      "BRUTAL > No models found (hint: try install some models, or else, your CGPrism local interface is broken (SO broken))",
    );
  }

  const analyzedModels = models.map((model) => {
    const parameters = getModelParameters(model);
    const quantizationInfo = detectQuantization(model);

    const actualSizeBytes = Number(model.size_bytes);
    const actualSizeGiB = actualSizeBytes > 0 ? actualSizeBytes / GIB : null;

    let estimatedActualWeightsGiB = actualSizeGiB;

    if (
      estimatedActualWeightsGiB == null &&
      parameters &&
      quantizationInfo.quantization !== "UNKNOWN"
    ) {
      const bits = QUANTIZATION_BITS[quantizationInfo.quantization];

      if (bits) {
        estimatedActualWeightsGiB = estimateWeightsGiB(parameters, bits);
      }
    }

    const actualCompatibility = {
      cpu: evaluate(estimatedActualWeightsGiB, ramGiB, RUNTIME_OVERHEAD.cpu),

      gpu: evaluate(estimatedActualWeightsGiB, vramGiB, RUNTIME_OVERHEAD.gpu),

      hybrid: evaluate(
        estimatedActualWeightsGiB,
        ramGiB != null && vramGiB != null ? ramGiB + vramGiB : null,
        RUNTIME_OVERHEAD.hybrid,
      ),
    };

    return {
      ...model,

      analysis: {
        parameters,

        quantization: {
          detected: quantizationInfo.quantization,
          detectedFrom: quantizationInfo.detectedFrom,
        },

        actualModel: {
          sizeGiB:
            actualSizeGiB != null ? Number(actualSizeGiB.toFixed(2)) : null,

          estimatedWeightsGiB:
            estimatedActualWeightsGiB != null
              ? Number(estimatedActualWeightsGiB.toFixed(2))
              : null,

          compatibility: actualCompatibility,
        },

        quantizationAnalysis: analyzeQuantizations(model, ramGiB, vramGiB),
      },
    };
  });

  const field = (label, value, width = 20) =>
    `${label.padEnd(width)} ${t.green(String(value ?? "ㅤㅤㅤㅤㅤㅤㅤㅤ").padEnd(width))}`;
  console.log(`\n${t.green(analyzedModels.length)} model(s) found:\n`);
  analyzedModels.forEach((analyzedModels, index) => {
    console.log(
      t.bold(
        `> ${t.green(index + 1)}. ${t.bold(t.gradient(`${analyzedModels.provider}/${analyzedModels.owner}/${analyzedModels.name}`))} ${t.bold(t.dim(t.magenta(`(ID:${analyzedModels.id})`)))}`,
      ) +
        `\n   ${field("Format:", analyzedModels.format, 15)} | ${field("Runtime:", analyzedModels.runtime, 15)} |` +
        `\n   ${field("Family:", analyzedModels.family, 15)} | ${field("Architecture:", analyzedModels.architecture, 15)} |` +
        `\n   ${field("Parameters (B):", analyzedModels.parameters, 15)} | ${field("Quantization:", analyzedModels.quantization, 15)} |` +
        `\n   ${field("Size (bytes):", analyzedModels.size_bytes, 15)} |                                 |` +
        `\n   ------------------------------------------------------------------|` +
        `\n   ${field("Ollama model ID:", analyzedModels.ollama_model_id, 28)} |` +
        `\n   ------------------------------------------------------------------|` +
        `\n   ${field("CPU:", analyzedModels.analysis.actualModel.compatibility.cpu.status, 32)} |` +
        `\n   ${field("GPU:", analyzedModels.analysis.actualModel.compatibility.gpu.status, 32)} |` +
        `\n   ${field("Hybrid:", analyzedModels.analysis.actualModel.compatibility.hybrid.status, 32)} |\n`,
    );
  });

  return {
    hardware: {
      ramGiB: ramGiB != null ? Number(ramGiB.toFixed(2)) : null,

      vramGiB: vramGiB != null ? Number(vramGiB.toFixed(2)) : null,

      gpus: gpuList,
    },

    models: analyzedModels,
  };
}
