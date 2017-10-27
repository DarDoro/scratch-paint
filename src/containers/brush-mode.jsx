import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import Modes from '../modes/modes';
import Blobbiness from '../helper/blob-tools/blob';
import {MIXED} from '../helper/style-path';

import {changeFillColor} from '../reducers/fill-color';
import {changeBrushSize} from '../reducers/brush-mode';
import {changeMode} from '../reducers/modes';
import {clearSelectedItems} from '../reducers/selected-items';
import {clearSelection} from '../helper/selection';

import BrushModeComponent from '../components/brush-mode/brush-mode.jsx';

class BrushMode extends React.Component {
    static get DEFAULT_COLOR () {
        return '#9966FF';
    }
    constructor (props) {
        super(props);
        bindAll(this, [
            'activateTool',
            'deactivateTool'
        ]);
        this.blob = new Blobbiness(
            this.props.onUpdateSvg, this.props.clearSelectedItems);
    }
    componentDidMount () {
        if (this.props.isBrushModeActive) {
            this.activateTool(this.props);
        }
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.isBrushModeActive && !this.props.isBrushModeActive) {
            this.activateTool();
        } else if (!nextProps.isBrushModeActive && this.props.isBrushModeActive) {
            this.deactivateTool();
        } else if (nextProps.isBrushModeActive && this.props.isBrushModeActive) {
            this.blob.setOptions({
                isEraser: false,
                ...nextProps.colorState,
                ...nextProps.brushModeState
            });
        }
    }
    shouldComponentUpdate (nextProps) {
        return nextProps.isBrushModeActive !== this.props.isBrushModeActive;
    }
    activateTool () {
        // TODO: Instead of clearing selection, consider a kind of "draw inside"
        // analogous to how selection works with eraser
        clearSelection(this.props.clearSelectedItems);
        // Force the default brush color if fill is MIXED or transparent
        const {fillColor} = this.props.colorState;
        if (fillColor === MIXED || fillColor === null) {
            this.props.onChangeFillColor(BrushMode.DEFAULT_COLOR);
        }
        this.blob.activateTool({
            isEraser: false,
            ...this.props.colorState,
            ...this.props.brushModeState
        });
    }
    deactivateTool () {
        this.blob.deactivateTool();
    }
    render () {
        return (
            <BrushModeComponent
                isSelected={this.props.isBrushModeActive}
                onMouseDown={this.props.handleMouseDown}
            />
        );
    }
}

BrushMode.propTypes = {
    brushModeState: PropTypes.shape({
        brushSize: PropTypes.number.isRequired
    }),
    clearSelectedItems: PropTypes.func.isRequired,
    colorState: PropTypes.shape({
        fillColor: PropTypes.string,
        strokeColor: PropTypes.string,
        strokeWidth: PropTypes.number
    }).isRequired,
    handleMouseDown: PropTypes.func.isRequired,
    isBrushModeActive: PropTypes.bool.isRequired,
    onChangeFillColor: PropTypes.func.isRequired,
    onUpdateSvg: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    brushModeState: state.scratchPaint.brushMode,
    colorState: state.scratchPaint.color,
    isBrushModeActive: state.scratchPaint.mode === Modes.BRUSH
});
const mapDispatchToProps = dispatch => ({
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    changeBrushSize: brushSize => {
        dispatch(changeBrushSize(brushSize));
    },
    handleMouseDown: () => {
        dispatch(changeMode(Modes.BRUSH));
    },
    onChangeFillColor: fillColor => {
        dispatch(changeFillColor(fillColor));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BrushMode);
