import { Controlled as CodeMirror } from 'react-codemirror2';
import { useRef } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';

const CodeMirrorEditor = ({ value, onChange }) => {
    const editor = useRef();
    const wrapper = useRef();
    const editorWillUnmount = () => {
        if (editor.current && editor.current.display && editor.current.display.wrapper) {
            editor.current.display.wrapper.remove();
        }
        if (wrapper.current) {
            wrapper.current.hydrated = false;
        }
    };


    return (
        <CodeMirror
            ref={wrapper}
            value={value}
            options={{
                mode: 'xml',
                theme: 'material',
                lineNumbers: true,
                lineWrapping: true,  // Ensure lines wrap if they are too long
            }}
            onBeforeChange={(editor, data, value) => {
                onChange(value);
            }}
            editorDidMount={(e) => editor.current = e}
            editorWillUnmount={editorWillUnmount}
        />
    );
};

export default CodeMirrorEditor;
