import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("BlindSpot render error:", error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell items-center p-6">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5">
            <p className="text-sm font-semibold text-zinc-600">BlindSpot failed to load</p>
            <h1 className="mt-2 text-2xl font-bold">Runtime error</h1>
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-zinc-100 p-3 text-xs text-zinc-700">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
