export type { DiffEditorOptions, ModelOptions, WtoolMonacoDiffProps, WtoolDiffViewerProps } from './props'

export {
  WTOOL_DIFF_VIEWER_TAG,
  WtoolDiffViewer,
  register as registerDiffViewer,
  createDiffViewer,
  type DiffViewerProps,
  type DiffViewerInstance,
} from './createDiffViewer'
export { default as loader } from '@monaco-editor/loader'
