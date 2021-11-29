import { Text } from "@chakra-ui/layout";
import React, { ErrorInfo } from "react";
import { LoggingContext } from "../logging/logging-hooks";

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<{}, State> {
  context!: React.ContextType<typeof LoggingContext>;

  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, _errorInfo: ErrorInfo) {
    this.context?.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Text p={5}>
          Something went wrong. Download your HEX file for safe keeping, then
          refresh the page to reload.
        </Text>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.contextType = LoggingContext;

export default ErrorBoundary;
