import React from "react";
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div>Đã có lỗi xảy ra.</div>;
    return this.props.children;
  }
}
export default ErrorBoundary;