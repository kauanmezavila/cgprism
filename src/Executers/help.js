const helpText = `
cgprism <command> [input] [flag]

--version                       Show the actual version.


Avaliable commands:
    <update>                    Update CGPrism and its dependencies.

    <doctor>                    Makes a simple health check.

    <list>                      List the models.

    <history>                   Show the commands hsitory.

    <install> [input] [flag]    Install models, check the README.md for more input infos.
    --gls               To install gls pointers.

    <model> [input] [flag]      Manage runtime models, check the README.md for more input infos.
    --new               Creates a new Modelfile.
    --create --ollama   Create a new model in Ollama using a previous Modelcard.

    <run> [input] [flag]        Run a logged model (with Modelfile in CGPrism DB), check the README.md for more input infos.
    --ollama                    Runs a model from Ollama with modelcard logged with CGPrism.

    <uninstall> [input]         Uninstall models, check the README.md for more input infos.

    <hardware>                  Hardware and model compatibility.
    --about             Hardware info.
    --actual            Judges if the installed models can run based on an heuristic analyse.
    --benchmark         Makes an heuristic analyse in the system

    <docs> [input] [flag]       Look the .md's in the repos on your terminal, check the README.md for more input infos.
    --model             By name in db   
    --provider          By provider
    --owner             By owner   
    --family            By family  
    --architecture      By architecture
    --format            By format  
    --runtime           By runtime 
    --status            By status  
`;

export function help() {
  console.log(helpText);
}
