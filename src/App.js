import React, { Component } from 'react';

import Heatmap from './Heatmap'

class App extends Component {
  render() {
    const rowLabels = [
      'Lily', 'Serena', 'Sebastian', 'Max', 'Diana'
    ]

    const columnLabels = [
      'Monday', 'Tuesday', 'Wednesday', 'Thursay', 'Friday', 'Saturday', 'Sunday'
    ]

    const data = [
      [30,30,30,0,120,200,60],
      [0,0,70,20,30,60,120],
      [0,0,0,0,0,0,180],
      [60,60,60,60,60,30,60],
      [30,30,0,0,0,60,0]
    ]

    return (
      <div className="App">
        <div>
          <div>Heatmap Chart</div>
          <Heatmap
            rowLabels={rowLabels}
            columnLabels={columnLabels}
            data={data}
            fixedWidth={false} />
        </div>
      </div>
    );
  }
}

export default App;
