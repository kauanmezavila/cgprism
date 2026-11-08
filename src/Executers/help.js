import t from "../core/Packages/colors.js";

const helpText = `
${t.yellow("cgprism")} <${t.blue("command")}> [${t.magenta("input")}] [${t.red("flag")}]

--${t.red("version")}                       Show the actual version.


Avaliable commands:
    <${t.blue("update")}>                    Update CGPrism and its dependencies.

    <${t.blue("doctor")}>                    Makes a simple health check.

    <${t.blue("list")}>                      List the models.

    <${t.blue("history")}>                   Show the commands hsitory.

    <${t.blue("install")}> [${t.magenta("input")}] [${t.red("flag")}]    Install models, check the README.md for more input infos.
    --${t.red("gls")}               To install gls pointers.

    <${t.blue("model")}> [${t.magenta("input")}] [${t.red("flag")}]      Manage runtime models, check the README.md for more input infos.
    --${t.red("new")}               Creates a new Modelfile.
    --${t.red("create")} --ollama")}   Create a new model in Ollama using a previous Modelcard.

    <${t.blue("run")}> [${t.magenta("input")}] [${t.red("flag")}]        Run a logged model (with Modelfile in CGPrism DB), check the README.md for more input infos.
    --${t.red("ollama")}                    Runs a model from Ollama with modelcard logged with CGPrism.

    <${t.blue("uninstall")}> [${t.magenta("input")}]         Uninstall models, check the README.md for more input infos.

    <${t.blue("hardware")}>                  Hardware and model compatibility.
    --${t.red("about")}             Hardware info.
    --${t.red("actual")}            Judges if the installed models can run based on an heuristic analyse.
    --${t.red("benchmark")}         Makes an heuristic analyse in the system

    <${t.blue("docs")}> [${t.magenta("input")}] [${t.red("flag")}]       Look the .md's in the repos on your terminal, check the README.md for more input infos.
    --${t.red("model")}             By name in db   
    --${t.red("provider")}          By provider
    --${t.red("owner")}             By owner   
    --${t.red("family")}            By family  
    --${t.red("architecture")}      By architecture
    --${t.red("format")}            By format  
    --${t.red("runtime")}           By runtime 
    --${t.red("status")}            By status  
`;

export function help() {
  console.log(helpText);
}
