import React from 'react';

class TextEditor extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.onChange = this.onChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }


    onChange() {
        const html = this.ref.current.innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange({ value: html });
        }
        this.lastHtml = html;
    }

    // 写一个失去焦点的方法
    onBlur() {
        const html = this.ref.current.innerHTML;
        if (this.props.onBlur) {
            this.props.onBlur({ value: html });
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
    // 

    render() {
        const { value, width = '' } = this.props;
        return (
            <span contentEditable
                dangerouslySetInnerHTML={{ __html: value }}
                ref={this.ref}
                onInput={this.onChange}
                onBlur={this.onBlur}
                className="editable"
                placeholder="Optional Notes..."
            />
        )
    }
}

export default TextEditor;