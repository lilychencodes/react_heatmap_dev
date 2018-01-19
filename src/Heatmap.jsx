import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import './Heatmap.css'

const GRAY = '#EFF3F7'
const BLUES = [
  'rgba(140, 204, 250, 0.50)',
  '#8CCCFA',
  '#1991EB',
  '#007AD4',
  '#005DA2',
]

const CHARACTER_WIDTH = 9

export default class Heatmap extends Component {
  static propTypes = {
     columnLabels: PropTypes.array,
     rowLabels: PropTypes.array,
     data: PropTypes.array,
     showLegend: PropTypes.bool,
     cellHeight: PropTypes.number,
     cellWidth: PropTypes.number,
     showIntervalColumn: PropTypes.bool,
     colors: PropTypes.array,
     noDataColor: PropTypes.string,
     showToolTip: PropTypes.bool,
     columnLabelPosition: PropTypes.string,
     fixedWidth: PropTypes.bool
  }

  static defaultProps = {
    cellHeight: 40,
    cellWidth: 40,
    showIntervalColumn: false,
    showLegend: true,
    columnLabels: [],
    rowLabels: [],
    data: [[]],
    colors: BLUES,
    noDataColor: GRAY,
    showToolTip: true,
    columnLabelPosition: 'bottom',
    fixedWidth: true
  }

  constructor(props) {
    super(props)

    this.state = {
      columnLabelWidth: 0,
      rowLabelWidth: 0,
      cellWidth: 0,
      hoveredIndices: []
    }

    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    this.setState({
      columnLabelWidth: this.computeColumnLabelWidth(this.props),
      rowLabelWidth: this.computeRowLabelWidth(this.props),
      cellWidth: this.computeCellWidth(this.props)
    })
  }

  computeCellWidth(props) {
    const { fixedWidth, cellWidth, columnLabels } = props

    if (fixedWidth) {
      return cellWidth
    } else {
      const tableWidth = this.refs.heatmap.getBoundingClientRect().width
      return (tableWidth - this.computeRowLabelWidth(props) ) / columnLabels.length
    }
  }

  computeRowLabelWidth(props) {
    const { rowLabels } = props

    if (rowLabels.length < 1) {
      return 0
    }

    const lengths = rowLabels.map(label => label.length)
    const longestLabelCharacter = Math.max(...lengths)

    return longestLabelCharacter * CHARACTER_WIDTH
  }

  computeColumnLabelWidth(props) {
    const { columnLabels } = props

    if (columnLabels.length < 1) {
      return 0
    }

    const lengths = columnLabels.map(label => label.length)
    const longestLabelCharacter = Math.max(...lengths)

    return Math.max(longestLabelCharacter * CHARACTER_WIDTH, 50)
  }

  computeBackgroundColor(value) {
    const { data, colors, noDataColor } = this.props
    const flattened = [].concat.apply([], data)

    const min = Math.min(...flattened)

    if (value === min || typeof value !== 'number') {
      return noDataColor
    }

    const max = Math.max(...flattened)
    const range = Math.ceil(max / colors.length)

    for (var i = 0; i < colors.length; i++) {
      const currentMin = (i + 1) * range
      if (value < currentMin) {
        return colors[i]
      }
    }

    return colors[colors.length - 1]
  }

  renderColumnLabels() {
    const { columnLabels, showIntervalColumn, fixedWidth } = this.props
    const { columnLabelWidth, rowLabelWidth, cellWidth } = this.state

    const topRowLabels = columnLabels.map((columnLabel, index) => {
      const label = (!showIntervalColumn && cellWidth > 20) ? columnLabel : (index % 3 === 0 ? columnLabel : '')
      const minWidth = fixedWidth ? cellWidth + 4 : cellWidth
      return (
        <div key={index} style={{minWidth, height: columnLabelWidth}} className='column-label-container'>
          <div
            style={{height: cellWidth, lineHeight: `${cellWidth}px`, top: `-${Math.floor(cellWidth / 2)}px`, width: columnLabelWidth}}
            className='column-label-rotated-text'>
            {label}
          </div>
        </div>
      )
    })

    const style = {
      minWidth: rowLabelWidth,
      maxWidth: rowLabelWidth
    }

    return (
      <div className='flex-row'>
        <div style={style}></div>
        {topRowLabels}
      </div>
    )
  }

  renderRows() {
    const { data, columnLabels, cellHeight, rowLabels, fixedWidth } = this.props
    const { rowLabelWidth, cellWidth, hoveredIndices } = this.state

    return data.map((row, rowIndex) => {
      const label = rowLabels[rowIndex]
      const rowData = row.map((value, colIndex) => {
        const style = {
          backgroundColor: this.computeBackgroundColor(value),
          width: cellWidth,
          height: cellHeight,
          border: '2px solid white',
        }

        if (fixedWidth) {
          style.minWidth = cellWidth
        }

        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            onMouseEnter={() => this.setState({hoveredIndices: [rowIndex, colIndex]})}
            onMouseLeave={() => this.setState({hoveredIndices: []})}
            className='tile'
            style={style}>
            {hoveredIndices[0] === rowIndex && hoveredIndices[1] === colIndex && <div className='hover-info'>{label}, {columnLabels[colIndex]}: <strong>{value}</strong></div>}
          </div>
        )
      })

      const style = {
        minWidth: rowLabelWidth,
        maxWidth: rowLabelWidth
      }

      return (
        <div key={rowIndex} className='flex-row'>
          <div style={style}>{label}</div>
          {rowData}
        </div>
      )
    })
  }

  renderLegend() {
    const { noDataColor, colors } = this.props

    const panels = [noDataColor].concat(colors).map(color => {
      return <div key={color} style={{backgroundColor: color, width: 20, height: 20}}></div>
    })

    return (
      <div className='legend-panel'>
        <div className='legend-label'>Less</div>
        {panels}
        <div className='legend-label'>More</div>
      </div>
    )
  }

  render() {
    return (
      <div ref='heatmap' className='heatmap'>
        {this.props.showLegend && this.renderLegend()}
        <div className='heatmap-data'>
          {this.renderRows()}
          {this.renderColumnLabels()}
        </div>
      </div>
    )
  }
}
