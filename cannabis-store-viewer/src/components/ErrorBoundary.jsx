import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          margin: "40px auto", maxWidth: 640, padding: "24px 28px",
          background: "#fff0f0", border: "1px solid #f5c6cb",
          borderRadius: 10, fontFamily: "monospace", fontSize: 14,
        }}>
          <strong style={{ color: "#c0392b" }}>Runtime error — please share this with support:</strong>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#333" }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
