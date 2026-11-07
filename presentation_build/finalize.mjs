import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root='C:/Users/user/Downloads/rentbridge-fullstack/rentbridge';
const skill='C:/Users/user/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const result=await finalizePresentation({explicitTotalSlideCount:10,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],workspaceDir:root,candidatePath:path.join(root,'presentation_build','RentBridge_Project_Overview_draft.pptx'),finalPath:path.join(root,'deliverables','RentBridge_Project_Overview_2026-11-07.pptx'),pythonExecutable:'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(root,'presentation_build','RentBridge_Project_Overview_2026-11-07.validation.json')});
console.log(JSON.stringify(result,null,2));

