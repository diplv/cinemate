import os

with open("src/routes/convert.ts", "r") as f:
    code = f.read()

code = code.replace('import { convertAmlToCube } from "../services/aml-extractor.service.js";\n', '')

old_exec = """      let pipelineInputPath = inputPath;

      // Extract CUBE if it's an AML file
      if (ext.endsWith(".aml")) {
        app.log.info("Extracting CUBE from uploaded AML file...");
        pipelineInputPath = await convertAmlToCube(fileBuffer);
      }

      // Execute pipeline
      const result = await executePipeline(pipelineInputPath, tempDir, filename);"""

new_exec = """      // Execute pipeline
      const result = await executePipeline(inputPath, tempDir, filename);"""

code = code.replace(old_exec, new_exec)

with open("src/routes/convert.ts", "w") as f:
    f.write(code)

print("Patched convert.ts")
