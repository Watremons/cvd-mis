import React, { useEffect, useState } from 'react';
import { Heatmap, HeatmapConfig } from '@ant-design/plots';
import { Button, Modal } from 'antd';
import { Datum } from '@antv/g2plot';

interface IHeatmapProps {
  visible: boolean;
  onClose: () => void;
  heatmapData: Entity.Point[];
  heatmapBackground: string;
}

export default function HeatmapModal(props: IHeatmapProps) {
  const { visible, onClose, heatmapData, heatmapBackground } = props;
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  useEffect(() => {
    const imageObj = new Image();
    imageObj.src = heatmapBackground;
    if (imageObj.complete) {
      setWidth(imageObj.width);
      setHeight(imageObj.height);
    } else {
      imageObj.onload = function () {
        setWidth(imageObj.width);
        setHeight(imageObj.height);
        imageObj.onload = null;
      };
    }
  }, [heatmapBackground]);
  console.log('width', width);
  console.log('height', height);

  return (
    <Modal
      width={width}
      visible={visible}
      keyboard
      maskClosable
      mask
      destroyOnClose
      closable={false}
      centered
      onCancel={() => onClose()}
      footer={
        <Button type="primary" onClick={() => onClose()}>
          关闭
        </Button>
      }
    >
      <Heatmap
        width={width}
        height={height}
        data={heatmapData}
        xField="x"
        yField="y"
        xAxis={{
          position: 'top',
          min: 0
        }}
        yAxis={{
          position: 'left',
          min: 0
        }}
        reflect="y"
        colorField="value"
        type="density"
        color="#F51D27-#FA541C-#FF8C12-#FFC838-#FAFFA8-#80FF73-#12CCCC-#1890FF-#6E32C2"
        legend={{
          position: 'bottom'
        }}
        tooltip={{
          showTitle: false,
          fields: ['x', 'y', 'value'],
          formatter: (datum: Datum) => ({ name: `坐标: (${datum.x},${datum.y})`, value: `${datum.value}次` })
        }}
        annotations={[
          {
            type: 'image',
            start: ['min', 'max'],
            end: ['max', 'min'],
            src: heatmapBackground
          }
        ]}
      />
    </Modal>
  );
}
