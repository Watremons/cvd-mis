import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import Player, { PlaySourceMap } from 'griffith';

interface IVideoModalProps {
  visible: boolean;
  onClose: () => void;
  videoSrc: string;
  coverSrc: string;
}

export default function VideoModal(props: IVideoModalProps) {
  const { visible, onClose, videoSrc, coverSrc } = props;
  const [sources, setSources] = useState<PlaySourceMap>({});

  useEffect(() => {
    setSources({
      hd: {
        play_url: videoSrc
      },
      sd: {
        play_url: videoSrc
      }
    });
  }, [videoSrc]);

  return (
    <Modal
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
      <Player id="video-player" sources={sources} cover={coverSrc}></Player>
    </Modal>
  );
}
