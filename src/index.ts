import { ReactNode, Component } from 'react';
import { assert } from '@sleuren/sleuren-js/src/util';

interface Context {
    react: {
        componentStack: Array<String>;
    };
}

interface Props {
    children: ReactNode;
}

export class SleurenErrorBoundary extends Component {
    sleuren = typeof window !== 'undefined' ? window.sleuren : null;

    constructor(props: Props) {
        super(props);

        assert(
            this.sleuren,
            `Sleuren React Plugin: the Sleuren Client could not be found.
            Errors in your React components will not be reported.`,
            this.sleuren ? this.sleuren.debug : false
        );
    }

    componentDidCatch(error: Error, reactErrorInfo: React.ErrorInfo) {
        reportReactError(error, reactErrorInfo, this.sleuren);
    }

    render() {
        return this.props.children;
    }
}

function formatReactComponentStack(stack: String) {
    return stack.split(/\s*\n\s*/g).filter(line => line.length > 0);
}

export function reportReactError(error: Error, reactErrorInfo: React.ErrorInfo, sleuren: Sleuren | null) {
    if (sleuren) {
        const context: Context = {
            react: {
                componentStack: formatReactComponentStack(reactErrorInfo.componentStack),
            },
        };

        sleuren.report(error, context, { react: { errorInfo: reactErrorInfo } });
    }
}
