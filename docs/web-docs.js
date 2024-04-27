"use strict";
(() => {
  // src/web-docs.ts
  (async () => {
    const { wax } = window;
    console.log("wax", wax);
    const $svg = document.getElementById("svgView");
    const $consoleContainer = document.getElementById("consoleView");
    const $console = $consoleContainer?.querySelector("code");
    async function loadExample(name) {
      return await (await fetch(`/examples/${name}`)).text();
    }
    function renderResult({ output }) {
      if (output.startsWith("<svg")) {
        $svg.style.display = "block";
        $svg.innerHTML = output;
        $console.style.display = "none";
        $console.innerText = "";
      } else {
        $svg.style.display = "none";
        $svg.innerHTML = "";
        $console.style.display = "block";
        $console.innerText = output;
      }
    }
    const $exampleSelect = document.getElementById("example");
    const $waxCode = document.getElementById("wax-code");
    const $watCode = document.getElementById("wat-code");
    let exampleCache = {};
    async function onExampleChange() {
      const { value } = $exampleSelect;
      const code = exampleCache[value] || (exampleCache[value] = await loadExample(value));
      $waxCode.innerText = code;
      const watCode = await wax.toWat(code);
      $watCode.innerText = watCode;
      const wasm = await wax.start(wax.wat2wasm(watCode));
      renderResult(await wasm.run());
      console.log("example:", value, "ast:", await wax.toJson(code));
    }
    $exampleSelect?.addEventListener("change", onExampleChange);
    onExampleChange();
  })().catch(console.error);
})();
//# sourceMappingURL=web-docs.js.map
