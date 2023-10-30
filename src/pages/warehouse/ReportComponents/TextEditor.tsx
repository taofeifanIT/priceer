import React from 'react';

class TextEditor extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.onChange = this.onChange.bind(this);
    }


    onChange() {
        const html = this.ref.current.innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange({ value: html });
        }
        this.lastHtml = html;
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.value !== this.ref.current.innerHTML;
    }

    componentDidUpdate() {
        if (this.props.value !== this.ref.current.innerHTML) {
            this.ref.current.innerHTML = this.props.value;
        }
    }

    render() {
        const { value } = this.props;
        return (
            <div style={{ display: 'inline-block' }}>
                <div contentEditable
                    dangerouslySetInnerHTML={{ __html: value }}
                    ref={this.ref}
                    onInput={this.onChange}
                    onBlur={this.onChange}
                    className="editable"
                    placeholder="Optional Notes..."
                />
            </div>
        )
    }
}

export default TextEditor;